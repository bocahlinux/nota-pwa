# Deployment Guide — Nota

## Quick Deploy (Ubuntu 22.04+)

### Prerequisites
- Ubuntu 22.04+ VPS (2GB RAM, 2vCPU)
- Domain pointing to VPS IP (A record)
- SSH access

### 1. Copy files to server

```bash
# From your local machine
scp -r backend/ user@your-server:/var/www/nota/backend/
scp -r frontend/ user@your-server:/var/www/nota/frontend/
scp scripts/deploy.sh user@your-server:/tmp/
```

### 2. Run deployment script

```bash
ssh user@your-server
sudo bash /tmp/deploy.sh yourdomain.com
```

This will:
- Install Python, Node.js 20, Nginx, Certbot
- Setup virtualenv + install dependencies
- Run migrations + collectstatic
- Build frontend
- Configure Nginx (reverse proxy + SSL)
- Setup Let's Encrypt SSL
- Create systemd service (auto-restart)

### 3. Done!

Open `https://yourdomain.com` in browser.

---

## Management Commands

```bash
# Check backend status
sudo systemctl status nota-backend

# View logs
sudo journalctl -u nota-backend -f

# Restart backend
sudo systemctl restart nota-backend

# Reload nginx
sudo systemctl reload nginx

# Renew SSL
sudo certbot renew
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| 502 Bad Gateway | Check `sudo journalctl -u nota-backend -f` |
| Static files 404 | Run `python manage.py collectstatic --noinput` |
| CORS error | Check `CORS_ALLOWED_ORIGINS` in `.env` |
| SSL not working | Run `sudo certbot --nginx -d yourdomain.com` |

---

## Manual Setup (Without Script)

See `scripts/deploy.sh` for step-by-step commands.
