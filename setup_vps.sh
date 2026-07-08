#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================================="
echo "Starting VPS Auto-Setup for The Archive Portfolio"
echo "=========================================================="

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root (sudo)"
  exit 1
fi

# Ask for domain name dynamically
read -p "Enter your domain name (e.g. yourdomain.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
  echo "Domain name cannot be empty."
  exit 1
fi

# Ask for admin passphrase dynamically
read -p "Enter a secure admin passphrase for your editor: " ADMIN_PASSPHRASE
if [ -z "$ADMIN_PASSPHRASE" ]; then
  echo "Admin passphrase cannot be empty."
  exit 1
fi

# Get current script directory (assumes script is run from project root)
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Project directory resolved to: $PROJECT_DIR"

# 1. Update system packages
echo "--> Updating system packages..."
apt update && apt upgrade -y

# 2. Install Python, virtualenv, Nginx, Certbot
echo "--> Installing Python, Nginx, and Certbot..."
apt install python3 python3-pip python3-venv nginx certbot python3-certbot-nginx curl -y

# 3. Install Node.js (Node 20 LTS)
echo "--> Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Verify installations
echo "--> Verification:"
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "Python: $(python3 --version)"

# 4. Configure Backend Python environment
echo "--> Setting up Python virtual environment..."
cd "$PROJECT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 5. Create Systemd Service File
echo "--> Registering Systemd service for backend..."
SERVICE_FILE="/etc/systemd/system/portfolio-backend.service"

cat <<EOT > "$SERVICE_FILE"
[Unit]
Description=FastAPI Portfolio Backend
After=network.target

[Service]
User=root
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
Environment="ADMIN_PASSPHRASE=$ADMIN_PASSPHRASE"
Environment="ALLOWED_ORIGINS=https://$DOMAIN_NAME,https://www.$DOMAIN_NAME"

[Install]
WantedBy=multi-user.target
EOT

systemctl daemon-reload
systemctl enable portfolio-backend
systemctl restart portfolio-backend
echo "--> Backend service started and enabled."

# 6. Build Frontend Client
echo "--> Installing frontend dependencies and building production assets..."
cd "$PROJECT_DIR/frontend"
npm install
npm run build

# 7. Configure Nginx
echo "--> Writing Nginx configuration..."
NGINX_FILE="/etc/nginx/sites-available/$DOMAIN_NAME"

cat <<EOT > "$NGINX_FILE"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Frontend Static Site
    root $PROJECT_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://127.0.0.1:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Max payload for image uploads
        client_max_body_size 20M;
    }
}
EOT

# Link site and remove default
ln -sf "$NGINX_FILE" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true

# Test and restart Nginx
nginx -t
systemctl restart nginx
echo "--> Nginx server restarted."

echo "=========================================================="
echo "Setup complete! Your website is live on HTTP."
echo "=========================================================="

# 8. Prompt for SSL
read -p "Would you like to configure HTTPS SSL using Let's Encrypt now? (y/n): " RUN_SSL
if [ "$RUN_SSL" = "y" ] || [ "$RUN_SSL" = "Y" ]; then
  certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME"
  echo "--> SSL configured successfully!"
fi
