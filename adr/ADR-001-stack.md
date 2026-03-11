# ADR-001 — Stack & Deployment Decisions

Date: 2026-03-11
Status: Accepted

## Context

Scoping session for the migrahigrumat satirical quiz app.

## Decisions

| Concern | Decision | Rationale |
|---|---|---|
| VPS | Already provisioned | N/A |
| Server OS | Ubuntu 24.04 LTS | LTS, wide support |
| Domain | migrahigrumat.de | Already owned |
| SSL/TLS | Caddy + Let's Encrypt | Zero-config, auto-renewal |
| Reverse proxy | Caddy | Same tool as SSL, no duplication |
| Frontend | Plain HTML + vanilla JS | No build step; quiz logic is trivial |
| Backend | None — purely static | Scoring runs in-browser |
| Result sharing | Shareable URL (encoded state) + screenshot-optimized result card | Social media shareability |
| Deploy trigger | GitHub Actions on semver tag (`v*`) | Controlled releases |
| Containerization | Docker | Single container serving static files via Caddy |

## Consequences

- No CI build step needed — files are served as-is
- Docker image: Caddy official image with static files copied in
- No database, no server-side state
- Result state encoded in URL hash or query params for shareability
- Result card styled for CSS-based share layout
