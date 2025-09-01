
#!/bin/bash

# Ultimate Crypto Trading Platform - Interactive Launch Menu
# Cross-platform launcher with full development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if required commands exist
check_dependencies() {
    local deps=("node" "npm" "git")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            echo -e "${RED}❌ $dep is required but not installed.${NC}"
            echo "Please install $dep and try again."
            exit 1
        fi
    done
}

# Display banner
display_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║          🚀 ULTIMATE CRYPTO TRADING PLATFORM 🚀             ║"
    echo "║                                                              ║"
    echo "║              Professional-Grade Trading Suite                ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Main menu
show_menu() {
    echo -e "\n${YELLOW}📋 Main Menu - Select an option:${NC}\n"
    echo -e "${GREEN}🏃 Development & Execution:${NC}"
    echo "  1) 🚀 Start Development Server"
    echo "  2) 🏭 Build for Production"
    echo "  3) 🌐 Start Production Server"
    echo "  4) 🐳 Run with Docker"
    echo ""
    echo -e "${BLUE}🧪 Testing & Quality:${NC}"
    echo "  5) 🔬 Run All Tests"
    echo "  6) 📊 Generate Coverage Report"
    echo "  7) 🔍 Run Comprehensive Audit"
    echo "  8) 🔐 Security Scan"
    echo ""
    echo -e "${PURPLE}📚 Documentation & Deployment:${NC}"
    echo "  9) 📖 Generate Documentation"
    echo " 10) 🚢 Deploy to Cloud"
    echo " 11) 📦 Create Release Package"
    echo ""
    echo -e "${CYAN}⚙️  Utilities:${NC}"
    echo " 12) 🔧 Setup Environment"
    echo " 13) 🗄️  Database Management"
    echo " 14) 📋 System Information"
    echo " 15) 🧹 Cleanup & Reset"
    echo ""
    echo " 0) ❌ Exit"
    echo ""
    echo -n "Enter your choice [0-15]: "
}

# Individual functions
start_dev_server() {
    echo -e "\n${GREEN}🚀 Starting Development Server...${NC}"
    echo "Opening at: http://localhost:8080"
    npm run dev
}

build_production() {
    echo -e "\n${GREEN}🏭 Building for Production...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build complete! Files are in dist/${NC}"
}

start_prod_server() {
    echo -e "\n${GREEN}🌐 Starting Production Server...${NC}"
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}📦 Building project first...${NC}"
        npm run build
    fi
    npm run start
}

run_docker() {
    echo -e "\n${GREEN}🐳 Running with Docker...${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose up --build
    else
        echo "Building Docker image..."
        docker build -t crypto-trading-platform .
        docker run -p 8080:8080 crypto-trading-platform
    fi
}

run_tests() {
    echo -e "\n${BLUE}🧪 Running Complete Test Suite...${NC}"
    chmod +x scripts/test_all.sh
    ./scripts/test_all.sh
}

generate_coverage() {
    echo -e "\n${BLUE}📊 Generating Coverage Report...${NC}"
    npm run test:coverage
    echo -e "${GREEN}✅ Coverage report generated!${NC}"
}

run_audit() {
    echo -e "\n${BLUE}🔍 Running Comprehensive Audit...${NC}"
    npm run audit:comprehensive
}

security_scan() {
    echo -e "\n${BLUE}🔐 Running Security Scan...${NC}"
    npm audit --audit-level high
    npm run test:security 2>/dev/null || echo "Security tests not configured yet"
}

generate_docs() {
    echo -e "\n${PURPLE}📖 Generating Documentation...${NC}"
    echo "Building documentation from /docs folder..."
    # Convert markdown to PDF if pandoc is available
    if command -v pandoc &> /dev/null; then
        mkdir -p docs_offline
        for file in docs/*.md; do
            if [ -f "$file" ]; then
                filename=$(basename "$file" .md)
                pandoc "$file" -o "docs_offline/$filename.pdf"
                echo "✅ Generated: docs_offline/$filename.pdf"
            fi
        done
    fi
    echo -e "${GREEN}✅ Documentation ready in /docs${NC}"
}

deploy_cloud() {
    echo -e "\n${PURPLE}🚢 Cloud Deployment Menu${NC}\n"
    echo "1) Deploy to Vercel"
    echo "2) Deploy to Railway" 
    echo "3) Deploy to Render"
    echo "4) Deploy to Fly.io"
    echo "5) Deploy via Docker"
    echo "0) Back to main menu"
    echo ""
    echo -n "Select deployment target: "
    read deploy_choice
    
    case $deploy_choice in
        1) echo "🚀 Deploying to Vercel..."; vercel --prod 2>/dev/null || echo "Install Vercel CLI first: npm i -g vercel";;
        2) echo "🚀 Deploying to Railway..."; railway deploy 2>/dev/null || echo "Install Railway CLI first";;
        3) echo "🚀 Deploying to Render..."; echo "Push to GitHub and connect via Render dashboard";;
        4) echo "🚀 Deploying to Fly.io..."; flyctl deploy 2>/dev/null || echo "Install Fly CLI first";;
        5) echo "🚀 Docker deployment..."; chmod +x scripts/deploy.sh; ./scripts/deploy.sh;;
        0) return;;
        *) echo "Invalid choice";;
    esac
}

create_release() {
    echo -e "\n${PURPLE}📦 Creating Release Package...${NC}"
    VERSION=$(date +%Y.%m.%d)
    echo "Creating release v$VERSION..."
    
    npm run build
    mkdir -p releases
    tar -czf "releases/crypto-trading-platform-v$VERSION.tar.gz" \
        dist/ docs/ scripts/ package.json README.md
    
    echo -e "${GREEN}✅ Release package created: releases/crypto-trading-platform-v$VERSION.tar.gz${NC}"
}

setup_environment() {
    echo -e "\n${CYAN}🔧 Environment Setup${NC}"
    chmod +x scripts/setup.sh
    ./scripts/setup.sh
}

database_management() {
    echo -e "\n${CYAN}🗄️  Database Management Menu${NC}\n"
    echo "1) View Database Status"
    echo "2) Run Migrations"
    echo "3) Seed Test Data"
    echo "4) Backup Database"
    echo "5) Reset Database"
    echo "0) Back to main menu"
    echo ""
    echo -n "Select option: "
    read db_choice
    
    case $db_choice in
        1) echo "📊 Database Status:"; npm run db:status 2>/dev/null || echo "Configure database connection first";;
        2) echo "🔄 Running migrations..."; npm run db:migrate 2>/dev/null || echo "Configure database first";;
        3) echo "🌱 Seeding data..."; npm run db:seed 2>/dev/null || echo "Seed script not configured";;
        4) echo "💾 Creating backup..."; npm run db:backup 2>/dev/null || echo "Backup script not configured";;
        5) echo "⚠️  Resetting database..."; npm run db:reset 2>/dev/null || echo "Reset script not configured";;
        0) return;;
        *) echo "Invalid choice";;
    esac
}

show_system_info() {
    echo -e "\n${CYAN}📋 System Information${NC}\n"
    echo -e "${YELLOW}Node.js:${NC} $(node --version)"
    echo -e "${YELLOW}NPM:${NC} $(npm --version)"
    echo -e "${YELLOW}Git:${NC} $(git --version)"
    echo -e "${YELLOW}OS:${NC} $(uname -s 2>/dev/null || echo "Windows")"
    echo -e "${YELLOW}Architecture:${NC} $(uname -m 2>/dev/null || echo "Unknown")"
    echo ""
    echo -e "${YELLOW}Project Status:${NC}"
    [ -d "node_modules" ] && echo "✅ Dependencies installed" || echo "❌ Dependencies not installed"
    [ -d "dist" ] && echo "✅ Production build exists" || echo "❌ No production build"
    [ -f ".env" ] && echo "✅ Environment configured" || echo "❌ Environment not configured"
    echo ""
    echo -e "${YELLOW}Available Scripts:${NC}"
    npm run 2>/dev/null | grep -E "^\s+[a-z]" | head -10
}

cleanup_reset() {
    echo -e "\n${CYAN}🧹 Cleanup & Reset Options${NC}\n"
    echo -e "${YELLOW}⚠️  Warning: These operations may delete data!${NC}\n"
    echo "1) Clean build artifacts (dist/, .cache/)"
    echo "2) Reset node_modules (reinstall dependencies)"
    echo "3) Clear logs and temp files"
    echo "4) Full reset (everything except source code)"
    echo "0) Back to main menu"
    echo ""
    echo -n "Select cleanup option: "
    read cleanup_choice
    
    case $cleanup_choice in
        1) echo "🧹 Cleaning build artifacts..."; rm -rf dist/ .cache/ .vite/; echo "✅ Build artifacts cleaned";;
        2) echo "🧹 Resetting dependencies..."; rm -rf node_modules/ package-lock.json; npm install;;
        3) echo "🧹 Clearing logs..."; rm -rf logs/ *.log; echo "✅ Logs cleared";;
        4) echo "🧹 Full reset..."; rm -rf dist/ .cache/ .vite/ node_modules/ logs/ *.log; npm install;;
        0) return;;
        *) echo "Invalid choice";;
    esac
}

# Main execution loop
main() {
    check_dependencies
    
    while true; do
        display_banner
        show_menu
        read choice
        
        case $choice in
            1) start_dev_server;;
            2) build_production;;
            3) start_prod_server;;
            4) run_docker;;
            5) run_tests;;
            6) generate_coverage;;
            7) run_audit;;
            8) security_scan;;
            9) generate_docs;;
            10) deploy_cloud;;
            11) create_release;;
            12) setup_environment;;
            13) database_management;;
            14) show_system_info;;
            15) cleanup_reset;;
            0) echo -e "\n${GREEN}👋 Goodbye! Happy coding!${NC}"; exit 0;;
            *) echo -e "\n${RED}❌ Invalid choice. Please try again.${NC}";;
        esac
        
        echo ""
        echo -e "${YELLOW}Press any key to continue...${NC}"
        read -n 1 -s
    done
}

# Run main function
main
