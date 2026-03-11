# GitHub Actions Secrets

Set these in: https://github.com/matthiasdaues/migrahigrumat/settings/secrets/actions

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | Private key of the deploy SSH key pair (generated in Phase 1) |
| `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan <server-ip>` — prevents MITM on first connect |
| `DEPLOY_USER` | Non-root sudo user on the server |
| `DEPLOY_HOST` | Server IP or hostname |
| `DEPLOY_PATH` | Absolute path on server, e.g. `/opt/migrahigrumat` |

## Generating secrets (Phase 1 prerequisite)

```bash
# 1. Generate deploy key pair (local)
ssh-keygen -t ed25519 -C "migrahigrumat-deploy" -f ~/.ssh/migrahigrumat-deploy -N ""

# 2. Add public key to server
ssh-copy-id -i ~/.ssh/migrahigrumat-deploy.pub <user>@<server-ip>

# 3. Get known_hosts entry for GitHub secret
ssh-keyscan <server-ip>

# 4. Add private key to GitHub secret DEPLOY_SSH_KEY
cat ~/.ssh/migrahigrumat-deploy
```
