"""Admin draw workflow. Production mutation is deliberately disabled."""
import hashlib
import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_admin, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AuditLog, Campaign, Coupon, DrawRun, DrawSnapshot, DrawWinner, Entry, User
from app.services.draw import ALGORITHM_VERSION, canonical, digest, select_winners
from app.services.redemption import utcnow

admin_router = APIRouter(prefix="/admin/draws", tags=["admin draws"])
public_router = APIRouter(prefix="/draws", tags=["draws"])


def local_only(request: Request):
    check_origin(request)
    if settings.APP_ENV not in ("development", "test") or not settings.ENABLE_LOCAL_DRAW:
        raise HTTPException(403, "Draw mutations are disabled outside enabled local/test mode")


def log(db, user, request, action, run, extra=None):
    db.add(AuditLog(admin_email=user.email, action=action, details=canonical({"campaign_id": str(run.campaign_id), "draw_id": str(run.id), "snapshot_hash": db.get(DrawSnapshot, run.id).hash, **(extra or {})}), ip_address=request.client.host if request.client else "unknown", created_at=utcnow()))


def locked(db, campaign_id):
    run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == campaign_id).with_for_update())
    if run is None:
        raise HTTPException(404, "Draw has not been prepared")
    return run


def detail(db, run, include_private=True):
    snapshot = db.get(DrawSnapshot, run.id)
    result = {"id": str(run.id), "campaign_id": str(run.campaign_id), "status": run.status,
              "snapshot_hash": snapshot.hash, "seed_hash": run.seed_hash, "algorithm_version": run.algorithm_version,
              "eligible_entries": snapshot.entry_count, "eligible_participants": snapshot.participant_count,
              "winner_count": snapshot.winner_count,
              "prepared_at": run.prepared_at, "approved_at": run.approved_at,
              "executed_at": run.executed_at, "published_at": run.published_at}
    if include_private and run.status in ("completed", "published"):
        result["winners"] = [{"rank": w.rank, "entry_id": str(w.entry_id), "user_id": str(w.user_id)} for w in db.scalars(select(DrawWinner).where(DrawWinner.run_id == run.id).order_by(DrawWinner.rank))]
    return result


@admin_router.get("")
def list_draws(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaigns = db.scalars(select(Campaign).where(Campaign.status.in_(["closed", "completed"])).order_by(Campaign.created_at.desc())).all()
    runs = {run.campaign_id: run for run in db.scalars(select(DrawRun).where(DrawRun.campaign_id.in_([c.id for c in campaigns])))}
    return [{"campaign_id": str(c.id), "campaign_name": c.name, "campaign_status": c.status,
             "entry_count": c.current_entries, "winner_count": c.winner_count,
             "draw": detail(db, runs[c.id], False) if c.id in runs else None} for c in campaigns]


@admin_router.get("/{campaign_id}")
def get_draw(campaign_id: UUID, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return detail(db, locked(db, campaign_id))


@admin_router.post("/{campaign_id}/prepare")
def prepare(campaign_id: UUID, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    local_only(request)
    try:
        campaign = db.scalar(select(Campaign).where(Campaign.id == campaign_id).with_for_update())
        if campaign is None:
            raise HTTPException(404, "Campaign not found")
        existing = db.scalar(select(DrawRun).where(DrawRun.campaign_id == campaign_id))
        if existing:
            return detail(db, existing)
        if campaign.status != "closed":
            raise HTTPException(409, "Registration must be closed before preparing a draw")
        rows = db.execute(select(Entry.id, Entry.user_id, Entry.coupon_id, Entry.status, Coupon.status, Coupon.user_id, Coupon.campaign_id, User.is_active).join(Coupon, Coupon.id == Entry.coupon_id).join(User, User.id == Entry.user_id).where(Entry.campaign_id == campaign_id).order_by(Entry.id)).all()
        if len(rows) != campaign.current_entries or any(r[3] != "confirmed" or r[4] != "redeemed" or r[1] != r[5] or r[6] != campaign_id or not r[7] for r in rows):
            raise HTTPException(409, "Entry/coupon reconciliation or participant eligibility is unresolved")
        participants = len({r[1] for r in rows})
        if participants < campaign.winner_count:
            raise HTTPException(409, "Insufficient eligible distinct participants")
        content = canonical({"campaign_id": str(campaign.id), "campaign_updated_at": campaign.updated_at.isoformat(),
            "rules": {"winner_count": campaign.winner_count, "max_capacity": campaign.max_capacity,
                      "start_date": campaign.start_date.isoformat(), "end_date": campaign.end_date.isoformat(),
                      "destination": campaign.destination, "prize_value": str(campaign.prize_value),
                      "currency": campaign.currency, "coupon_price": str(campaign.coupon_price),
                      "eligibility": "active user; confirmed entry; redeemed owned coupon",
                      "winner_policy": "one per participant; entry weighted", "algorithm_version": ALGORITHM_VERSION},
            "entries": [{"entry_id": str(r[0]), "user_id": str(r[1]), "coupon_id": str(r[2])} for r in rows]})
        seed = secrets.token_bytes(32)
        run = DrawRun(campaign_id=campaign_id, status="prepared", seed=seed, seed_hash=hashlib.sha256(seed).hexdigest(), algorithm_version=ALGORITHM_VERSION, prepared_by=user.id, prepared_at=utcnow())
        db.add(run)
        db.flush()
        db.add(DrawSnapshot(run_id=run.id, content=content, hash=digest(content), entry_count=len(rows), participant_count=participants, winner_count=campaign.winner_count, created_at=utcnow()))
        db.flush()
        log(db, user, request, "draw.prepare", run)
        db.commit()
        return detail(db, run)
    except Exception:
        db.rollback()
        raise


@admin_router.post("/{campaign_id}/approve")
def approve(campaign_id: UUID, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    local_only(request)
    try:
        run = locked(db, campaign_id)
        if run.status == "prepared":
            run.status = "approved"
            run.approved_by = user.id
            run.approved_at = utcnow()
            log(db, user, request, "draw.approve", run)
            db.commit()
        return detail(db, run)
    except Exception:
        db.rollback()
        raise


@admin_router.post("/{campaign_id}/execute")
def execute(campaign_id: UUID, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    local_only(request)
    try:
        run = locked(db, campaign_id)
        if run.status in ("completed", "published"):
            return detail(db, run)
        if run.status != "approved":
            raise HTTPException(409, "Draw approval is required")
        snapshot = db.get(DrawSnapshot, run.id)
        if digest(snapshot.content) != snapshot.hash or hashlib.sha256(run.seed).hexdigest() != run.seed_hash:
            raise HTTPException(409, "Frozen draw inputs failed integrity verification")
        winners = select_winners(snapshot.content, run.seed)
        for winner in winners:
            db.add(DrawWinner(run_id=run.id, rank=winner["rank"], entry_id=UUID(winner["entry_id"]), user_id=UUID(winner["user_id"])))
        db.flush()
        run.status = "completed"
        run.executed_by = user.id
        run.executed_at = utcnow()
        log(db, user, request, "draw.execute", run, {"winner_entry_ids": [w["entry_id"] for w in winners]})
        db.commit()
        return detail(db, run)
    except Exception as error:
        db.rollback()
        if not isinstance(error, HTTPException):
            try:
                failed_run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == campaign_id))
                if failed_run is not None:
                    snapshot = db.get(DrawSnapshot, failed_run.id)
                    db.add(AuditLog(admin_email=user.email, action="draw.failure",
                        details=canonical({"campaign_id": str(campaign_id), "draw_id": str(failed_run.id),
                                           "snapshot_hash": snapshot.hash, "error_type": type(error).__name__}),
                        ip_address=request.client.host if request.client else "unknown", created_at=utcnow()))
                    db.commit()
            except Exception:
                db.rollback()  # Preserve the original failure if the audit store is unavailable.
        raise


@admin_router.post("/{campaign_id}/publish")
def publish(campaign_id: UUID, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    local_only(request)
    try:
        run = locked(db, campaign_id)
        if run.status == "completed":
            run.status = "published"
            run.published_by = user.id
            run.published_at = utcnow()
            log(db, user, request, "draw.publish", run)
            db.commit()
        elif run.status != "published":
            raise HTTPException(409, "Only completed draws can be published")
        return detail(db, run)
    except Exception:
        db.rollback()
        raise


@public_router.get("/published")
def published(db: Session = Depends(get_db)):
    runs = db.scalars(select(DrawRun).where(DrawRun.status == "published").order_by(DrawRun.published_at.desc())).all()
    return [{"campaign_name": db.get(Campaign, run.campaign_id).name, **detail(db, run, False)} for run in runs]


@public_router.get("/mine")
def mine(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(DrawWinner, DrawRun, Campaign, Entry).join(DrawRun, DrawRun.id == DrawWinner.run_id).join(Campaign, Campaign.id == DrawRun.campaign_id).join(Entry, Entry.id == DrawWinner.entry_id).where(DrawWinner.user_id == user.id, DrawRun.status == "published").order_by(DrawRun.published_at.desc())).all()
    return [{"campaign_name": c.name, "campaign_id": str(c.id), "rank": w.rank, "entry_code": e.entry_code, "published_at": r.published_at} for w, r, c, e in rows]
