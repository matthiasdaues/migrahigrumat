# ADR-002 — Analytics & Result Sharing

Date: 2026-03-11
Status: Accepted

## Context

Scoping session decisions for analytics and result sharing features.

## Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Analytics | Umami (self-hosted) | Lightweight, GDPR-compliant, no cookie banner needed |
| Analytics database | New isolated PostgreSQL container with own data volume | No shared infrastructure, clean separation |
| Analytics access | Not publicly exposed — SSH tunnel only | No need for public dashboard |
| Result sharing | Shareable URL (state in URL hash/params) + html2canvas PNG export | Client-side only, no backend required |
| Styling reference | Wahl-O-Mat parody (orange, white, minimalist) with subtle distortions | Deadpan mimicry + visual uncanny valley sharpens satire |

## docker-compose Services

1. `caddy` — reverse proxy, SSL termination, serves static app files
2. `umami` — analytics dashboard (internal only)
3. `postgres` — dedicated database for Umami, own named volume

## Consequences

- No separate app container needed — Caddy serves static files directly
- Umami reachable only via SSH tunnel on deploy user
- All state client-side: no session storage, no cookies
- html2canvas runs in-browser — no server-side image generation
