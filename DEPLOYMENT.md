# Workforce Automation Portal (WAP) — Production Deployment Guide

This guide covers complete production deployment instructions for WAP, including reverse proxy configuration, HTTPS / SSL setup via Let's Encrypt Certbot, environment variable specifications, systemd service setup, Docker containerization, and the dedicated [AWS Deployment Guide](docs/AWS_DEPLOYMENT.md).

---

## 1. Production Architecture Overview

```
                      [ Client Traffic (HTTPS / Port 443) ]
                                      │
                                      ▼
                        [ Nginx Web & Reverse Proxy ]
                      ┌───────────────┴───────────────┐
                      │                               │
                      ▼                               ▼
       [ Static Assets / SPA ]           [ Spring Boot Backend ]
        (/var/www/wap/frontend)          (http://127.0.0.1:8080)
                                                      │
                                                      ▼
                                            [ MySQL Database :3306 ]
```

---

## 2. Environment Variables Specification

Set the following environment variables on your production host or `.env` file:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Spring Boot HTTP listening port | `8080` |
| `DB_URL` | JDBC Connection URL with MySQL SSL & UTF8 | `jdbc:mysql://localhost:3306/wap_db?useSSL=true&requireSSL=true&characterEncoding=UTF-8` |
| `DB_USERNAME` | Production MySQL User | `wap_app_user` |
| `DB_PASSWORD` | Strong database password | `SuperSecureDBPassword_2026!` |
| `JPA_DDL_AUTO` | Hibernate schema management | `validate` (or `update`) |
| `JWT_SECRET` | 256-bit+ cryptographically random HMAC key | `c2FrbW9kZXJuLXdvcmtmb3JjZS1hdXRvbWF0aW9uLXBvcnRhbC0yMDI2LXNlY3VyZS1rZXk=` |
| `JWT_ACCESS_EXPIRATION` | Access token lifespan in milliseconds | `900000` (15 minutes) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifespan in milliseconds | `604800000` (7 days) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated production domains | `https://workforce.yourdomain.com` |
| `AUTH_RATE_LIMIT` | Max auth requests per minute per IP | `10` |
| `MAIL_HOST` | Production SMTP host | `smtp.gmail.com` (or `smtp.sendgrid.net`) |
| `MAIL_PORT` | SMTP Port | `587` |
| `MAIL_USERNAME` | SMTP account email | `notifications@yourdomain.com` |
| `MAIL_PASSWORD` | App-specific SMTP password / API token | `your-smtp-app-password` |

---

## 3. Production Build Instructions

### Step 3.1: Build Backend JAR
```bash
cd WAP-Backend
# Build production executable JAR skipping unit tests for deployment package
./mvnw clean package -DskipTests
# Output file: target/WAP-Backend-0.0.1-SNAPSHOT.jar
```

### Step 3.2: Build Frontend Production Assets
```bash
cd frontend
# Install production dependencies and build optimized static assets
npm ci
npm run build
# Output directory: frontend/dist
```

---

## 4. Nginx Reverse Proxy & SSL/TLS Setup

### Step 4.1: Install Nginx & Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 4.2: Obtain SSL/TLS Certificate with Let's Encrypt
```bash
sudo certbot certonly --nginx -d workforce.yourdomain.com --agree-tos -m admin@yourdomain.com --non-interactive
```

### Step 4.3: Nginx Production Configuration
Create `/etc/nginx/sites-available/wap.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name workforce.yourdomain.com;
    return 301 https://$host$request_uri;
}

# Production HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name workforce.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/workforce.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/workforce.yourdomain.com/privkey.pem;

    # Modern TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:;" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # 1. Serve Frontend React Static Build
    root /var/www/wap/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Cache Control
    location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 2. Proxy API Calls to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 3. OpenAPI / Swagger Documentation Route
    location ~ ^/(swagger-ui|v3/api-docs) {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/wap.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Systemd Service Configuration

Create `/etc/systemd/system/wap-backend.service`:

```ini
[Unit]
Description=Workforce Automation Portal (WAP) Spring Boot Service
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/opt/wap/backend
EnvironmentFile=/opt/wap/backend/.env
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar /opt/wap/backend/WAP-Backend-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable wap-backend
sudo systemctl start wap-backend
sudo systemctl status wap-backend
```

---

## 6. Docker & Docker Compose Deployment (Alternative)

To deploy using Docker:

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: wap-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: wap_db
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - wap-net

  backend:
    build:
      context: ./WAP-Backend
      dockerfile: Dockerfile
    container_name: wap-backend
    restart: always
    depends_on:
      - mysql
    environment:
      DB_URL: jdbc:mysql://mysql:3306/wap_db?useSSL=false&allowPublicKeyRetrieval=true
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
    ports:
      - "8080:8080"
    networks:
      - wap-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: wap-frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - wap-net

volumes:
  mysql_data:

networks:
  wap-net:
    driver: bridge
```
