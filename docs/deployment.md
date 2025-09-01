
# Deployment Guide

Comprehensive guide for deploying the Ultimate Crypto Trading Platform across multiple platforms and environments.

## 🎯 Deployment Overview

The platform supports deployment on:
- **Cloud Platforms**: Vercel, Railway, Render, Fly.io, AWS, Google Cloud
- **Container Platforms**: Docker, Kubernetes, Docker Swarm
- **VPS/Dedicated**: Linux servers, Windows servers
- **Local**: Development and offline usage

## ☁️ Cloud Platform Deployments

### Vercel (Recommended for Frontend)

**One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/crypto-trading-platform)

**Manual Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add OPENROUTER_API_KEY

# Redeploy with env vars
vercel --prod
```

**Configuration File: `vercel.json`**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@supabase_key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Railway (Full-Stack with Database)

**One-Click Deploy**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-username/crypto-trading-platform)

**Manual Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add database
railway add postgresql

# Set environment variables
railway variables set VITE_SUPABASE_URL=your_url
railway variables set OPENROUTER_API_KEY=your_key
```

**Configuration File: `railway.json`**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Render (Static + Services)

**Static Site**
1. Connect GitHub repository
2. Choose "Static Site"
3. Build command: `npm run build`
4. Publish directory: `dist`

**Web Service**
1. Choose "Web Service"
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add environment variables

### Fly.io (Global Edge Deployment)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy

# Set secrets
fly secrets set VITE_SUPABASE_URL=your_url
fly secrets set OPENROUTER_API_KEY=your_key
```

**Configuration: `fly.toml`**
```toml
app = "crypto-platform"
primary_region = "dfw"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["paketo-buildpacks/nodejs"]

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

## 🐳 Docker Deployments

### Simple Docker

**Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 8080
CMD ["npm", "start"]
```

**Build and Run**
```bash
# Build image
docker build -t crypto-platform .

# Run container
docker run -p 8080:8080 \
  -e VITE_SUPABASE_URL=your_url \
  -e OPENROUTER_API_KEY=your_key \
  crypto-platform
```

### Docker Compose (Full Stack)

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/crypto_trading
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=crypto_trading
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

**Deploy with Compose**
```bash
docker-compose up -d
```

### Kubernetes Deployment

**k8s/namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: crypto-platform
```

**k8s/deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crypto-platform
  namespace: crypto-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crypto-platform
  template:
    metadata:
      labels:
        app: crypto-platform
    spec:
      containers:
      - name: crypto-platform
        image: your-registry/crypto-platform:latest
        ports:
        - containerPort: 8080
        env:
        - name: VITE_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: crypto-secrets
              key: supabase-url
        - name: OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: crypto-secrets
              key: openrouter-key
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "0.5"
            memory: "512Mi"
```

**Deploy to Kubernetes**
```bash
kubectl apply -f k8s/
```

## 🖥️ VPS/Server Deployments

### Linux Server (Ubuntu/CentOS)

**Setup Script: `scripts/deploy-server.sh`**
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup application
git clone https://github.com/your-username/crypto-trading-platform.git
cd crypto-trading-platform
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx -y
sudo cp nginx/crypto-platform.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/crypto-platform.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

**PM2 Configuration: `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [{
    name: 'crypto-platform',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Windows Server

**Setup Script: `scripts/deploy-windows.bat`**
```batch
@echo off

REM Install chocolatey (if not installed)
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"

REM Install Node.js and Git
choco install nodejs git -y

REM Clone repository
git clone https://github.com/your-username/crypto-trading-platform.git
cd crypto-trading-platform

REM Install dependencies and build
npm install
npm run build

REM Install PM2 for Windows
npm install -g pm2
npm install -g pm2-windows-service

REM Setup as Windows service
pm2-service-install
pm2 start ecosystem.config.js
pm2 save
```

## 🔧 Production Configuration

### Environment Variables

**Production `.env`**
```bash
# Production Settings
NODE_ENV=production
PORT=8080

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_SIZE=20
DATABASE_SSL=true

# Redis (for caching and sessions)
REDIS_URL=redis://user:pass@host:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# Feature Flags
ENABLE_TRADING=true
ENABLE_AI_FEATURES=true
MAINTENANCE_MODE=false
```

### Nginx Configuration

**nginx/crypto-platform.conf**
```nginx
upstream crypto_platform {
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location / {
        proxy_pass http://crypto_platform;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://crypto_platform;
        # ... proxy settings
    }
}
```

## 📊 Monitoring & Logging

### Health Checks

**Health Check Endpoint**
```javascript
// Add to your server
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### Monitoring Setup

**Docker Compose with Monitoring**
```yaml
services:
  # ... existing services

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🚀 Automated Deployment

### GitHub Actions

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:all
      
      - name: Run security audit
        run: npm audit --audit-level moderate

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Scripts

**scripts/deploy.sh**
```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Run tests
npm run test:all

# Build application
npm run build

# Deploy based on environment
case "$1" in
  "vercel")
    vercel deploy --prod
    ;;
  "railway")
    railway up
    ;;
  "docker")
    docker build -t crypto-platform:latest .
    docker push your-registry/crypto-platform:latest
    ;;
  "server")
    rsync -avz --delete ./dist/ user@server:/var/www/crypto-platform/
    ssh user@server "pm2 reload crypto-platform"
    ;;
  *)
    echo "Usage: $0 {vercel|railway|docker|server}"
    exit 1
    ;;
esac

echo "✅ Deployment completed successfully!"
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **HTTPS Only** - Force SSL/TLS encryption
- [ ] **Environment Variables** - Never commit secrets
- [ ] **Rate Limiting** - Prevent abuse and DoS
- [ ] **CORS Configuration** - Restrict cross-origin requests
- [ ] **Security Headers** - Implement security headers
- [ ] **Input Validation** - Sanitize all inputs
- [ ] **Database Security** - Use connection pooling, SSL
- [ ] **Monitoring** - Log security events
- [ ] **Updates** - Keep dependencies updated
- [ ] **Backups** - Regular automated backups

### Secrets Management

**Using GitHub Secrets**
```bash
# Set secrets in GitHub repository settings
VERCEL_TOKEN=your_vercel_token
SUPABASE_URL=your_supabase_url
OPENROUTER_API_KEY=your_openrouter_key
```

**Using Docker Secrets**
```yaml
version: '3.8'
services:
  app:
    image: crypto-platform
    secrets:
      - supabase_url
      - openrouter_key

secrets:
  supabase_url:
    external: true
  openrouter_key:
    external: true
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Monitoring setup configured

### Post-Deployment
- [ ] Health check endpoints responding
- [ ] SSL certificate valid
- [ ] All features working correctly
- [ ] Performance monitoring active
- [ ] Backup system operational
- [ ] Error tracking configured

---

**Need help with deployment?** Check our [troubleshooting guide](./troubleshooting.md) or open an issue.
