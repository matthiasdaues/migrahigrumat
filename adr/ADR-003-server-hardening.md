# ADR-003 Server Hardening Checklist

## Status: Superseded

**Superseded by:** [server_infra/adr/ADR-002-server-hardening.md](../../server_infra/adr/ADR-002-server-hardening.md)

Server hardening is a platform-level concern and has been migrated to `server_infra`.
The content below is retained for historical reference only.

---

Ubuntu 22.04.5 LTS — non-root sudo user already exists.
Execute as your sudo user unless noted otherwise.

---

## 1. System update

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

---

## 2. Create deploy user

Create a dedicated `deploy` user — no sudo, no password, docker group only.
GitHub Actions authenticates as this user; it can do nothing else on the system.

```bash
sudo adduser --disabled-password --gecos "" deploy
```

Add to the docker group (grants `docker compose` access without sudo):

```bash
sudo usermod -aG docker deploy
```

Prepare the `.ssh` directory:

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
```

Grant ownership of the deploy directory to this user:

```bash
sudo mkdir -p /opt/migrahigrumat
sudo chown deploy:deploy /opt/migrahigrumat
```

---

## 3. SSH key-only login

On your **local machine**, generate the deploy key pair:

```bash
ssh-keygen -t ed25519 -C "migrahigrumat-deploy" -f ~/.ssh/migrahigrumat-deploy -N ""
```

On your **local machine**, print the public key:

```bash
cat ~/.ssh/migrahigrumat-deploy.pub
```

On the **server** (as your sudo user), paste it into the authorized_keys file:

```bash
sudo nano /home/deploy/.ssh/authorized_keys
# paste the key, save with Ctrl+O, exit with Ctrl+X

sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
```

Verify login works as `deploy`:

```bash
ssh -o IdentitiesOnly=yes -i ~/.ssh/migrahigrumat-deploy deploy@<server-ip>
```

---

## 4. Harden SSH config

Ubuntu 22.04's `sshd_config` contains `Include /etc/ssh/sshd_config.d/*.conf`.
Drop a hardening file there — do not edit the main config directly.

First, check for any existing drop-ins that might conflict:

```bash
ls /etc/ssh/sshd_config.d/
# Ubuntu 22.04 ships 50-cloud-init.conf — check its contents
sudo cat /etc/ssh/sshd_config.d/50-cloud-init.conf
```

If `50-cloud-init.conf` sets `PasswordAuthentication yes`, it will override your hardening
because files are loaded alphabetically and last-write wins per directive.
Either remove it or override it with a higher-numbered file (99 sorts after 50):

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
X11Forwarding no
AllowTcpForwarding no
EOF
```

Verify the effective config (shows merged result of all files):

```bash
sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication|x11forwarding|allowtcpforwarding'
```

All values must match what you set above. If not, a drop-in is overriding — find it:

```bash
grep -r 'PasswordAuthentication\|PermitRootLogin' /etc/ssh/
```

Restart SSH (keep your current session open — open a second session to verify before closing):

```bash
sudo systemctl restart ssh
```

In a **new terminal**, verify login still works as `deploy`:

```bash
ssh -o IdentitiesOnly=yes -i ~/.ssh/migrahigrumat-deploy deploy@<server-ip>
```

---

## 5. UFW firewall

```bash
sudo apt install -y ufw

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

---

## 6. fail2ban

```bash
sudo apt install -y fail2ban

sudo tee /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

---

## 7. Unattended security upgrades

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Answer: Yes
```

Verify config:

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
# Should show: APT::Periodic::Unattended-Upgrade "1";
```

---

## 8. Docker install (if not already present)

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
docker --version
```

---

## 9. GitHub secrets to add after this checklist

In https://github.com/matthiasdaues/migrahigrumat/settings/secrets/actions:

| Secret name         | Value                                              |
|---------------------|----------------------------------------------------|
| `DEPLOY_SSH_KEY`    | Contents of `~/.ssh/migrahigrumat-deploy` (private key) |
| `DEPLOY_KNOWN_HOSTS`| Output of: `ssh-keyscan -H <server-ip>`           |
| `DEPLOY_USER`       | `deploy`                                          |
| `DEPLOY_HOST`       | Server IP                                         |
| `DEPLOY_PATH`       | `/opt/migrahigrumat`                              |

---

## 10. DNS

Point `migrahigrumat.de` A-record to the server IP.
TTL: 300 (5 min) for initial rollout, raise to 3600 after go-live confirmed.

---

## Done — signal when ready to deploy.
