#!/bin/bash
# ============================================================
# Nota — Bare Metal Deployment Script untuk Ubuntu 22.04+
# Usage: sudo bash deploy.sh yourdomain.com
# ============================================================

set -e

DOMAIN=${1:-localhost}
APP_DIR="/var/www/nota"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
VENV_DIR="$APP_DIR/venv"
SERVICE_NAME="nota-backend"
USER="www-data"

echo "============================================"
echo "  Deploying Nota — Domain: $DOMAIN"
echo "============================================"

# ── 1. System dependencies ──────────────────────────────
echo "[1/8] Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv nginx git curl
apt-get install -y -qq certbot python3-certbot-nginx

# ── 2. App directory ────────────────────────────────────
echo "[2/8] Setting up app directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/media
mkdir -p $APP_DIR/staticfiles
chown -R $USER:$USER $APP_DIR

# ── 3. Backend setup ────────────────────────────────────
echo "[3/8] Setting up backend..."
if [ -d "$BACKEND_DIR" ]; then
    cd $BACKEND_DIR && git pull
else
    # NOTE: Clone repo atau copy files manual
    echo ">>> Copy backend files to $BACKEND_DIR terlebih dahulu"
    echo "    scp -r backend/ user@server:$BACKEND_DIR/"
    exit 1
fi

cd $BACKEND_DIR
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Environment file
if [ ! -f "$BACKEND_DIR/backend/.env" ]; then
    SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    cat > $BACKEND_DIR/backend/.env <<ENVEOF
DJANGO_SECRET_KEY=$SECRET
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=$DOMAIN,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://$DOMAIN,https://$DOMAIN
ENVEOF
    echo ">>> Created .env with generated SECRET_KEY"
fi

# Migrations & static
export $(grep -v '^#' $BACKEND_DIR/backend/.env | xargs)
python manage.py migrate --noinput
python manage.py collectstatic --noinput
deactivate

# ── 4. Frontend build ───────────────────────────────────
echo "[4/8] Building frontend..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo ">>> Copy frontend files to $FRONTEND_DIR terlebih dahulu"
    echo "    scp -r frontend/ user@server:$FRONTEND_DIR/"
    exit 1
fi

cd $FRONTEND_DIR
# Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi
npm ci
npx vite build
chown -R $USER:$USER dist/

# ── 5. Nginx config ──────────────────────────────────────
echo "[5/8] Configuring nginx..."
cat > /etc/nginx/sites-available/nota <<'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/nota/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # Media & Static
    location /media/ { alias /var/www/nota/media/; }
    location /static/ { alias /var/www/nota/staticfiles/; }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Security
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINXEOF

ln -sf /etc/nginx/sites-available/nota /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 6. SSL (Certbot) ─────────────────────────────────────
echo "[6/8] Setting up SSL..."
if [ "$DOMAIN" != "localhost" ]; then
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
fi

# ── 7. Systemd service (Gunicorn) ───────────────────────
echo "[7/8] Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service <<SERVICEEOF
[Unit]
Description=Nota Backend (Django + Gunicorn)
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/backend/.env
ExecStart=$VENV_DIR/bin/gunicorn backend.wsgi:application \\
    --bind 127.0.0.1:8000 \\
    --workers 2 \\
    --timeout 120 \\
    --access-logfile /var/log/nota/access.log \\
    --error-logfile /var/log/nota/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

mkdir -p /var/log/nota
chown -R $USER:$USER /var/log/nota

systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

# ── 8. Verify ────────────────────────────────────────────
echo "[8/8] Verifying deployment..."
sleep 3

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "  Backend:  http://127.0.0.1:8000"
echo "  Frontend: http://$DOMAIN"
echo ""
echo "  Status:"
systemctl is-active $SERVICE_NAME && echo "  ✅ Backend: RUNNING" || echo "  ❌ Backend: FAILED"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/notas/ | grep -q "401" && echo "  ✅ API: RESPONDING" || echo "  ❌ API: NOT RESPONDING"
echo ""
echo "  Logs: journalctl -u $SERVICE_NAME -f"
echo "============================================"
