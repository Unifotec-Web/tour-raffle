"""Deterministic, cryptographically keyed selection from a frozen entry snapshot."""
import hashlib
import hmac
import json

ALGORITHM_VERSION = "hmac-sha256-entry-weighted-v1"


def canonical(value: dict) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def digest(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def select_winners(content: str, seed: bytes) -> list[dict]:
    snapshot = json.loads(content)
    pool = list(snapshot["entries"])
    winners = []
    counter = 0
    for rank in range(1, snapshot["rules"]["winner_count"] + 1):
        size = len(pool)
        if not size:
            raise ValueError("Insufficient distinct participants")
        # Rejection sampling avoids modulo bias; HMAC gives reproducible recovery.
        ceiling = (1 << 256) - ((1 << 256) % size)
        while True:
            block = hmac.new(seed, f"{ALGORITHM_VERSION}:{counter}".encode(), hashlib.sha256).digest()
            counter += 1
            number = int.from_bytes(block, "big")
            if number < ceiling:
                break
        selected = pool[number % size]
        winners.append({"rank": rank, **selected})
        pool = [entry for entry in pool if entry["user_id"] != selected["user_id"]]
    return winners
