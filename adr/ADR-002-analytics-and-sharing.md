# ADR-002 — Analytics & Result Sharing

Date: 2026-03-11
Status: Amended (2026-03-11 — analytics dropped, see below)

## Context

Scoping session decisions for analytics and result sharing features.

## Decisions

| Concern | Decision | Rationale |
|---|---|---|
| ~~Analytics~~ | ~~Umami (self-hosted)~~ | dropped — see amendment |
| Analytics | **None** | Site stores no user data. Dropping analytics removes any GDPR obligation entirely. |
| ~~Analytics database~~ | ~~PostgreSQL container~~ | dropped with Umami |
| Result sharing | Shareable URL (state in URL hash) + html2canvas PNG export | Client-side only, no backend required |
| Styling reference | Wahl-O-Mat parody (orange, white, minimalist) with subtle distortions | Deadpan mimicry amplifies satire |

## Amendment — 2026-03-11

Originally planned Umami + PostgreSQL. Decision reversed: adding analytics would create a GDPR disclosure obligation that didn't exist before. Dropping it keeps the stack trivially compliant with zero legal overhead.

## docker-compose Services (final)

1. `caddy` — reverse proxy, SSL termination, serves static app files

That's it.

## Consequences

- No backend, no database, no analytics containers
- All state client-side: no cookies, no session storage
- html2canvas runs in-browser
- No Datenschutzerklärung required (no data processing)
- Impressum still recommended for public German domain
