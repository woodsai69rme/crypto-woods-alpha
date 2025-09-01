
#!/bin/bash

# Ultimate Crypto Trading Platform - Setup Script
# Automated setup for all platforms

set -e

echo "🚀 Ultimate Crypto Trading Platform Setup"
echo "========================================"

# Detect operating system
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"  
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo "Detected OS: $OS"

# Function to install Node.js
install_nodejs() {
    echo "📦 Installing Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "Node.js already installed: $NODE_VERSION"
        return 0
    fi
    
    case $OS in
        "linux")
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "macos")
            if command -v brew &> /dev/null; then
                brew install node
            else
                echo "Please install Homebrew first or download Node.js from nodejs.org"
                exit 1
            fi
            ;;
        "windows")
            echo "Please download Node.js from nodejs.org"
            exit 1
            ;;
    esac
}

# Function to install dependencies
install_dependencies() {
    echo "📚 Installing project dependencies..."
    
    # Detect package manager
    if [ -f "bun.lockb" ]; then
        PACKAGE_MANAGER="bun"
    elif [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    elif [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    else
        PACKAGE_MANAGER="npm"
    fi
    
    echo "Using package manager: $PACKAGE_MANAGER"
    
    case $PACKAGE_MANAGER in
        "bun")
            if ! command -v bun &> /dev/null; then
                curl -fsSL https://bun.sh/install | bash
                source ~/.bashrc
            fi
            bun install
            ;;
        "pnpm")
            if ! command -v pnpm &> /dev/null; then
                npm install -g pnpm
            fi
            pnpm install
            ;;
        "yarn")
            if ! command -v yarn &> /dev/null; then
                npm install -g yarn
            fi
            yarn install
            ;;
        *)
            npm install
            ;;
    esac
}

# Function to setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "Created .env from .env.example"
        else
            cat > .env << EOF
# Database Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Development
NODE_ENV=development
PORT=8080

# Security (generate random strings for production)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Optional: Exchange API Keys
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
EOF
        fi
        
        echo "⚠️  Please edit .env file with your actual API keys and configuration"
        echo "   Supabase: https://supabase.com"
        echo "   OpenRouter: https://openrouter.ai"
    else
        echo "✅ .env file already exists"
    fi
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo "Installing Supabase CLI..."
        case $OS in
            "linux"|"macos")
                curl -fsSL https://supabase.com/install.sh | sh
                ;;
            *)
                npm install -g supabase
                ;;
        esac
    fi
    
    # Initialize Supabase if not already done
    if [ ! -f "supabase/config.toml" ]; then
        echo "Initializing Supabase project..."
        supabase init
    fi
    
    echo "✅ Database setup complete"
    echo "   Run 'npm run db:migrate' to apply database migrations"
}

# Function to run tests
run_tests() {
    echo "🧪 Running initial tests..."
    
    # Install test dependencies if not already installed
    if [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    # Run basic health checks
    echo "Running health checks..."
    
    # Check if all required files exist
    REQUIRED_FILES=("package.json" "src/main.tsx" "src/App.tsx" "vite.config.ts")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Missing required file: $file"
            exit 1
        fi
    done
    
    echo "✅ All required files present"
    
    # Try to build the project
    echo "Testing build process..."
    npm run build 2>/dev/null || {
        echo "⚠️  Build test failed - this is normal during initial setup"
        echo "   Complete your .env configuration and try 'npm run build' manually"
    }
}

# Function to create useful scripts
create_scripts() {
    echo "📝 Creating utility scripts..."
    
    mkdir -p scripts
    
    # Create launch script
    cat > scripts/launch.sh << 'EOF'
#!/bin/bash

echo "🚀 Crypto Trading Platform Launcher"
echo "=================================="
echo ""
echo "1) Start Development Server"
echo "2) Run Tests"
echo "3) Build for Production"  
echo "4) Run Database Migrations"
echo "5) Start Production Server"
echo "6) Generate Documentation"
echo "7) Run System Audit"
echo "8) Exit"
echo ""
read -p "Choose an option (1-8): " choice

case $choice in
    1)
        echo "Starting development server..."
        npm run dev
        ;;
    2)
        echo "Running tests..."
        npm run test:all
        ;;
    3)
        echo "Building for production..."
        npm run build
        ;;
    4)
        echo "Running database migrations..."
        npm run db:migrate
        ;;
    5)
        echo "Starting production server..."
        npm run start
        ;;
    6)
        echo "Generating documentation..."
        npm run docs:build
        ;;
    7)
        echo "Running system audit..."
        npm run audit:system
        ;;
    8)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac
EOF

    chmod +x scripts/launch.sh
    
    # Create Windows version
    cat > scripts/launch.bat << 'EOF'
@echo off
echo 🚀 Crypto Trading Platform Launcher
echo ==================================
echo.
echo 1) Start Development Server
echo 2) Run Tests  
echo 3) Build for Production
echo 4) Run Database Migrations
echo 5) Start Production Server
echo 6) Generate Documentation
echo 7) Run System Audit
echo 8) Exit
echo.
set /p choice=Choose an option (1-8): 

if "%choice%"=="1" (
    echo Starting development server...
    npm run dev
) else if "%choice%"=="2" (
    echo Running tests...
    npm run test:all
) else if "%choice%"=="3" (
    echo Building for production...
    npm run build
) else if "%choice%"=="4" (
    echo Running database migrations...
    npm run db:migrate
) else if "%choice%"=="5" (
    echo Starting production server...
    npm run start
) else if "%choice%"=="6" (
    echo Generating documentation...
    npm run docs:build
) else if "%choice%"=="7" (
    echo Running system audit...
    npm run audit:system
) else if "%choice%"=="8" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid option
    exit /b 1
)
EOF

    echo "✅ Created launcher scripts in scripts/ directory"
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your API keys and configuration"
    echo "2. Set up your Supabase project and add the URL and keys"
    echo "3. Run 'npm run dev' to start the development server"
    echo "4. Run 'npm run test:all' to verify everything works"
    echo ""
    echo "Quick commands:"
    echo "- npm run dev          # Start development server"
    echo "- npm run build        # Build for production"  
    echo "- npm run test:all     # Run all tests"
    echo "- ./scripts/launch.sh  # Interactive launcher (Linux/Mac)"
    echo "- scripts/launch.bat   # Interactive launcher (Windows)"
    echo ""
    echo "Documentation:"
    echo "- docs/README.md       # Project overview"
    echo "- docs/setup.md        # Detailed setup guide"
    echo "- docs/deployment.md   # Deployment instructions"
    echo ""
    echo "🔗 Useful links:"
    echo "- Supabase: https://supabase.com"
    echo "- OpenRouter: https://openrouter.ai"
    echo "- Documentation: ./docs/"
    echo ""
}

# Main setup process
main() {
    echo "Starting automated setup..."
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Run setup steps
    install_nodejs
    echo ""
    
    install_dependencies
    echo ""
    
    setup_environment
    echo ""
    
    setup_database
    echo ""
    
    create_scripts
    echo ""
    
    run_tests
    echo ""
    
    show_next_steps
}

# Run main function
main "$@"
EOF

chmod +x scripts/setup.sh
