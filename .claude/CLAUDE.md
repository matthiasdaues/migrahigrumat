# CLAUDE.md — migrahigrumat

## Project Description

A satirical quiz web app parodying Germany's "Wahl-O-Mat". Named **migrahigrumat**.

The app presents the "Migra-Scorecard" — a mock scoring rubric that satirizes the left-progressive discourse around migration background and "Betroffenheitshierarchien" (hierarchies of victimhood). Users select options across 5 categories (A–E), accumulate a score, and receive a satirical label.

## Scope

- Single-page quiz app (plain HTML + vanilla JS, no build step)
- Dockerized deployment on a VPS (nginx:alpine, served behind Traefik)
- GitHub Actions CI/CD pipeline (deploy on semver tag `mm-v*`)
- Server hardening documented in `server_infra/adr/`

## Source Material

See `.claude/brief.md` for the full scoring rubric and result labels.

## Conventions

- Language: German (UI copy), English (code, comments, config)
- Architecture: SOLID, clean, minimal
- No over-engineering: match complexity to need
- ADRs live in `/adr/`

## Project Structure

```
app/              # Static files (served by nginx:alpine)
  index.html
  impressum.html
  css/style.css
  js/
    main.js       # Entry point
    quiz.js       # Quiz logic and rendering
    data.js       # Quiz content and scoring
    share.js      # URL state encode/decode
docker-compose.yml        # Production (nginx + Traefik labels, joins proxy network)
docker-compose.local.yml  # Local dev (nginx on port 8080, no Traefik)
adr/              # Architecture Decision Records
```

## Commands

```bash
# Local dev (http://localhost:8080)
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml down

# Production (on server, after deploy)
docker compose up -d
docker compose down
```

## Deployment

- Trigger: push a semver tag prefixed `mm-v*` (e.g. `git tag mm-v1.0.0 && git push origin mm-v1.0.0`)
- GitHub Actions syncs `app/` and `docker-compose.yml` to server via rsync over SSH
- Then restarts containers on server — Traefik must already be running (see `server_infra/`)
- Server: Ubuntu 22.04.5 LTS, IP: 79.143.178.253, domain: migrahigrumat.de
