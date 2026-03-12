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
docker compose up -d --force-recreate --remove-orphans
docker compose down
```

## Deployment

- Trigger: push a semver tag prefixed `mm-v*` (e.g. `git tag mm-v1.0.0 && git push origin mm-v1.0.0`)
- GitHub Actions syncs `app/`, `docker/`, and `docker-compose.yml` to server via rsync over SSH
- Then restarts containers with `--force-recreate` — required to apply nginx.conf changes from bind mounts
- Server: Ubuntu 22.04.5 LTS, IP: 79.143.178.253, domain: migrahigrumat.de

## Infrastructure Context

Routing and TLS are handled by Traefik running from the `server_infra` repo — this site does not manage those concerns.

### How routing works

The `docker-compose.yml` carries Traefik labels, but the Docker provider is currently broken on Docker 27+
(API version incompatibility). As a workaround, routing is configured via a **file provider** route in
`server_infra/traefik/dynamic/migrahigrumat.yml`. That file references the container by name (`migrahigrumat-web-1`)
on the shared `proxy` Docker network.

If the container is renamed (e.g. by moving to a different compose project name), `migrahigrumat.yml` in `server_infra` must be updated to match.

### nginx config

`docker/nginx.conf` is the nginx config mounted into the container. Key points:
- `server_tokens off` — suppresses version disclosure
- `try_files $uri $uri/ =404` — returns a proper 404 for non-existent paths (not a soft 404 via index.html fallback)

### Shared middlewares (managed in server_infra)

- `security-headers@file` — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Server header suppression
- TLS minimum version: TLS 1.2 (enforced via `tls-options.yml` default profile)
- www → apex redirect: `https://www.migrahigrumat.de/*` → `https://migrahigrumat.de/$1`

## Known Issues

- Traefik Docker provider fails against Docker 27+ (client version 1.24 vs minimum 1.40). Workaround: file provider route in `server_infra`. Not a blocker.
