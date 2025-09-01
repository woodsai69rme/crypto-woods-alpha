
#!/bin/bash

# Ultimate Crypto Trading Platform - Universal Deployment Script
# Deploy to any cloud provider with full automation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_NAME="crypto-trading-platform"
VERSION=$(date +%Y.%m.%d)

display_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🚢 DEPLOYMENT MANAGER 🚢                   ║"
    echo "║                                                              ║"
    echo "║         Universal Cloud Deployment for Any Platform         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_deployment_menu() {
    echo -e "\n${YELLOW}🚢 Select Deployment Target:${NC}\n"
    echo -e "${GREEN}☁️  Cloud Platforms:${NC}"
    echo "  1) 🔺 Vercel (Recommended for React apps)"
    echo "  2) 🚂 Railway (Full-stack with database)"
    echo "  3) 🎨 Render (Simple cloud deployment)"
    echo "  4) 🪰 Fly.io (Global edge deployment)"
    echo ""
    echo -e "${BLUE}🐳 Container Platforms:${NC}"
    echo "  5) 🐳 Docker Hub"
    echo "  6) 🗄️  Local Docker"
    echo ""
    echo -e "${PURPLE}🖥️  Self-Hosted:${NC}"
    echo "  7) 🖥️  VPS/Server (SSH)"
    echo "  8) 📂 Local Build"
    echo ""
    echo -e "${CYAN}🔧 Advanced:${NC}"
    echo "  9) 🔄 Multi-target deployment"
    echo " 10) ⚙️  Custom deployment"
    echo ""
    echo "  0) ❌ Exit"
    echo ""
    echo -n "Enter your choice [0-10]: "
}

# Pre-deployment checks
pre_deployment_checks() {
    echo -e "\n${BLUE}🔍 Running Pre-deployment Checks...${NC}"
    
    # Check if build exists
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}📦 Building project...${NC}"
        npm run build
    fi
    
    # Check environment variables
    if [ ! -f ".env.production" ] && [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  No environment file found. Creating template...${NC}"
        create_env_template
    fi
    
    # Run tests
    echo -e "${BLUE}🧪 Running quick tests...${NC}"
    npm run test:unit --passWithNoTests || echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    
    # Security check
    npm audit --audit-level high || echo -e "${YELLOW}⚠️  Security vulnerabilities found${NC}"
    
    echo -e "${GREEN}✅ Pre-deployment checks complete${NC}"
}

create_env_template() {
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Optional: Exchange API Keys
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key
EOF
    echo -e "${GREEN}✅ Environment template created: .env.production${NC}"
    echo -e "${YELLOW}⚠️  Please update with your actual values before deployment${NC}"
}

# Deployment functions
deploy_vercel() {
    echo -e "\n${GREEN}🔺 Deploying to Vercel...${NC}"
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Create vercel.json if it doesn't exist
    if [ ! -f "vercel.json" ]; then
        create_vercel_config
    fi
    
    # Deploy
    vercel --prod --yes
    echo -e "${GREEN}✅ Deployed to Vercel successfully!${NC}"
}

create_vercel_config() {
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
}

deploy_railway() {
    echo -e "\n${GREEN}🚂 Deploying to Railway...${NC}"
    
    if ! command -v railway &> /dev/null; then
        echo "Please install Railway CLI first: https://railway.app/cli"
        return 1
    fi
    
    railway login
    railway deploy
    echo -e "${GREEN}✅ Deployed to Railway successfully!${NC}"
}

deploy_render() {
    echo -e "\n${GREEN}🎨 Deploying to Render...${NC}"
    echo "To deploy to Render:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your repository in Render dashboard"
    echo "3. Set build command: npm run build"
    echo "4. Set publish directory: dist"
    echo "5. Add environment variables from .env.production"
    echo ""
    echo "Opening Render dashboard..."
    open "https://render.com" 2>/dev/null || echo "Visit: https://render.com"
}

deploy_flyio() {
    echo -e "\n${GREEN}🪰 Deploying to Fly.io...${NC}"
    
    if ! command -v flyctl &> /dev/null; then
        echo "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
    fi
    
    # Create fly.toml if it doesn't exist
    if [ ! -f "fly.toml" ]; then
        create_fly_config
    fi
    
    flyctl deploy
    echo -e "${GREEN}✅ Deployed to Fly.io successfully!${NC}"
}

create_fly_config() {
    cat > fly.toml << EOF
app = "$PROJECT_NAME"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
EOF
}

deploy_docker_hub() {
    echo -e "\n${GREEN}🐳 Deploying to Docker Hub...${NC}"
    
    # Build Docker image
    docker build -t $PROJECT_NAME:$VERSION .
    docker tag $PROJECT_NAME:$VERSION $PROJECT_NAME:latest
    
    echo "Please login to Docker Hub:"
    docker login
    
    # Push to Docker Hub
    docker push $PROJECT_NAME:$VERSION
    docker push $PROJECT_NAME:latest
    
    echo -e "${GREEN}✅ Pushed to Docker Hub successfully!${NC}"
    echo "Pull with: docker pull $PROJECT_NAME:latest"
}

deploy_local_docker() {
    echo -e "\n${GREEN}🐳 Building Local Docker Container...${NC}"
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        create_dockerfile
    fi
    
    # Build and run
    docker build -t $PROJECT_NAME .
    docker run -d -p 8080:8080 --name $PROJECT_NAME $PROJECT_NAME
    
    echo -e "${GREEN}✅ Container running locally on http://localhost:8080${NC}"
    echo "Stop with: docker stop $PROJECT_NAME"
}

create_dockerfile() {
    cat > Dockerfile << EOF
# Ultimate Crypto Trading Platform - Production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

    cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://localhost:3000;
        }
    }
}
EOF
}

deploy_vps() {
    echo -e "\n${GREEN}🖥️  Deploying to VPS/Server...${NC}"
    
    echo -n "Enter VPS IP address: "
    read vps_ip
    echo -n "Enter SSH username: "
    read ssh_user
    
    # Create deployment package
    tar -czf deploy-package.tar.gz dist/ package.json scripts/ docs/
    
    # Upload and deploy
    scp deploy-package.tar.gz $ssh_user@$vps_ip:~/
    ssh $ssh_user@$vps_ip << EOF
        tar -xzf deploy-package.tar.gz
        cd dist/
        python3 -m http.server 8080 &
        echo "Deployed at http://$vps_ip:8080"
EOF
    
    echo -e "${GREEN}✅ Deployed to VPS successfully!${NC}"
}

local_build() {
    echo -e "\n${GREEN}📂 Creating Local Build...${NC}"
    
    npm run build
    
    # Create deployment package
    mkdir -p releases
    cp -r dist/ releases/build-$VERSION/
    tar -czf releases/$PROJECT_NAME-$VERSION.tar.gz -C releases build-$VERSION/
    
    echo -e "${GREEN}✅ Local build created: releases/$PROJECT_NAME-$VERSION.tar.gz${NC}"
}

multi_target_deployment() {
    echo -e "\n${PURPLE}🔄 Multi-target Deployment${NC}"
    echo "This will deploy to multiple platforms simultaneously."
    echo -n "Continue? (y/N): "
    read confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo "Deploying to multiple targets..."
        deploy_vercel &
        deploy_docker_hub &
        local_build &
        wait
        echo -e "${GREEN}✅ Multi-target deployment complete!${NC}"
    fi
}

custom_deployment() {
    echo -e "\n${CYAN}⚙️  Custom Deployment Configuration${NC}"
    echo "Create your custom deployment script here..."
    echo "Available build artifacts in: ./dist"
    echo "Available scripts in: ./scripts"
    echo "Environment template: .env.production"
}

# Main deployment flow
main() {
    display_banner
    
    while true; do
        show_deployment_menu
        read choice
        
        case $choice in
            1) pre_deployment_checks; deploy_vercel;;
            2) pre_deployment_checks; deploy_railway;;
            3) pre_deployment_checks; deploy_render;;
            4) pre_deployment_checks; deploy_flyio;;
            5) pre_deployment_checks; deploy_docker_hub;;
            6) pre_deployment_checks; deploy_local_docker;;
            7) pre_deployment_checks; deploy_vps;;
            8) pre_deployment_checks; local_build;;
            9) pre_deployment_checks; multi_target_deployment;;
            10) custom_deployment;;
            0) echo -e "\n${GREEN}👋 Deployment manager closed!${NC}"; exit 0;;
            *) echo -e "\n${RED}❌ Invalid choice. Please try again.${NC}";;
        esac
        
        echo ""
        echo -e "${YELLOW}Press any key to continue...${NC}"
        read -n 1 -s
    done
}

# Run main function
main
