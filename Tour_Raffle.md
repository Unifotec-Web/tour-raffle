# TOUR RAFFLE — CONSOLIDATED FULL-STACK IMPLEMENTATION MASTER PROMPT
## Existing UI preservation + complete screenshot-driven page flows + original backend specification

**READ THIS OVERRIDE BEFORE ANY OTHER SECTION.** This is an IMPLEMENT-AND-INTEGRATE assignment for an EXISTING Tour Raffle frontend, not a design assignment. The nine supplied PNG reference images and the existing repository are the design authority. **Do not redesign, re-theme, modernize, simplify, replace, or regenerate the existing UI/UX.** Preserve the exact existing desktop and mobile visual designs, logo artwork, visible tagline, hero imagery, photographic crops, typography, navigation, sidebar, footer, cards, buttons, spacing, tables, charts, progress indicators, form layouts, status badges and component hierarchy. Implement missing behavior, routes, backend, data, validations and responsive adaptations *inside the existing design*. No new design system or branding exercise.

### Reference files (open and inspect ALL of these locally)
1. `Tour Raffle Travel Website Triptych(2).png`
2. `Tour Raffle Travel Website Triptych(3).png`
3. `Tour Raffle Authentication UI Collage(1).png`
4. `Tour Raffle Admin Dashboard Suite(1).png`
5. `Tour Raffle Dashboard UI Collage(1).png`
6. `Tour Raffle Travel Dashboard Mockup(3).png`
7. `Tour Raffle Travel Dashboard Mockup(4).png`
8. `Tour Raffle Responsive UI Showcase(1).png`
9. `Tour Raffle Dashboard UI Sitemap(1).png`

The references contain both full-page compositions and individual component/state samples. Do not interpret every thumbnail as a new route. Inspect full-resolution crops of each reference; do not guess text, exact dimensions, or assets from the collage alone. If the original image asset cannot be found, report the missing asset and use an explicitly identified temporary placeholder **without claiming an exact match**. Never use the entire screenshot as a webpage background.

### Binding conflict-resolution hierarchy
1. Existing working UI and corresponding reference screenshot for that exact screen/viewport.
2. Other supplied Tour Raffle screenshots for shared components and styling.
3. Existing repository design tokens, components and assets.
4. Functional workflows and safety requirements in the original master specification below.
5. New implementation choices ONLY when no design is specified.

**Critical conflict resolution:** The original specification below includes instructions such as "Create a premium, modern travel brand", "Create: Tour Raffle logo", a proposed palette (teal, ivory, restrained gold), a proposed hero headline, and instructions to "build" the homepage design. Those are historical planning instructions, **NOT permission to change the already-designed frontend**. Preserve the existing screenshot/logo/hero/tagline where visible. For example, original specification tagline `BUY. ENTER. TRAVEL.` and headline `Your Next Adventure Could Be the One.` are business-content candidates, but the reference screenshots show `Dream. Enter. Win.` and other existing visible copy; do not replace screenshot copy with original planning copy. Only add new content on pages without an existing visual reference and only with consistent established styling. Preserve the original specification's FastAPI/PostgreSQL, security, capacity, eligibility, payments, draw, and compliance requirements.

### Non-destructive engineering protocol
- Before editing: inspect repository, identify framework, page inventory, CSS tokens, assets, reusable components, API calls, and existing tests. Create a page/route/component-to-reference mapping.
- Make a git checkpoint/branch; do not overwrite existing pages wholesale or delete assets. Prefer surgical changes and reuse of existing components.
- First ensure existing screens still render; implement missing interactions and APIs behind their current controls.
- Preserve existing routes where possible; add aliases/redirects for newly specified flows rather than breaking URLs.
- Existing frontend layout must remain visually unchanged at its reference viewport, except tiny necessary accessibility fixes that do not materially change design.
- Screens with no reference: extend established UI patterns, do not introduce a new aesthetic.
- Use real server data in production; screenshot numbers, names, balances, and dates are **fixture values**, never fabricated live metrics.
- If legal approvals, provider credentials, email configuration or operational partners are missing, implement sandbox scaffolding and keep live money/entries/draw disabled. Do not claim completion of unconfigured integrations.
- Provide per-phase progress, visual diffs, tests, unresolved gaps; never report success without evidence.

---

# PART I — ORIGINAL FULL-STACK MASTER SPECIFICATION (PRESERVED VERBATIM)

# TOUR RAFFLE
## Complete Full-Stack Website and Platform Development Specification

**Project type:** Premium travel raffle website and full-stack web application  
**Brand:** Tour Raffle  
**Tagline:** BUY. ENTER. TRAVEL.  
**Primary headline:** Your Next Adventure Could Be the One.  
**Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Python FastAPI  
**Database:** PostgreSQL  
**Initial target markets:** Jamaica, Canada, United States, Trinidad and Tobago, United Kingdom  
**Planned campaign capacity:** 450,000 entries per campaign  
**Planned winners:** 450 distinct winners per campaign  
**Planned coupon price:** $10, subject to approved campaign currency, legal review, and payment-provider requirements

---

# 1. PROJECT MISSION

Act as a senior product designer, UI/UX specialist, Next.js engineer, Python backend engineer, PostgreSQL architect, cybersecurity engineer, QA engineer, and DevOps engineer.

Build Tour Raffle into a complete, production-oriented platform for eligible users to discover travel prizes, review official campaign rules, obtain authorized entry coupons, validate and redeem codes, track their entries, and view verified draw results.

The application must be a real full-stack system, not just a landing page, Figma concept, static frontend, or collection of disconnected screens.

Build:

- A premium public website.
- All public informational pages.
- Registration, login, password recovery, and email verification.
- A complete user dashboard.
- A secure administrative dashboard.
- A FastAPI REST API.
- PostgreSQL database models and migrations.
- A backend coupon code generator.
- A backend coupon validator and redemption engine.
- Secure order and payment processing.
- An atomic campaign capacity allocation system.
- Campaign creation, closure, and restart functionality.
- Country-specific eligibility and approval controls.
- A secure, auditable draw engine.
- Winner verification and prize-claim management.
- Support and notification systems.
- Technical SEO.
- Responsive and accessible design.
- Automated testing.
- Deployment configuration and documentation.

Do not stop after building the homepage. Continue through the complete application, connect the frontend to the backend, implement the database, and test the core workflows.

Where an external integration requires credentials, provide a working integration structure and sandbox or development configuration where available. Clearly label integrations that still require setup.

**Legal safety requirement:** Paid-entry raffles and prize competitions can be regulated differently in each jurisdiction. Build country and campaign approval gates into the system. Keep real-money sales, live entries, and production draws disabled until the applicable legal requirements, campaign rules, and payment-provider approvals have been verified. Do not invent licenses, approvals, partners, or legal claims.

# 2. BUSINESS CONCEPT

Tour Raffle is a travel-prize platform intended to give eligible participants a clear and transparent way to enter approved campaigns and follow their progress.

The platform should communicate excitement, trust, fairness, and the possibility of a travel experience without making misleading promises.

## Proposed campaign model

- 450,000 maximum valid entries per campaign.
- 450 distinct winners per campaign, subject to the approved campaign rules.
- A planned coupon price of $10 USD or a configured local-currency equivalent.
- A maximum of one winning prize per participant per campaign, unless the approved rules explicitly provide otherwise.
- A proposed allocation of 70% of the defined campaign pool toward winner-related prize expenses and 30% toward approved marketing, sales, and operating expenses.

The financial model must be configurable. Clearly separate gross sales, taxes, payment fees, refunds, prize expenses, operating expenses, and net proceeds. Never imply that 70% of gross revenue is available for prizes unless that calculation is explicitly defined and verified.

## Initial target jurisdictions

1. Jamaica.
2. Canada.
3. United States.
4. Trinidad and Tobago.
5. United Kingdom.

The system must support individual country and regional restrictions where required. Do not assume that a single rule applies to every state, province, territory, or jurisdiction.

# 3. DESIGN DIRECTION

Create a premium, modern travel brand inspired by the clarity of leading travel platforms and the polish of trustworthy financial technology products.

Do not copy another website's branding, layout, or assets.

## Brand palette

- Deep navy: primary brand color.
- White: primary surface.
- Warm ivory: secondary surface.
- Teal or turquoise: primary interactive accent.
- Restrained gold: premium highlight.
- Charcoal and slate: text and supporting content.
- Light gray: dividers, secondary panels, and neutral status backgrounds.

Use a consistent palette with accessible text contrast.

## Typography

Use a clean modern sans-serif typeface such as Inter, Geist, or an equivalent. Use a clear typographic scale, readable body text, strong page headings, and consistent spacing.

## Design characteristics

- High-quality travel photography.
- Spacious layouts.
- Strong hero sections.
- Beautiful destination cards.
- Refined shadows and borders.
- Carefully controlled corner radii.
- Smooth but restrained animations.
- Premium icons.
- Accessible interactive elements.
- Consistent navigation.
- Responsive dashboard tables.
- Clear progress indicators.
- Elegant status badges.
- Useful loading skeletons.
- Polished empty and error states.

Avoid clutter, excessive gradients, flashing animations, aggressive countdowns, fake trust badges, fabricated testimonials, false live activity, and fake winner information.

## Brand assets

Create:
- Tour Raffle logo and wordmark.
- Compact logo for mobile navigation.
- Favicon.
- Social sharing image.
- Reusable icon set.
- Button styles.
- Card styles.
- Form components.
- Modal and confirmation styles.
- Toast notifications.
- Status indicators.
- Table and pagination styles.

Use properly licensed images and store assets through a suitable asset-management system.

# 4. APPLICATION ARCHITECTURE

Use a clear separation of responsibilities.

## Frontend

- Next.js App Router.
- TypeScript with strict checking.
- React.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- React Hook Form.
- Zod validation.
- Accessible charts and tables.
- Responsive layouts.
- Server rendering for appropriate public pages.
- A centralized API client.

## Backend

- Python 3.12 or a compatible supported version.
- FastAPI.
- Pydantic v2.
- SQLAlchemy 2.x.
- Alembic.
- PostgreSQL.
- A supported PostgreSQL driver.
- Pytest.
- HTTPX.
- Structured JSON logging.

## Supporting services

- Redis is optional for caching, rate limiting, and background coordination.
- Redis must never be the authoritative source for campaign capacity, coupon uniqueness, payment status, entries, or draw results.
- Use a durable background job system or transactional outbox pattern for important asynchronous work.
- Use an approved email service.
- Use a payment provider approved for the relevant business model and jurisdiction.
- Use managed object storage where appropriate.
- Use managed PostgreSQL or a securely operated database service.

## Core architecture rule

The frontend must never decide whether a coupon is valid, a payment has succeeded, a user is eligible, or a campaign has available capacity.

All authoritative decisions must be made by FastAPI and PostgreSQL.

# 5. PUBLIC WEBSITE ROUTES

Create every route below. Each page must have a responsive layout, real navigation, appropriate metadata, loading states, error handling, and accurate content.

## Main pages

- `/` — Homepage.
- `/how-it-works` — How the platform works.
- `/destinations` — Destination directory.
- `/destinations/[slug]` — Destination details.
- `/prizes` — Prize overview.
- `/entry-rules` — Entry requirements.
- `/draw-process` — Draw transparency.
- `/live-progress` — Live campaign progress.
- `/winners` — Verified published winners.
- `/winners/[slug]` — Public winner details.
- `/about` — About Tour Raffle.
- `/faq` — Frequently asked questions.
- `/contact` — Contact form.
- `/help` — Help centre.
- `/privacy-policy` — Privacy policy.
- `/terms` — Terms and conditions.
- `/official-rules` — Official campaign rules.
- `/cookies` — Cookie information and controls.
- `/responsible-participation` — Responsible participation information.
- `/restricted-access` — Restricted campaign availability.

## Authentication pages

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/verify-eligibility`

## User dashboard pages

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/eligibility`
- `/dashboard/coupons`
- `/dashboard/coupons/[id]`
- `/dashboard/entries`
- `/dashboard/transactions`
- `/dashboard/notifications`
- `/dashboard/security`
- `/dashboard/support`
- `/dashboard/wins`

## Admin pages

- `/admin`
- `/admin/users`
- `/admin/eligibility`
- `/admin/coupons`
- `/admin/entries`
- `/admin/transactions`
- `/admin/raffles`
- `/admin/draws`
- `/admin/winners`
- `/admin/destinations`
- `/admin/content`
- `/admin/seo`
- `/admin/countries`
- `/admin/compliance`
- `/admin/support`
- `/admin/notifications`
- `/admin/audit-logs`
- `/admin/settings`

Protect every private route on the server. Hiding a link in the interface is not sufficient authorization.

# 6. HOMEPAGE DESIGN

Build a high-converting, premium homepage with the following sections.

## A. Header

Include:
- Tour Raffle logo.
- Home.
- How It Works.
- Destinations.
- Prizes.
- Live Progress.
- Winners.
- FAQ.
- Login.
- Create Account.

Show an entry or purchase CTA only when the campaign is approved, open, and available to the visitor.

## B. Hero section

Headline:

“Your Next Adventure Could Be the One.”

Supporting copy:

“Discover travel experiences, explore eligible campaigns, and follow every step through a clear, secure, and transparent entry process.”

Primary button: “Explore Destinations”

Secondary button: “How It Works”

Use premium travel photography with a refined composition and a clear text hierarchy.

Do not show a fake countdown, false scarcity, unverified campaign totals, or invented prizes.

## C. Campaign overview

Display a real campaign card when a published campaign exists.

Show:
- Campaign name.
- Approved destination.
- Verified campaign status.
- Published prize details.
- Entry price and currency, if approved.
- Campaign deadline, if configured.
- Confirmed eligible-entry count.
- Maximum capacity.
- Progress percentage.

If no campaign is approved, show a professional upcoming-campaign or unavailable state.

## D. Featured destinations

Create attractive destination cards with:
- Image.
- Name.
- Country.
- Short description.
- View details link.

Use real destination records from the backend or clearly labelled non-production editorial content.

## E. How it works

Show a concise visual journey:
1. Check eligibility.
2. Review official rules.
3. Use an authorized entry method.
4. Receive confirmation.
5. Follow campaign progress.
6. Review verified results.

## F. Prize highlights

Present only approved or explicitly labelled proposed prizes. Explain inclusions, exclusions, and restrictions.

## G. Transparency section

Explain:
- How entries are validated.
- How duplicate redemption is prevented.
- How capacity is enforced.
- How the eligible-entry snapshot is created.
- How the draw is audited.
- How winners are verified.

Only claim independent certification when it has actually been obtained.

## H. Country availability

Show the supported countries with their actual availability statuses. Clearly mark any market where live entry is not enabled.

## I. FAQ preview

Show frequently asked questions and link to the full FAQ.

## J. Footer

Include:
- About.
- Contact.
- Help.
- FAQ.
- Official Rules.
- Terms.
- Privacy.
- Cookies.
- Responsible Participation.
- Restricted Access.
- Copyright and verified business details.

# 7. PUBLIC PAGE REQUIREMENTS

## How It Works

Explain the entry journey, eligibility, coupon process, confirmation, campaign progress, draw procedure, result publication, and prize-claim process.

Explain that entry does not guarantee winning.

## Destinations

Provide responsive cards, optional search, filters, and links to details.

## Destination Details

Include:
- Destination overview.
- High-quality images.
- Proposed or confirmed itinerary.
- Prize inclusions.
- Prize exclusions.
- Travel restrictions.
- Relevant campaign.
- Eligibility.
- Official rules.

Clearly distinguish confirmed prizes from proposals.

## Prizes

Show prize descriptions, published values when verified, number of prizes, exclusions, claim requirements, deadlines, and relevant restrictions.

Do not invent flight bookings, hotel partnerships, cash values, or travel benefits.

## Entry Rules

Display the approved campaign rules, including:
- Organizer.
- Campaign dates and time zone.
- Eligibility.
- Jurisdiction.
- Entry methods.
- Price and currency.
- Maximum capacity.
- Number and description of prizes.
- Draw method.
- Refund conditions.
- Winner verification.
- Claim deadlines.
- Dispute process.
- Privacy disclosures.
- Applicable law.

Version all official rules and preserve the applicable version associated with each participant's entry.

## Draw Process

Explain the eligible-entry snapshot, duplicate prevention, secure selection, audit trail, interruption handling, publication, and replacement procedures where allowed.

## Live Progress

Use verified API data for:
- Current campaign state.
- Valid entry count.
- Capacity.
- Remaining capacity.
- Percentage filled.
- Last updated timestamp.

Never fabricate counts.

## Winners

Display only approved, verified public results. Respect privacy and publication consent. Do not expose contact details, home addresses, private IDs, or full coupon codes.

## About

Provide editable and accurate company information. Never invent registration details, founders, partnerships, or corporate addresses.

## FAQ and Help

Include questions on eligibility, coupons, payments, campaign availability, capacity, draw fairness, results, refunds, privacy, and support.

## Contact

Create a functional form with validation, spam prevention, privacy notice, submission confirmation, and backend ticket creation.

## Legal pages

Create editable privacy, terms, cookies, responsible participation, and official rules pages. Mark initial legal copy as requiring professional review rather than claiming it is approved.

# 8. USER REGISTRATION AND ACCOUNT MANAGEMENT

Implement secure registration and authentication.

Required functionality:
- Registration.
- Login.
- Logout.
- Email verification.
- Password recovery.
- Password reset.
- Session expiration.
- Account profile.
- Account security.
- Appropriate consent records.
- Role-aware access control.
- Rate limiting.
- Secure error messages.

Do not reveal whether a specific email address is registered through password recovery responses.

Use secure password hashing and expiring, single-use verification tokens.

## User profile

Allow users to update permitted profile information.

Record relevant changes and require re-verification for sensitive changes where appropriate.

Collect only information necessary for the actual service.

## Eligibility dashboard

Display:
- Jurisdiction.
- Eligibility status.
- Required steps.
- Review status.
- Missing information.
- Relevant restrictions.

Do not collect identity documents unless necessary, legally justified, and handled through an appropriate secure process.

# 9. USER DASHBOARD

Create a premium dashboard with consistent navigation, responsive cards, clear statuses, and actual backend data.

## Dashboard overview

Display:
- Welcome message.
- Account status.
- Eligibility status.
- Valid entry count.
- Coupon count.
- Recent transactions.
- Notifications.
- Campaign updates.
- Verified winnings.
- Support links.

Do not use fabricated statistics.

## My Coupons

Display:
- Coupon identifier.
- Masked code.
- Campaign.
- Issue date.
- Coupon status.
- Redemption status.
- Associated entry.
- Details link.

Never return another user's coupons. Do not expose complete redeemable codes unnecessarily.

## Coupon details

Show authorized coupon information, campaign association, issuance status, redemption history, and related entry status.

## My Entries

Display the user's entries with campaign name, status, registration time, and relevant updates.

## Transactions

Display order number, amount, currency, transaction date, payment status, and refund status.

Never store or expose raw payment card information.

## Notifications

Support payment confirmation, issuance confirmation, entry updates, campaign announcements, draw updates, winner notices, and security alerts.

## Security

Support password change, active session controls where available, logout, verification status, and security history.

## Support

Allow ticket creation, message history, status tracking, and approved attachments.

## My Wins

Display only winnings genuinely associated with the authenticated user, including verification and prize-claim progress.

# 10. ADMIN DASHBOARD AND PERMISSIONS

Create a separate protected administrative experience.

Support these roles:
- Super Admin.
- Campaign Manager.
- Compliance Reviewer.
- Finance Manager.
- Draw Officer.
- Customer Support Agent.
- Read-Only Auditor.

Every role must have explicit permissions. All permissions must be checked on the backend.

## Admin overview

Display:
- Campaign statuses.
- Valid entries.
- Capacity remaining.
- Verified payments.
- Refunds.
- Issuance failures.
- Reconciliation issues.
- Eligibility reviews.
- Pending compliance approvals.
- Draw status.
- Support tickets.
- Security alerts.
- Recent audit activity.

## User management

Search and filter accounts, review permitted profile data, restrict accounts, restore accounts, and inspect relevant audit history.

## Eligibility management

Review eligibility submissions and record reviewer, decision, timestamp, reason, and policy version.

## Coupon management

Search coupon records, inspect issuance events, review redemption status, and investigate failures. Restrict bulk exports and sensitive code access.

## Entry management

Review valid, invalid, revoked, refunded, and disputed entries. All adjustments must be performed through audited backend operations.

## Transaction management

Review orders, payment references, verified payment events, refunds, and reconciliation discrepancies.

## Campaign management

Authorized administrators can:
- Create a campaign.
- Edit draft campaigns.
- Set entry price and currency.
- Set dates and capacity.
- Define eligible jurisdictions.
- Configure prizes.
- Upload approved media.
- Attach official rules.
- Submit for approval.
- Publish after approval.
- Pause or close campaigns under the documented policy.

Lock or version critical campaign configuration after entries have been accepted.

## Draw management

Build a guided workflow for:
1. Closing entry registration.
2. Reconciling payments.
3. Resolving issuance failures.
4. Reviewing refunds and authorized disqualifications.
5. Creating the eligible-entry snapshot.
6. Recording the snapshot hash.
7. Reviewing draw eligibility.
8. Obtaining required authorization.
9. Executing the draw.
10. Recording results.
11. Verifying winner uniqueness.
12. Completing required review.
13. Publishing results.

Never permit silent winner replacement or unrestricted draw reruns.

## Winner management

Support eligibility verification, claim status, deadlines, prize fulfilment, approved disqualification, authorized replacement where allowed, publication consent, and communication history.

## Destination management

Create, edit, publish, and archive destinations and media.

## Content management

Manage homepage sections, FAQs, help articles, campaign notices, and legal pages using draft, preview, publish, and version-history functionality.

## SEO management

Manage page titles, descriptions, canonical URLs, social images, redirects, and indexing controls. Prevent private pages from being indexed.

## Country and compliance management

For each jurisdiction, store:
- Availability.
- Legal review status.
- Required approvals.
- Minimum age.
- Residency rules.
- Required disclosures.
- Payment-provider availability.
- Effective date.
- Approval evidence reference.
- Reviewer.
- Expiry or re-review date.

Default all unverified jurisdictions to blocked for live paid participation.

## Audit logs

Record critical changes with actor, timestamp, target record, action, and relevant metadata. Make logs tamper-evident or append-only to the extent practical.

Never log passwords, secret keys, full coupon codes, or raw payment credentials.

# 11. FASTAPI BACKEND

Build a modular Python backend under `/api/v1/`.

Use typed schemas, dependency injection, centralized configuration, database transactions, consistent errors, pagination, filtering, logging, and API documentation.

Suggested structure:

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
      exceptions.py
      permissions.py
    api/
      deps.py
      v1/
        api.py
        endpoints/
          auth.py
          users.py
          campaigns.py
          countries.py
          eligibility.py
          coupons.py
          orders.py
          payments.py
          entries.py
          draws.py
          winners.py
          notifications.py
          support.py
          admin.py
          health.py
    db/
      base.py
      session.py
    models/
    schemas/
    repositories/
    services/
      auth_service.py
      campaign_service.py
      eligibility_service.py
      coupon_service.py
      payment_service.py
      capacity_service.py
      entry_service.py
      draw_service.py
      winner_service.py
      audit_service.py
      notification_service.py
    integrations/
      payments/
      email/
      storage/
    workers/
    tests/
  alembic.ini
  pyproject.toml
  Dockerfile
  .env.example
  README.md
```

Maintain clear separation between routes, business logic, data access, integrations, and background jobs.

Implement:
- API request validation.
- Authentication and authorization.
- Standard error responses.
- Request correlation IDs.
- Rate limiting.
- Health checks.
- OpenAPI documentation in development.
- Safe production configuration.

# 12. POSTGRESQL DATA MODEL

PostgreSQL must be the sole authoritative source for critical application data.

Create normalized tables, foreign keys, unique constraints, indexes, migrations, and transaction-safe operations.

## Identity

- `users`
- `user_profiles`
- `roles`
- `permissions`
- `user_roles`
- `user_sessions`
- `email_verification_tokens`
- `password_reset_tokens`
- `consent_records`

## Campaigns and compliance

- `campaigns`
- `campaign_versions`
- `campaign_countries`
- `country_approvals`
- `eligibility_policies`
- `eligibility_checks`
- `official_rules_versions`
- `campaign_prizes`
- `destinations`
- `campaign_destinations`

## Orders and payments

- `orders`
- `order_items`
- `payments`
- `payment_webhook_events`
- `refunds`
- `payment_reconciliation_records`
- `transactional_outbox`

## Coupons and entries

- `coupons`
- `coupon_issuance_events`
- `coupon_redemption_events`
- `entries`
- `capacity_reservations`

## Draws and prizes

- `draw_runs`
- `draw_snapshots`
- `draw_results`
- `winners`
- `prize_claims`
- `prize_fulfilment_events`

## Operations

- `notifications`
- `notification_deliveries`
- `support_tickets`
- `support_messages`
- `audit_logs`
- `system_events`
- `feature_flags`
- `uploaded_assets`

Use UUIDs where appropriate. Use `NUMERIC` for monetary values, explicit currency fields, UTC timestamps, foreign keys, and useful indexes.

Enforce database-level uniqueness for coupon codes or their secure digests, payment event identifiers, transaction references, redemption records, and participant/campaign winner constraints.

Never rely solely on frontend validation.

# 13. BACKEND COUPON GENERATOR

Implement a dedicated coupon generation service in Python.

**All authoritative coupon codes must be generated by the backend.**

## Requirements

- Use Python's cryptographically secure `secrets` module or a suitable reviewed equivalent.
- Generate unpredictable, sufficiently high-entropy codes.
- Use an easy-to-read format such as `TR-XXXX-XXXX-XXXX` if appropriate.
- Avoid ambiguous characters where practical.
- Enforce uniqueness in PostgreSQL.
- Handle uniqueness collisions safely.
- Never use predictable sequential codes as redeemable secrets.
- Never use JavaScript `Math.random()` for authoritative coupon generation.
- Never log full redeemable codes.
- Keep generation secrets out of API responses and logs.

## Issuance flow

1. User requests an entry through an enabled campaign.
2. Backend checks campaign status.
3. Backend checks jurisdiction and eligibility.
4. Backend validates price, currency, and applicable limits.
5. Backend creates an order with an idempotency key.
6. Payment is completed through the configured provider, if required.
7. Backend verifies the provider's trusted event or transaction status.
8. Backend processes the event idempotently.
9. Backend reserves capacity transactionally.
10. Backend generates and stores unique coupon records.
11. Backend links coupons to the correct order and user.
12. Backend records issuance events.
13. Backend commits the transaction.
14. A durable background task sends confirmation.
15. The dashboard displays the actual issued coupons.

If a payment succeeds but issuance fails, preserve the payment record, record the issuance failure, and provide safe retry and reconciliation. Never charge the user again simply because coupon issuance failed.

Where coupons must be displayed again, use a deliberate secure retrieval design. Store a cryptographic digest for verification when practical, and avoid broadly exposing plaintext codes.

# 14. EXACT CAMPAIGN CAPACITY: 450,000

The planned campaign limit is **450,000 valid entries per campaign**.

Capacity must be configurable for future approved campaigns, but each campaign must enforce its own authorized maximum.

## Required behavior

- Each campaign has a unique identifier.
- Capacity allocation is enforced by PostgreSQL transactions.
- Concurrent requests cannot exceed the campaign limit.
- A stale cache can never authorize an extra entry.
- Pending or failed payments are not counted as confirmed valid entries.
- Entry issuance and capacity reservations are reconciled safely.
- Campaign status changes are persisted.
- The system rejects allocations after capacity is exhausted.

## Atomic capacity algorithm

Implement a safe allocation strategy using PostgreSQL row-level locks, conditional updates, or an equivalent concurrency-control design.

The transaction must:
1. Lock or atomically update the relevant campaign capacity record.
2. Confirm the campaign is approved and open.
3. Confirm that sufficient capacity remains.
4. Reserve the required slots.
5. Associate the reservation with the order.
6. Finalize or release the reservation according to the documented payment lifecycle.
7. Issue the authorized coupon or entry records.
8. Update the campaign status when the exact capacity boundary is reached.
9. Commit all related changes consistently.

Do not use an unsafe “read the count and increment later” approach.

## Sold-out behavior

When the last authorized slot is allocated:
- Set the appropriate sold-out or closed state.
- Reject additional allocations.
- Disable purchase actions.
- Update the public progress display.
- Return a clear error code for subsequent requests.
- Preserve all historical records.

If payment is authorized but no capacity remains, apply the documented void, refund, or reconciliation policy. Never silently keep a payment without a defined outcome.

## Campaign restart

Do not reset an existing production campaign by deleting its data.

To start a new campaign:
1. Create a new campaign record.
2. Assign a new campaign ID.
3. Configure new dates and capacity.
4. Approve new campaign rules.
5. Complete applicable jurisdiction and payment approvals.
6. Generate fresh coupon codes.
7. Start a new capacity ledger.
8. Preserve the previous campaign's payments, entries, audit history, and results.

Do not recycle old codes or overwrite published results. Any reopening of a closed campaign must be explicitly permitted by the official rules and performed through an audited workflow.

# 15. COUPON VALIDATION AND REDEMPTION

Implement:

- `POST /api/v1/coupons/validate`
- `POST /api/v1/coupons/redeem`
- `GET /api/v1/coupons/{coupon_id}`
- `GET /api/v1/users/me/coupons`
- `GET /api/v1/users/me/entries`

## Validation checks

Verify:
- Code format.
- Code existence.
- Campaign association.
- Campaign state.
- Coupon revocation status.
- Redemption status.
- Verified payment or authorized alternative entry.
- User authentication where required.
- User eligibility.
- Country availability.
- Campaign capacity.
- Entry limits.
- Abuse and fraud controls.

## Atomic redemption

Use a database transaction with appropriate row locks and uniqueness constraints.

Within the transaction:
1. Validate the coupon.
2. Validate the campaign.
3. Verify user eligibility.
4. Confirm the code has not been redeemed.
5. Confirm capacity where applicable.
6. Mark the coupon redeemed.
7. Create or activate the entry.
8. Record the redemption event.
9. Record relevant audit metadata.
10. Commit all changes together.

If any required step fails, roll back the transaction.

## Abuse protection

- Rate-limit validation endpoints.
- Prevent code enumeration.
- Use generic error responses when appropriate.
- Use idempotency keys for operations that need them.
- Log suspicious activity without exposing codes.
- Validate ownership on every private resource.
- Never trust user IDs supplied by the frontend when determining ownership.

# 16. PAYMENT PROCESSING

Create a provider-agnostic payment integration layer.

Implement sandbox mode first.

Requirements:
- Approved provider configuration.
- Server-side payment verification.
- Signed webhook verification.
- Idempotent webhook processing.
- Unique provider event IDs.
- Duplicate event protection.
- Payment state transitions.
- Refund handling.
- Dispute handling where supported.
- Reconciliation jobs.
- Durable retry handling.
- Safe failure recovery.
- No raw card data storage.
- No hardcoded secrets.

Do not issue a coupon based on a browser redirect or client-side success message.

If credentials are missing, mark payment integration as awaiting configuration. Keep live payments disabled.

# 17. COUNTRY ELIGIBILITY AND LEGAL APPROVALS

Create a jurisdiction service for Jamaica, Canada, the United States, Trinidad and Tobago, and the United Kingdom.

Support additional state, province, territory, and regional restrictions as required.

Store:
- Jurisdiction.
- Campaign availability.
- Legal review status.
- Approval evidence reference.
- Minimum age.
- Residency requirements.
- Campaign eligibility rules.
- Required disclosures.
- Approved entry methods.
- Payment-provider availability.
- Effective and expiry dates.
- Reviewer.
- Review history.

Use trusted server-side signals and appropriate eligibility checks. IP geolocation alone must not be treated as proof of legal residency.

Do not let a user bypass restrictions by modifying a frontend variable, query parameter, or API request.

For unapproved jurisdictions, disable live purchases and entry registration and display a clear explanation.

Do not assume that a free-entry alternative automatically makes a campaign lawful. Configure alternative entry methods only after appropriate legal review.

# 18. DRAW ENGINE

Build a separate, carefully controlled draw service.

The planned campaign selects 450 distinct winners if the campaign is approved, enough eligible participants exist, and the official rules permit it.

## Before the draw

- Close entry registration.
- Reconcile orders and payments.
- Resolve issuance failures.
- Apply authorized refunds and disqualifications.
- Validate eligibility.
- Create an immutable eligible-entry snapshot.
- Record the snapshot hash.
- Record campaign and rules versions.
- Verify that enough eligible participants exist.
- Require authorized draw approval.

## Selection

Use a cryptographically secure random selection procedure.

The system must:
- Select only from the approved snapshot.
- Enforce winner uniqueness per participant where required.
- Record algorithm name and version.
- Record input snapshot hash.
- Record eligible-entry count.
- Record winner count.
- Record selected identifiers.
- Persist results in a tamper-evident or immutable audit structure.
- Prevent unauthorized alteration.

If the official rules require independently verifiable randomness, an independent auditor, or a public verification procedure, implement that approved procedure.

Do not describe a draw as independently audited unless it actually has been.

## Failure recovery

If a draw fails:
- Record the failure and reason.
- Preserve the original snapshot.
- Preserve logs and execution state.
- Prevent concurrent duplicate draws.
- Resume only according to a documented recovery process.
- Do not silently replace the selected winners.
- Require appropriate approval for reruns or replacement procedures.

## Publication

Publish results only after all required verification, review, approval, and privacy checks have completed.

Keep private winner records separate from public winner display records.

# 19. SECURITY

Implement:
- Secure password hashing.
- Email verification.
- Single-use password reset tokens.
- Session expiration and revocation.
- Server-side role checks.
- Strict CORS allowlists.
- HTTPS.
- CSRF protection where relevant.
- Rate limiting.
- Request size limits.
- SQL injection protection.
- Safe error messages.
- Security headers.
- Dependency vulnerability scanning.
- Upload validation.
- Secure secrets management.
- Least-privilege database credentials.
- Audit logging.
- Automated backups.
- Tested database recovery.
- Data minimization and retention policies.

Do not expose internal exceptions, stack traces, database credentials, secret keys, webhook secrets, passwords, or raw sensitive records.

Use secure cookies if cookie-based sessions are chosen. If JWTs are used, define expiration, refresh, revocation, and storage rules carefully.

# 20. API ENDPOINTS

Use the `/api/v1/` prefix.

## Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh` where applicable
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`

## Users

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/me/coupons`
- `GET /api/v1/users/me/entries`
- `GET /api/v1/users/me/transactions`
- `GET /api/v1/users/me/notifications`
- `GET /api/v1/users/me/wins`

## Campaigns

- `GET /api/v1/campaigns`
- `GET /api/v1/campaigns/{campaign_id}`
- `GET /api/v1/campaigns/{campaign_id}/progress`
- `GET /api/v1/campaigns/{campaign_id}/rules`
- `GET /api/v1/campaigns/{campaign_id}/draw-status`
- `GET /api/v1/campaigns/{campaign_id}/winners`

## Eligibility

- `GET /api/v1/eligibility/me`
- `POST /api/v1/eligibility/check`
- `POST /api/v1/eligibility/submit` where required

## Coupons and entries

- `POST /api/v1/coupons/validate`
- `POST /api/v1/coupons/redeem`
- `GET /api/v1/coupons/{coupon_id}`
- `GET /api/v1/entries/{entry_id}`

## Orders and payments

- `POST /api/v1/orders`
- `GET /api/v1/orders/{order_id}`
- `POST /api/v1/payments/checkout`
- `GET /api/v1/payments/{payment_id}`
- `POST /api/v1/payments/webhooks/{provider}`

Webhook endpoints must implement provider-specific signature verification.

## Support

- `POST /api/v1/support/tickets`
- `GET /api/v1/support/tickets`
- `GET /api/v1/support/tickets/{ticket_id}`
- `POST /api/v1/support/tickets/{ticket_id}/messages`

## Administration

Create appropriately permission-protected endpoints for users, campaigns, coupons, entries, payments, compliance, countries, draws, winners, content, SEO, notifications, support, and audit logs.

All endpoints must enforce authorization, validate inputs, check ownership, and return consistent error responses.

# 21. SEO

Implement technical SEO for public pages.

Requirements:
- Unique page titles.
- Accurate meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Social sharing images.
- Correct language metadata.
- XML sitemap.
- `robots.txt`.
- Clean URL structure.
- Correct status codes.
- Optimized images.
- Meaningful alt text.
- Internal linking.
- Fast page loads.
- Good Core Web Vitals.
- Accessible HTML.
- Structured data only when appropriate.

Use valid Organization, WebSite, BreadcrumbList, and other eligible structured data only when the facts are accurate.

Never fabricate ratings, reviews, awards, winners, prices, or offers.

Keep private account pages, dashboards, coupon details, admin pages, and other sensitive routes out of search indexing. Remember that `noindex` is not a substitute for authentication.

Provide instructions for Google Search Console and privacy-compliant analytics configuration.

# 22. ACCESSIBILITY AND RESPONSIVENESS

Target WCAG 2.2 AA where practical.

Implement:
- Semantic HTML.
- Keyboard navigation.
- Visible focus.
- Accessible forms.
- Proper labels.
- Screen-reader announcements.
- Sufficient contrast.
- Accessible dialogs and menus.
- Reduced-motion support.
- Touch-friendly controls.
- Responsive tables.
- Chart descriptions.
- Appropriate alt text.

Test mobile, tablet, laptop, and large desktop layouts.

# 23. PERFORMANCE AND RELIABILITY

Design for high traffic and concurrent coupon redemption.

Implement:
- PostgreSQL connection pooling.
- Indexed queries.
- Paginated tables.
- Efficient progress calculations.
- Appropriate cache use.
- Durable background jobs.
- Bounded retries.
- External-service timeouts.
- Rate limiting.
- Query monitoring.
- Concurrency testing.
- Payment reconciliation.
- Database backups.

Never use a cached value to authorize payments, coupon issuance, redemption, capacity allocation, or draw execution.

The system must maintain data integrity if Redis or an email provider becomes unavailable.

# 24. LOGGING AND MONITORING

Implement:
- Structured JSON logs.
- Correlation IDs.
- Health checks.
- Readiness checks.
- Error monitoring.
- API latency metrics.
- Database monitoring.
- Payment reconciliation alerts.
- Coupon issuance failure alerts.
- Capacity boundary alerts.
- Draw failure alerts.
- Notification delivery reports.
- Backup monitoring.

Provide:
- `GET /health`
- `GET /ready`

Do not include secrets or sensitive personal data in health responses.

# 25. TESTING REQUIREMENTS

Write automated tests for the actual implementation.

## Unit tests

Test:
- Secure coupon generation.
- Coupon verification.
- Uniqueness collision handling.
- Campaign state transitions.
- Eligibility rules.
- Capacity allocation.
- Payment idempotency.
- Coupon redemption.
- Draw selection.
- Winner uniqueness.
- Permissions.
- Refund transitions.

## Database integration tests

Test:
- Unique constraints.
- Foreign keys.
- Transaction rollback.
- Concurrent redemption.
- Concurrent capacity allocation.
- Duplicate webhook delivery.
- Payment success with failed issuance.
- Safe campaign restart.
- Draw recovery.

## API tests

Test registration, authentication, permissions, ownership, coupon validation, redemption, payment webhooks, campaign progress, dashboard records, and administrative actions.

## Frontend tests

Test forms, navigation, loading states, error states, empty states, protected pages, mobile navigation, dashboard access, and accessibility-critical controls.

## End-to-end tests

Test a complete development or sandbox journey:
1. Register.
2. Verify email.
3. Check eligibility.
4. Complete a sandbox payment.
5. Receive a coupon.
6. Validate the coupon.
7. Redeem the coupon.
8. Confirm the entry in the dashboard.
9. Simulate the campaign reaching capacity.
10. Verify that extra allocations are rejected.
11. Prepare a test draw.
12. Verify distinct winners and published results in the test environment.

Use a dedicated test database and synthetic test data. Never run destructive tests against production records.

# 26. SEED DATA

Provide a development-only seed script for destinations, FAQs, draft campaigns, sample users, test coupons, test orders, and test entries.

Mark all seed data clearly as non-production.

Never seed fake production winners, fake customer testimonials, invented legal approvals, false live-entry counts, or fabricated partnerships.

Do not create a publicly accessible default administrator automatically in production.

If demo mode is included, disable live payments, production entries, and real draw execution.

# 27. ENVIRONMENT CONFIGURATION

Provide `.env.example` with placeholder values, including:

```text
APP_ENV=development
APP_NAME=Tour Raffle API
API_V1_PREFIX=/api/v1

DATABASE_URL=

FRONTEND_URL=
CORS_ALLOWED_ORIGINS=

SECRET_KEY=
SESSION_SECRET=

PAYMENT_PROVIDER=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM_ADDRESS=

REDIS_URL=

OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=

LOG_LEVEL=INFO
SENTRY_DSN=

ENABLE_LIVE_PAYMENTS=false
ENABLE_LIVE_ENTRIES=false
ENABLE_LIVE_DRAW=false
```

Adjust names as required by the actual codebase.

Never hardcode real credentials or expose secrets in the frontend.

Validate critical configuration at startup and fail safely if production configuration is missing.

# 28. DEPLOYMENT AND CI/CD

Prepare:
- Frontend deployment configuration.
- Backend Dockerfile.
- Production ASGI server configuration.
- Database migrations.
- Environment-specific settings.
- HTTPS.
- CORS.
- Health checks.
- Error monitoring.
- Backup configuration.
- Recovery instructions.
- CI/CD pipeline.

Automate formatting, linting, type checking, tests, production builds, dependency checks, and migration validation.

Use separate development, staging, and production environments.

Do not deploy destructive database migrations without review and a recovery plan.

# 29. REQUIRED DELIVERABLES

Deliver:
1. Complete Next.js website.
2. Every specified public page.
3. Authentication system.
4. User dashboard.
5. Administrative dashboard.
6. FastAPI backend.
7. PostgreSQL models and migrations.
8. Backend coupon generator.
9. Coupon validation and redemption.
10. Atomic capacity management.
11. Campaign lifecycle and restart workflow.
12. Payment integration interface.
13. Sandbox payment implementation where available.
14. Country eligibility engine.
15. Compliance approval workflow.
16. Draw engine.
17. Winner management.
18. Audit logging.
19. Notification system.
20. Support ticket system.
21. SEO implementation.
22. Responsive accessible design.
23. Unit and integration tests.
24. End-to-end tests.
25. Development seed script.
26. Docker configuration.
27. `.env.example`.
28. CI/CD configuration.
29. API documentation.
30. Database schema documentation.
31. Security documentation.
32. Deployment instructions.
33. Backup and recovery documentation.
34. Legal and operational launch checklist.

Provide a README explaining how to install dependencies, configure PostgreSQL, run migrations, seed development data, start the frontend and backend, run tests, and deploy.

# 30. IMPLEMENTATION ORDER

Build the platform in this order.

**Phase 1: Foundation**
- Project setup.
- Next.js configuration.
- FastAPI configuration.
- PostgreSQL connection.
- Migrations.
- Authentication.
- Permissions.
- Logging.
- Design system.

**Phase 2: Campaign and compliance**
- Campaign database.
- Campaign states.
- Country approval workflow.
- Eligibility policies.
- Rules versioning.

**Phase 3: Coupon engine**
- Secure code generation.
- Coupon persistence.
- Validation.
- Redemption.
- Idempotency.
- Atomic capacity allocation.
- Concurrency tests.

**Phase 4: Orders and payments**
- Orders.
- Sandbox payment.
- Webhook verification.
- Reconciliation.
- Issuance recovery.

**Phase 5: Public website**
- Homepage.
- Destination pages.
- Prize pages.
- Campaign pages.
- FAQ and help.
- Legal pages.
- SEO and accessibility.

**Phase 6: User dashboard**
- Profile.
- Eligibility.
- Coupons.
- Entries.
- Transactions.
- Notifications.
- Support.
- Security.

**Phase 7: Admin dashboard**
- Users.
- Campaigns.
- Coupons.
- Entries.
- Payments.
- Countries.
- Compliance.
- Content.
- SEO.
- Audit logs.

**Phase 8: Draw engine**
- Eligible-entry snapshot.
- Snapshot integrity.
- Draw authorization.
- Secure selection.
- Winner verification.
- Publication.

**Phase 9: Quality and security**
- Automated tests.
- Concurrency tests.
- Load tests.
- Security review.
- Accessibility review.
- SEO review.
- Backup restoration test.

**Phase 10: Staging and launch readiness**
- Staging deployment.
- Sandbox end-to-end tests.
- Monitoring verification.
- Payment reconciliation tests.
- Legal approval verification.
- Production launch checklist.

# 31. FINAL ACCEPTANCE CRITERIA

Do not consider the platform complete merely because it looks good.

The project must demonstrate that:

- Every specified page exists.
- All navigation works.
- User and admin permissions are enforced on the backend.
- FastAPI connects successfully to PostgreSQL.
- Database migrations work.
- The frontend calls real API endpoints.
- Coupon codes are generated by the backend.
- Coupon codes are unique and unpredictable.
- Redemption is atomic.
- Duplicate redemption is rejected.
- Payment webhooks are verified and idempotent.
- Issuance failures can be recovered.
- Campaign capacity cannot be exceeded under concurrent requests.
- The final available slot is handled correctly.
- Campaign restarts do not erase historical records.
- Only approved jurisdictions can accept live entries.
- Draw inputs and outputs are auditable.
- Duplicate winners are prevented where required.
- Results cannot be silently overwritten.
- Private pages and data are protected.
- No fake live integrations or invented approvals are presented as real.
- SEO, accessibility, and responsive behavior have been tested.
- Automated tests pass.
- Deployment and recovery documentation is complete.

# 32. FINAL INSTRUCTIONS

Build Tour Raffle as a real, maintainable, full-stack application.

Do not generate only a visual mockup. Do not put critical business logic in the frontend. Do not use browser storage as the database. Do not use frontend-generated coupon codes. Do not trust browser payment confirmations. Do not exceed the campaign capacity. Do not allow duplicate redemption. Do not reset production campaign data. Do not silently rerun draws. Do not fabricate winners, partnerships, legal approvals, testimonials, or operational metrics.

Do not claim that a payment provider, email provider, database, or deployment is operational unless it has actually been configured and tested.

When a feature depends on missing credentials, legal approval, or an external account, implement the integration structure, explain the remaining setup, and keep the relevant live feature disabled.

Start by inspecting the available project environment. Establish the repository structure, connect FastAPI to PostgreSQL, implement migrations and authentication, and build the campaign and coupon foundations. Then continue through the complete implementation phases.

At the end of each phase, report:
- Features implemented.
- Files and modules created.
- Database migrations added.
- Operational API endpoints.
- Automated tests and results.
- Integrations awaiting credentials.
- Known limitations.
- Outstanding legal or compliance requirements.
- Next steps.

**The final result must be a professional, secure, responsive, auditable Tour Raffle platform with a premium travel website experience and a real FastAPI/PostgreSQL backend—not merely a polished homepage.**

---

# PART II — BINDING SCREEN-BY-SCREEN FLOW AND UI PRESERVATION ADDENDUM

This part combines the existing reference screens into one implementable application flow. It adds functionality to the original specification; it does not replace the original security, database, eligibility, draw, capacity, or legal requirements. When the original text suggests designing a different interface, the preservation override at the top takes precedence.

## A. Design inventory and visual contract

**Desktop public website** — use both `Tour Raffle Travel Website Triptych` images: existing dark navy travel brand, turquoise destination water imagery, gold CTA buttons, hero/marketing sections, page navigation, campaign discovery and footer. Do not replace original hero photograph or shift section order.

**Authentication** — `Tour Raffle Authentication UI Collage(1).png`: preserve login/register forms, admin sign-in visual, split image-panel arrangements where present, social icons, small controls, validation placements and password recovery visuals.

**Admin** — `Tour Raffle Admin Dashboard Suite(1).png`: preserve top bar, left navy sidebar, white/light-blue content panel, narrow data tables, four-card KPI rows, chart styling, blue/green/orange/red status badges, action icons, golden primary buttons. Existing admin screens visible include admin login, dashboard overview, campaign management/create, coupon inventory/generation/management, user management/details, eligibility verification, payment management/details, entry management, draw management/execution, winner management/claims, CSV exports, audit logs and settings.

**User dashboard** — `Tour Raffle Dashboard UI Collage(1).png` and both `Tour Raffle Travel Dashboard Mockup` images: preserve dark navy left navigation, top search/profile bar, scenic promotional panels, white dashboard cards, compact stats, payments, transactions, receipts, notifications, support and profile sections. Dashboard footer stays consistent.

**Responsive** — `Tour Raffle Responsive UI Showcase(1).png`: mobile screen arrangements for 11 groups, listed below. At mobile widths implement the shown compact header and card stacking; preserve the original desktop layouts at desktop widths.

**Purchase and entry** — `Tour Raffle Dashboard UI Sitemap(1).png`: precise coupon purchase/checkout/payment-state/entry-registration compositions and shared footer, described in detail below. This is a flow map, not a license to redesign the rest of the site.

**Style invariants**: exact existing logo; navy header/sidebar; existing tropical travel imagery; gold/yellow CTAs; original icon treatment; rounded white/light-blue bordered panels; light-blue table headers; compact badges; small stepper circles; original footer. Derive actual CSS variables and fonts from repository/screenshots; approximate hex values from a prior assistant prompt are not authoritative. Preserve original visual copy on existing pages.

## B. Canonical navigation and route compatibility

Use the **existing repository routes as canonical**. Original master spec lists `/login`, `/register`, `/faq`, `/admin/raffles`, `/dashboard/transactions`, etc. The screenshot flows also refer to `/sign-in`, `/sign-up`, `/faqs`, `/admin/campaigns`, `/dashboard/payments`, `/dashboard/coupons/purchase`, etc. Do not create competing duplicate page implementations: keep existing URLs and add aliases/redirects where needed. In the route registry map each screenshot to its current route and its alias. A suggested compatibility map (adapt to actual project):

- Public: `/`, `/current-raffle`, `/raffles/[id]`, `/how-it-works`, `/winners`, `/faq` (`/faqs` alias), `/contact`, `/about`; retain all additional public routes in original spec (`/destinations`, `/prizes`, `/entry-rules`, `/draw-process`, `/live-progress`, legal pages).
- Auth: `/login` (`/sign-in` alias), `/register` (`/sign-up` alias), `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-eligibility`, email-verified completion state.
- User: `/dashboard`, `/dashboard/profile`, `/dashboard/security`, `/dashboard/eligibility`, `/dashboard/coupons`, `/dashboard/coupons/[id]`, `/dashboard/coupons/purchase`, `/dashboard/checkout`, `/dashboard/payment/processing`, `/dashboard/payment/success`, `/dashboard/payments` (alias or section for transaction listing), `/dashboard/transactions`, `/dashboard/receipts`, `/dashboard/entries`, `/dashboard/entries/register`, `/dashboard/notifications`, `/dashboard/support`, `/dashboard/support/[id]`, `/dashboard/wins`.
- Winner/draw public/user: `/draw-results`, `/verify-winning-code`, `/winner-verification`, `/winner-details`, `/prize-claim`, `/prize-claim/status`, `/draw-audit` when permitted by rules and privacy.
- Admin: `/admin` and `/admin/login`; original `/admin/raffles` may alias `/admin/campaigns`; add `/admin/campaigns/create`, `/admin/campaigns/[id]/edit`, `/admin/coupons/inventory`, `/admin/coupons/generate`, `/admin/entries`, `/admin/draws`, `/admin/draws/[id]`, `/admin/winners`, `/admin/winner-claims`, `/admin/refunds`, `/admin/reports`, `/admin/reports/exports`, `/admin/audit-logs`, `/admin/settings`, while preserving all original admin modules.

Never expose a private screen merely because its URL is known; enforce role/ownership/eligibility server-side.

## C. Public website journey — exact existing design, working navigation

**C1 Homepage**: existing Tour Raffle navbar/logo; tropical destination hero with dark gradient; existing heading and gold CTA; campaign discovery and destination previews in screenshot order; stats/progress only from verified backend; footer. CTA -> current approved raffle/campaign; if unavailable -> restricted/unavailable screen. No invented urgency or false activity.

**C2 Current raffle**: campaign image, title, four compact metrics if shown, real progress, entry price, availability, `Get Tickets`/existing CTA -> campaign details or purchase (depending on existing screen behavior). Capacity and dates server-derived.

**C3 Raffle details**: campaign hero, destination/prize inclusions, dates, price, official rules, eligibility, travel restrictions, progress, gold CTA. Auth gate -> sign in then return to intended campaign; eligibility/legal gate before checkout.

**C4 How it works**: existing four-step mobile visual stepper (e.g. buy coupon, get entries, wait for draw, win/travel) must remain visually unchanged. For compliance, accompanying explanation must clarify approved entry methods and that participation does not guarantee a win; do not rewrite established step titles just to align with an earlier planning draft.

**C5 Winners**: existing winner portrait and destination photo gallery; link to permitted winner details; public winner information only after verification and consent. No seeded public fake winners.

**C6 FAQ**: compact accordion with keyboard and screen-reader support; categories as present; accordion open/close, links to rules/support.

**C7 Contact**: contact information and existing compact form; validate -> create backend ticket/contact message -> confirmation, rate limiting and spam prevention.

**C8 About**: existing scenic header, descriptive content, trust/value icons and established footer. Accurate company facts only.

**C9 Additional original-spec pages**: destinations/details, prizes, entry rules, draw process, live progress, legal/help/cookies/restricted access. For screens not in the references, reuse public navbar, hero/card/button/footer primitives without inventing a new theme.

## D. Authentication and account flow

**D1 Sign up**: existing fields full name/email/password, original gold button and Google/Apple controls where already visible. Validate -> backend register -> email verification. Do not fake OAuth providers; disable or mark unconfigured providers.

**D2 Sign in**: email/password, remember-me if present, forgot password link, existing gold sign-in button -> correct user or admin landing route by backend role; preserve intended redirect.

**D3 Forgot password**: email -> non-enumerating success message -> expiring reset token email.

**D4 Reset password**: new/confirm password -> validate token -> reset -> revoke sessions as appropriate -> success/sign-in.

**D5 Email verification**: existing code-input UI (including six-slot layout where shown), resend timer/action, invalid/expired code errors -> verified success card with large green check -> Continue.

**D6 Session expired**: screenshot illustration, heading and gold sign-in CTA; return to intended route after reauth if authorized.

**D7 Account recovery**: existing recovery form, backend-secured token process, no account enumeration.

## E. User dashboard, settings, support

**E1 Dashboard**: existing personalized greeting, KPI cards (coupon total, entry total, spend, winning chances where mathematically and legally supportable), scenic active raffle, recent activity. Fetch authenticated metrics; preserve original image placement, banner and footer.

**E2 Coupon management**: refer to section F for full flow.

**E3 My entries**: refer to section G.

**E4 My payments**: existing summary cards for total spent/successful/pending/failed; filterable table; `Make Payment`/purchase CTA only when permitted. `View` -> payment detail/receipt.

**E5 Transaction history**: filter by type/date/status; existing table style, pagination, accurate provider-backed status, receipt link.

**E6 Payment receipts**: receipt rows with `Download`; generate downloadable authorized receipt from backend with transaction ID, currency, taxes/fees and provider status. Never display card PAN.

**E7 Notifications**: original icon list and timestamp arrangement; mark read/all read, navigate to related transaction/entry/ticket; secure recipient ownership.

**E8 Support tickets**: tabs All/Open/In Progress/Resolved/Closed; create new ticket; view ticket details and conversation; user reply -> backend message, status update, notification. Preserve screenshots' small badges and gold action.

**E9 Profile settings**: preserve nested left/vertical settings menu, user avatar, form and save button. Sections: personal information, email/phone, notification preferences, language/region, privacy. Only fields already present should be shown on existing screenshot pages; additional settings can use established subpanels.

**E10 Security**: current/change password, two-factor configuration if integrated, login activity, active sessions and session revocation. Security controls require reauthentication as appropriate.

**E11 My wins**: authenticated user's genuine wins, claim status and link to winner workflow; never display fake awards.

## F. Coupon purchasing and payment journey — reference sitemap authority

**F1 Coupon Management** (`/dashboard/coupons`): page title `Coupon Management`, subtitle `Manage your purchased raffle coupons. Track their status and view details.` Top-right gold `Buy More Coupons`. Four compact cards: Total Coupons 12, Active Coupons 10, Redeemed Coupons 1, Expired Coupons 1 **as reference demo data only**. Tabs All/Active/Redeemed/Expired; code search; Newest First sort; table columns Coupon Code, Purchase Date, Status, Valid Until, Actions. Coupon codes in blue outlined pills with copy icon, green Active/Redeemed badges, muted Expired badge, dark navy `View Details` pills. Live numbers/codes must come from user's own API records.

**F2 Buy More Coupons -> Purchase Coupons** (`/dashboard/coupons/purchase`): retain scenic navy/turquoise header and original user sidebar. Horizontal stepper `1 Select Quantity -> 2 Payment -> 3 Confirmation`. Four quantity cards exactly as reference demo pricing: 1 coupon $10.00, 5 coupons $45.00 (save 10%), 10 coupons $80.00 (save 20%, gold `Most Popular` tag and selected border), 20 coupons $150.00 (save 25%). Preserve white cards, navy `Select` buttons and gold selected outline. The screenshot order summary displays quantity, subtotal, discount and total; screenshot example 10 coupons $80 subtotal, -$16 discount, $64 total is **internally inconsistent with a displayed $80 package price**. Resolve in production through ONE authoritative backend price calculation and show consistent subtotal/discount/final total without changing card styling. Never hardcode these sample values as actual live prices. Gold `Proceed to Checkout`.

**F3 Eligibility before payment**: authenticate -> check jurisdiction/campaign approval/age/entry limits/availability and rules acceptance. If blocked show the existing restricted-access design/state; do not proceed. For approved campaigns create order with backend pricing, currency, idempotency key and capacity reservation policy.

**F4 Checkout** (`/dashboard/checkout`): scenic header, page heading, left white payment-method panel, right order summary. Radio cards for Credit/Debit Card (Visa/Mastercard), PayPal, Mobile Money, Bank Transfer **only when actual approved provider supports each method in user's country**. Terms & Conditions / Privacy Policy checkbox; gold `Pay Now`. All payment details handled via approved hosted checkout/tokenization; no raw card storage. Display backend-computed total.

**F5 Processing Payment** (`/dashboard/payment/processing`): original centered blue spinner and vertical four-stage checklist: Verifying payment details -> Processing with payment provider -> Confirming transaction -> Issuing your coupons. Current step blue, completed green, future muted. Poll/subscribe to verified backend payment state; don't advance to success on a timer or frontend redirect alone. Handle slow mobile money authorization safely.

**F6 Payment Successful** (`/dashboard/payment/success`): green check/confetti, original title `Payment Successful!`, transaction detail card (reference ID, amount paid, payment method, date), `Your Coupons` card, `View Coupons` and gold `Back to My Coupons`. Backend must verify payment and idempotently issue coupon(s) before showing issuance as complete. If paid but issuance is delayed, show a truthful processing/reconciliation state rather than success with nonexistent coupons.

**F7 Payment Failed**: red X state, `Try Again` gold button, `Contact Support` outline. Persist failure; retry must use safe provider semantics and avoid double charge.

**F8 Payment Cancelled**: orange status icon, gold `Back to Coupons`; say `No charges were made` ONLY after provider verification; otherwise explain that payment status is being checked.

**F9 Payment Pending**: blue clock state, gold `Check Status`; provider status polling/webhook reconciliation, no duplicate issuance or payment.

**F10 Coupon Details**: modal with heading, close icon, coupon code (mask by default where appropriate), status, purchased date, expiry, campaign, QR where securely supported, `View Raffle Details` CTA. User must own coupon.

**F11 Coupon status examples**: Active green/Ready to use; Redeemed green/Already used; Pending orange/Payment processing; Expired muted blue/Past valid date; Invalid red/Not valid. Keep the five-card compact horizontal visual shown.

**F12 Copy Code**: blue outlined code pill, navy `Copy Code`; on success small green `Copied!` alert; failure red `Failed to copy. Try again.` Use clipboard API and permission fallback; only show full redeemable code when authorized.

**F13 Receipts/refunds**: payment history -> details -> receipt; admin refund/dispute handling and webhook reconciliation, coupon/entry invalidation only under documented campaign rules and auditable backend operations.

## G. Raffle entry and validation journey — reference sitemap authority

**G1 Entry Management** (`/dashboard/entries`): scenic header, heading `Entry Management`, subtitle, four KPI cards Total Entries 48, Confirmed Entries 45, Pending Review 2, Invalid Entries 1 **reference fixtures only**. Tabs All/Confirmed/Pending/Invalid; search by code/reference; All Campaigns filter; Newest First; table Entry Code, Coupon Code, Campaign, Status, Entry Date, Actions. Preserve light-blue header, compact colored status badges, blue outlined code pills, `View` actions and page controls.

**G2 Register Your Entry** (`/dashboard/entries/register`): scenic header, heading `Register Your Entry`, horizontal stepper `1 Enter Code -> 2 Verify -> 3 Confirmed`; coupon code field (example format `TRF-7X9K-382P-8Q6L`), gold `Check Code`, pale blue `Quick Tips` panel and `Back to My Entries` link. Preserve exact original alignment and spacing.

**G3 Entry Verification**: same photographic banner, selected code pill, centered blue spinner, heading `Checking your entry...`, four-stage vertical checklist: Validating coupon code -> Checking campaign status -> Verifying entry eligibility -> Registering your entry. Frontend only reflects actual server operation state. Use atomic redemption and unique constraints to avoid race conditions.

**G4 Confirmed**: after valid redemption show success/confirmation using established gold/navy/green visual language, create backend entry, update coupon to redeemed, update entry stats, notify user. A paid coupon is not necessarily an entry until its required registration/redemption process completes under approved rules.

**G5 Error/state cards**: implement screenshot-matching standalone panels, not browser alerts: `Invalid Coupon` (red X, `Try Again`); `Already Used` (blue lock, `View My Entries`); `Entry Pending Review` (orange clock, `View Status`); `Entry Not Found` (blue info, navigate to appropriate campaign/help—reference copy appears ambiguous, do not falsely say a campaign ended unless verified); `Campaign Closed` (blue info, `View Other Raffles`); `Campaign Full` (blue info, `View Other Raffles`). Status derives from authoritative backend error codes, not a random local flag.

**G6 Entry Registration Flow**: compact four-step horizontal reference component: Enter Code -> Verify -> Confirm -> Success; thin connecting line, outlined blue icons and green completion check.

**G7 Entry Status Overview**: six compact cards Confirmed, Pending, Invalid, Already Used, Campaign Closed, Campaign Full, using screenshot's respective icon colors and short descriptions.

**G8 Promotion**: scenic banner bottom-right `Your Next Big Win Starts Here.` with gold `Enter Raffle Now` and arrow. CTA only enabled for an approved/open/eligible campaign.

## H. Winner, draw and prize-claim journey

**H1 Official Draw Results**: screenshot's trophy illustration, `Official Draw Results`, selected winner count, gold `View Winners`; only published approved draw results.

**H2 Winning Code Verification**: code input, verification copy, gold `Verify Code` -> backend winner lookup with privacy-aware responses; avoid leaking private full codes.

**H3 Winner Verification**: existing success/check illustration and checklist, progress status, gold `View Results`; must reflect verified results.

**H4 Winner Details**: winner profile, campaign/prize, claim state and action; authenticated private details only to owner, public version consent-filtered.

**H5 Prize Claim Instructions**: existing four-step vertical stepper Verify Identity -> Submit Documents -> Confirm Details -> Receive Prize; accurate rules/deadlines.

**H6 Prize Claim Submission**: existing form (name, email, phone, other approved fields), secure document upload when legally required, gold `Submit Claim`; virus/file validation and minimal data retention.

**H7 Prize Claim Status**: vertical timeline Claim Submitted -> Under Review -> Approved -> Payment Pending / fulfillment as applicable; never promise a payment or prize delivery before confirmed.

**H8 Draw Verification & Audit**: read-only audit information, verified auditor information ONLY if real, report download if authorized. Backed by snapshot hash, algorithm version, immutable audit trail, required approvals and publication consent.

## I. Admin journey — preserve existing desktop dashboard and mobile adaptation

**I1 Admin Login**: original image-panel / compact mobile form, username/email/password and gold sign-in; backend role gate and optional MFA.

**I2 Admin Overview**: existing four KPI cards (campaigns, users, revenue, entries), performance line chart, recent activity; accurate metrics, dates and statuses; no static screenshot numbers in production.

**I3 Campaign Management**: search/filter/status table with campaign name, prize, status, start/end dates and action icons; gold `Create Campaign`; open detail/edit via current route.

**I4 Create/Edit Campaign**: existing compact white form: campaign name, description, prize value/currency, start/end dates and gold `Save Campaign`. Extend functionality behind existing form for jurisdiction, rules, capacity, image uploads and approval without changing visible reference layout; use established additional subpanels when necessary. Draft -> submit -> compliance approval -> publish -> pause/close, with immutable/versioned critical fields once entries exist.

**I5 Coupon Inventory**: existing KPI cards and batch table; gold `Generate Coupons`. Backend-only secure generation, collision handling, uniqueness and audit logs.

**I6 Coupon Generation**: campaign selector, quantity, prefix/format, preview, gold `Generate Coupons`; permission gate, preview nonauthoritative, backend secure random generation and audit. Never expose generation secrets.

**I7 Coupon Management**: searchable coupon status table, batch/ownership detail, masked codes and permitted actions; never leak all redeemable codes.

**I8 User Management**: search, role filter, status filter, rows with name/email/role/status/join date/actions, gold `Add User` only if allowed; secure role assignment.

**I9 User Details**: screenshot's profile left panel, Overview/Activity/Transactions/Entries tabs, action buttons Edit User/Change Role/Suspend/Reset Password; require permissions and audit; never expose another user's secrets.

**I10 Eligibility Verification**: search, campaign/status filters, user table, review action; approve/reject/request info with reviewer identity, policy version and timestamp.

**I11 Payment Management**: KPI cards Total Payments/Successful/Pending/Failed; table dates/users/amounts/methods/status/actions; payment detail screen with `Download Receipt`, `View User`, `Refund Payment` only if policy and provider allow.

**I12 Entry Management**: KPI cards, search/filter, entries table; verify/review/flag entries through audited backend operations.

**I13 Draw Management**: campaign selector, scheduled draws and completed draws, status tags, gold `Manage Draw`; manage approval/closing/snapshot workflow.

**I14 Draw Execution & Verification**: screenshot's multi-step progress `Prepare -> Execute -> Verify -> Publish`; prerequisite checklist `Verify eligible entries`, `Validate winning codes`, `Check for duplicates`, `Confirm prize allocation`, draw summary, gold `Verify & Continue`. Backend controls lock/snapshot/authorization/random selection/uniqueness/approval; no unrestricted rerun.

**I15 Winner Management**: four KPI cards, winner table and status/actions; manage verification, claim status and privacy-safe publication.

**I16 Winner Claim Management**: claim stats and chart; review documents, deadlines, approvals, disputes and fulfillment events; audit all changes.

**I17 Refunds & Disputes**: compact list with statuses, reason, payment and entry linkage; authorized refund and provider reconciliation.

**I18 CSV Exports**: existing left export type list, right settings date range/file format/include headers and gold `Generate Export`; permission-aware, escaped CSV formula injection, audited downloads, PII minimization.

**I19 Notification Management**: categories, toggles, delivery records; permissioned send/test controls, accurate status.

**I20 Country Eligibility**: country rows with availability toggle/status; jurisdiction-level approval evidence, age, residency, provider approval; unverified blocked by default.

**I21 Reports & Analytics**: original KPI cards, bar and donut charts, country breakdown; real aggregates and correct currency handling.

**I22 Audit Logs**: date/user/action/entity/IP or metadata as authorized, filters and gold `Create Notification` only if that action actually belongs to existing screenshot page; audit entries append-only/tamper-evident and secrets redacted.

**I23 Admin Settings**: General/Security/Email/Appearance/System tabs if visible; general name/support email/currency/timezone, toggles for maintenance mode, registrations, payments and notifications; gold `Save Settings`. Protect sensitive settings and confirm risky changes.

**I24 System Information / Help & Support / Logout**: existing compact mobile settings pages; logout confirmation modal with Cancel/Logout, revoke session.

**I25 Additional original-spec admin modules**: destinations, content, SEO, compliance, support, role/permission management. Implement as required using existing dashboard layout and components, without new design system.

## J. Responsive screen checklist (reference A)

Match each distinct mobile thumbnail as a responsive state of the corresponding existing page. The 11 groups are:

1. Public Website & Core Pages: Homepage; Current Raffle; Raffle Details; How It Works; Winners; FAQs; Contact Us; About Us.
2. Authentication & Account: Sign Up; Sign In; Forgot Password; Reset Password; email verification request/reset confirmation; verification code; Email Verified.
3. Account Settings: Profile Settings; Edit Profile; Change Password; Account Security; Session Expired; Account Recovery.
4. User Dashboard: Dashboard; My Payments; Transaction History; Payment Receipts; Notifications.
5. Support: Support Tickets; Ticket Details.
6. Winners & Draw: Official Draw Results; Winning Code Verification; Winner Verification; Winner Details; Prize Claim Instructions; Prize Claim Submission; Prize Claim Status; Draw Verification & Audit.
7. Admin Dashboard: Admin Login; Admin Overview; Campaign Management; Create/Edit Campaign.
8. Admin Management: Coupon Inventory; Coupon Generation; Coupon Management; User Management; User Details.
9. Operations: Eligibility Verification; Payment Management; Entry Management; Draw Management; Draw Execution & Verification.
10. Reports & System: Winner Management; Refunds & Disputes; Notification Management; Country Eligibility; Reports & Analytics; CSV Exports.
11. Admin Settings: Audit Logs; Admin Settings; System Information; Help & Support; Logout.

Use existing breakpoints if present. On mobile, compact nav/header, card stacks, forms, table adaptations, status tags and actions exactly as screenshot; on desktop retain original sidebar/topbar/table layout. Do not use horizontal overflow for the page; if an individual dense data table requires internal horizontal scrolling, keep it inside its card with accessible labels. Test 320, 375, 390, 430, 768, 1024, 1280 and 1440px or project breakpoints. Avoid changing original typography or card radius just to make mobile fit.

## K. Functional state machines and event rules

**Campaign**: draft -> pending_review -> approved -> scheduled -> active -> paused/closed/sold_out -> draw_preparation -> drawn -> published -> archived; allow only policy-approved transitions and version critical rules.

**Order**: draft -> eligibility_checked -> pending_payment -> paid / failed / cancelled / expired / refund_pending / refunded; exact status model may vary by provider, but transitions must be explicit and audited.

**Payment**: created -> pending -> authorized (if supported) -> succeeded / failed / cancelled / refunded / disputed; verified webhook or provider API is authority, never frontend redirect. Preserve unknown/reconciliation-required states.

**Coupon**: reserved/awaiting_issue -> active -> redeemed / expired / revoked, with pending issuance recovery. Only backend can create/redeem/revoke.

**Entry**: pending_validation -> confirmed / pending_review / invalid / revoked / disqualified (according to approved rules); do not conflate coupon ownership with confirmed entry.

**Draw**: not_ready -> prerequisites_check -> snapshot_locked -> approved -> executing -> verification -> published; failure -> recorded/review-required, no silent rerun.

**Claim**: not_started -> submitted -> under_review -> approved/rejected/needs_info -> fulfillment_pending -> fulfilled, with dates and reviewer audit.

**Support ticket**: open -> in_progress -> resolved -> closed; replies/notifications audited.

**UI**: each async action must show loading, success, validation error, server error, no-network, unauthorized, empty, pending and retry where appropriate, styled with existing design components. Do not invent a new toast/modal aesthetic.

## L. API mapping — preserve original `/api/v1` and extend only as needed

Use original spec endpoints for auth, users, campaigns, eligibility, coupons, orders, payments, entries, support, admin. Add route handlers or equivalent service methods where the screenshot flow requires them, for example:

- `GET /api/v1/users/me/dashboard` aggregated summary.
- `GET /api/v1/users/me/payments` and `GET /api/v1/users/me/receipts/{id}` (ownership checks).
- `GET /api/v1/users/me/coupons?status=&search=&sort=&page=`.
- `GET /api/v1/users/me/entries?status=&campaign=&search=&sort=&page=`.
- `GET /api/v1/campaigns/{id}/coupon-packages` server-authoritative quantity/price/currency/discount.
- `POST /api/v1/orders` creates server-priced idempotent order after eligibility checks.
- `POST /api/v1/payments/checkout` initializes provider checkout.
- `GET /api/v1/payments/{id}` provides verified processing state.
- `POST /api/v1/payments/webhooks/{provider}` verifies signature and idempotently updates.
- `POST /api/v1/coupons/validate` and `/redeem` implement atomic entry registration.
- `GET /api/v1/entries/{id}` returns owner-visible status.
- `GET /api/v1/users/me/notifications` and appropriate read-state endpoints.
- `POST /api/v1/support/tickets` and ticket message endpoints.
- Admin permissioned endpoints for campaign CRUD/approval, coupon batches, payment reconciliation/refunds, entry reviews, draw authorization/execution, winner/claim reviews, CSV exports, audit logs, country approvals and settings.

Do not duplicate endpoints merely because frontend pages have different names. Use typed schemas, pagination, consistent error codes (e.g. `COUPON_INVALID`, `COUPON_ALREADY_REDEEMED`, `CAMPAIGN_CLOSED`, `CAMPAIGN_FULL`, `ELIGIBILITY_BLOCKED`, `PAYMENT_PENDING`, `PAYMENT_FAILED`) mapped to the existing UI state cards.

## M. Database and transactional invariants

Implement every entity in the original specification, including users/roles, campaigns/versions, eligibility/rules, orders/payments/webhooks/refunds, coupons/redemptions/entries/capacity reservations, draws/snapshots/winners/claims, notifications/support/audit. Add coupon packages/pricing snapshots or derived pricing tables as required. Monetary values use decimal NUMERIC and currency; store price snapshot on order. Unique keys for codes/digests, webhook event IDs, order idempotency keys, redemptions and draw uniqueness. Reserve/finalize/release capacity transactionally so campaign max 450,000 **valid entries** is never exceeded; avoid ambiguous counting of paid-but-unredeemed coupons. Document the campaign's approved counting model and ensure sold-out behavior is consistent with that model. Campaign restart creates a new record and preserves all history. Planned 450 distinct winners requires sufficient eligible distinct participants and rules approval.

## N. Visual QA and regression requirements

Before implementation, create a `docs/ui-reference-map.md` listing each screenshot thumbnail, corresponding route/component, viewport, existing file, missing behavior and completion status. Save screenshots of existing desktop/mobile pages as baselines. After each phase run build/typecheck/lint/tests, and visual screenshot comparisons at matching viewport and content state. Validate logo, background photo/crop, hero overlay, nav height, sidebar width, grid, cards, button shape/height, font, colors, stepper spacing, tables, statuses, footer. Use image diff overlays if tooling allows. **No cosmetic restyling of pre-existing pages**. Record any reference conflicts and preserve the most directly matching original screen. Do not claim 100% exactness without original assets and verified comparison.

**End-to-end acceptance journeys** (sandbox/approved test data only):
1. Guest -> public homepage -> current raffle -> details -> eligibility/rules -> register/login -> verify email -> return to intended raffle.
2. Eligible user -> coupon quantity -> checkout -> provider pending -> verified success -> coupons issued once -> dashboard totals/receipt updated.
3. Payment failed/cancelled/pending -> corresponding screenshot state -> safe retry/check status; no duplicate charge or issuance.
4. Coupon list -> filter/search -> copy -> details modal -> register entry -> backend validation -> confirmed -> coupon redeemed -> entries table updated.
5. Invalid/expired/already used/closed/full/pending-review coupon -> exact matching reference state -> correct next action.
6. User -> notifications -> support ticket -> reply -> ticket status; profile/password/security flows.
7. Admin -> campaign draft -> review/approval -> publish -> coupon generation -> payment review -> eligibility review -> draw prerequisites -> locked snapshot -> authorized test draw -> winner verification -> claim review -> results publication.
8. Admin -> refunds/disputes -> CSV export -> audit logs -> settings -> logout.
9. Concurrent capacity and redemption stress test: never exceed configured limit or double redeem; idempotent duplicate webhooks; issuance failure reconciliation.
10. Responsive navigation and page fidelity across public, auth, user and admin screens; no regression to existing desktop designs.

## O. Mandatory execution plan

**Phase 0: Inspection and freeze** — list current files/routes/components/assets, verify original screenshots against existing UI, create git checkpoint, design freeze and reference map; report ambiguities before destructive changes.
**Phase 1: Backend foundation** — FastAPI, PostgreSQL, Alembic, auth, roles, typed schemas, audit and configuration; do not touch UI styling.
**Phase 2: Campaign/compliance** — jurisdiction approvals, rules versions, eligibility, campaign states, atomic capacity.
**Phase 3: Coupons/orders/payments** — secure generation, packages, idempotent orders, provider sandbox, webhook reconciliation, coupon issuance and receipt generation.
**Phase 4: Connect existing public/auth pages** — API data, routes, validations, real navigation, no visual redesign.
**Phase 5: Connect existing user dashboard** — coupons, entries, payments, notifications, support, settings, receipts.
**Phase 6: Implement screenshot purchase and entry flows** — missing screens/states and steppers using exact established UI.
**Phase 7: Admin functionality** — campaigns, coupon batches, users, eligibility, payments, entries, draw, winners, exports, audits, settings.
**Phase 8: Draw/winner claims** — approved secure draw engine, snapshot/audit, claim workflow, privacy-safe publication.
**Phase 9: Responsive fidelity** — all 11 mobile screen groups, preserving desktop.
**Phase 10: Testing, security, deployment** — unit/integration/E2E/concurrency, visual diffs, CI/CD, staging, documentation, launch gates.

At each phase provide completed routes/files, API endpoints, migrations, tests, screenshots or visual comparison results, credentials/integrations missing, known issues and next steps. Continue until all specified screens and backend features are implemented or clearly identify external blockers.

## P. Absolute final acceptance criteria

- Existing Tour Raffle UI/UX is preserved; no logo, hero, navbar, footer, cards, spacing, color or typography redesign.
- Every original-spec public/user/admin route exists and every referenced screen/state is mapped and implemented.
- Both desktop and mobile views match their respective supplied references as closely as the available assets permit.
- All buttons, links, tabs, filters, search, pagination, forms, modals, copy actions, steppers, downloads and notifications are wired.
- Coupon purchase, checkout, payment processing, success/failure/cancel/pending, coupon details, entry registration and all entry error states are end-to-end functional in sandbox.
- Backend FastAPI/PostgreSQL owns validation, authorization, payment confirmation, capacity, coupon issuance, redemption, draw and claim state.
- Planned 450,000-entry capacity and 450 distinct winners are configurable and subject to approved rules, verified eligibility and sufficient participants.
- No invented live metrics, winners, partner integrations, approvals or provider success.
- Real-money participation, live entries and production draws remain OFF until documented jurisdiction, campaign and payment-provider approval.
- Security, concurrency, regression and responsive tests pass; provide a truthful completion report.

**FINAL COMMAND: IMPLEMENT THE EXISTING TOUR RAFFLE DESIGN, NOT A NEW ONE. Use the uploaded screenshots to dictate appearance, use the original specification to dictate the secure business logic, and use this addendum to dictate exact page-to-page navigation, component states and responsive behavior.**
