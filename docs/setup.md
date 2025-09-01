
# Setup Guide

Complete installation and configuration guide for the Ultimate Crypto Trading Platform.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18+)
- **Node.js**: Version 18.0 or higher
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: 2GB available space
- **Network**: Stable internet connection for real-time data

### Required Accounts
1. **Supabase Account** (recommended) or PostgreSQL database
2. **OpenRouter API Key** for AI features
3. **Exchange API Keys** (optional, for live trading)

## 🚀 Installation Methods

### Method 1: Standard Installation (Recommended)

1. **Clone Repository**
```bash
git clone https://github.com/your-username/crypto-trading-platform.git
cd crypto-trading-platform
```

2. **Install Dependencies**
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm (fastest)
pnpm install

# Using bun (fastest)
bun install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

4. **Database Setup**
```bash
# For Supabase (cloud database)
npm run db:setup

# For local PostgreSQL
npm run db:setup:local

# For SQLite (offline mode)
npm run db:setup:sqlite
```

### Method 2: Docker Installation

1. **Using Docker Compose** (includes database)
```bash
git clone https://github.com/your-username/crypto-trading-platform.git
cd crypto-trading-platform
docker-compose up -d
```

2. **Using Docker only**
```bash
docker build -t crypto-platform .
docker run -p 8080:8080 crypto-platform
```

### Method 3: One-Click Deployment

**Vercel**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/crypto-trading-platform)

**Railway**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-username/crypto-trading-platform)

**Render**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/crypto-trading-platform)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# AI Configuration  
OPENROUTER_API_KEY=your_openrouter_key

# Exchange APIs (Optional)
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET_KEY=your_binance_secret

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_character_key

# Development
NODE_ENV=development
PORT=8080
```

### Database Setup

#### Option 1: Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run database migrations:
```bash
npm run db:migrate
```

#### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
```sql
CREATE DATABASE crypto_trading;
```
3. Update connection string in `.env`
4. Run migrations:
```bash
npm run db:migrate:local
```

#### Option 3: SQLite (Offline Mode)

```bash
npm run db:setup:sqlite
```

### API Keys Setup

#### OpenRouter (AI Features)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Generate API key
3. Add to `.env` file

#### Exchange APIs (Optional)
1. **Binance**: [binance.com/en/my/settings/api-management](https://binance.com/en/my/settings/api-management)
2. **Coinbase**: [coinbase.com/settings/api](https://coinbase.com/settings/api)
3. Add keys to `.env` file

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Access at: http://localhost:8080

### Production Mode
```bash
npm run build
npm run start
```

### Testing Mode
```bash
npm run test:all
```

## 🔧 Platform-Specific Setup

### Windows

1. **Install Node.js** from [nodejs.org](https://nodejs.org)
2. **Install Git** from [git-scm.com](https://git-scm.com)
3. **Run PowerShell as Administrator**
4. **Enable script execution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
5. **Run setup script**:
```powershell
.\scripts\setup-windows.bat
```

### macOS

1. **Install Homebrew**:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
2. **Install dependencies**:
```bash
brew install node git
```
3. **Run setup script**:
```bash
chmod +x scripts/setup-macos.sh
./scripts/setup-macos.sh
```

### Linux (Ubuntu/Debian)

1. **Update package list**:
```bash
sudo apt update
```
2. **Install Node.js and dependencies**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
```
3. **Run setup script**:
```bash
chmod +x scripts/setup-linux.sh
./scripts/setup-linux.sh
```

## 🧪 Verification

### Health Check
```bash
npm run health-check
```

### System Test
```bash
npm run test:system
```

### API Test
```bash
npm run test:api
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 8080
npx kill-port 8080
# Or use different port
PORT=3000 npm run dev
```

**Database Connection Issues**
```bash
# Check database status
npm run db:status
# Reset database
npm run db:reset
```

**Missing Dependencies**
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Permission Issues (Linux/Mac)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Log Files
- **Application logs**: `logs/app.log`
- **Error logs**: `logs/error.log`
- **Audit logs**: `logs/audit.log`

## 📚 Next Steps

1. **Review Configuration**: [config.md](./config.md)
2. **Deploy to Cloud**: [deployment.md](./deployment.md)
3. **Run Tests**: [testing.md](./testing.md)
4. **Security Setup**: [security.md](./security.md)

## 💡 Tips for Success

1. **Start with Paper Trading** - Never use real money until fully tested
2. **Monitor Logs** - Keep an eye on application and error logs
3. **Regular Backups** - Backup your database and configuration
4. **Update Dependencies** - Keep packages up to date for security
5. **Use Version Control** - Commit changes before major updates

---

Need help? Check [troubleshooting.md](./troubleshooting.md) or open an issue on GitHub.
