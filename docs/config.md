
# Configuration Guide

Complete configuration reference for the Ultimate Crypto Trading Platform.

## 📋 Environment Variables

### Required Configuration

**Database (Required)**
```bash
# Supabase Configuration (Recommended)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative: Direct PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/database

# Alternative: SQLite (Offline Mode)  
DATABASE_URL=sqlite:./data/crypto_trading.db
```

**AI Services (Required for AI Features)**
```bash
# OpenRouter (Multi-LLM Provider)
OPENROUTER_API_KEY=sk-or-v1-xxx...

# Optional: Direct AI Provider Keys
OPENAI_API_KEY=sk-xxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
GEMINI_API_KEY=xxx...
```

### Optional Configuration

**Exchange APIs (For Live Trading)**
```bash
# Binance
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Coinbase
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_SECRET=your_coinbase_secret

# Kraken
KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_PRIVATE_KEY=your_kraken_private_key
```

**Security Configuration**
```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRY=24h

# Encryption Keys (32 characters minimum)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # Max requests per window
```

**Application Settings**
```bash
# Environment
NODE_ENV=development          # development | production | test
PORT=8080                     # Server port
HOST=0.0.0.0                 # Server host

# CORS Configuration  
CORS_ORIGIN=http://localhost:8080
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info               # error | warn | info | debug
LOG_FORMAT=json              # json | simple

# Feature Flags
ENABLE_TRADING=true          # Enable/disable trading features
ENABLE_AI_FEATURES=true      # Enable/disable AI features  
ENABLE_PAPER_TRADING=true    # Enable/disable paper trading
MAINTENANCE_MODE=false       # Put system in maintenance mode
```

**Monitoring & Analytics**
```bash
# Error Tracking
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_mixpanel_token

# Performance Monitoring
NEW_RELIC_LICENSE_KEY=your_new_relic_key
DATADOG_API_KEY=your_datadog_key
```

**Notifications**
```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx...
FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=your_chat_id

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx...
```

## ⚙️ Configuration Files

### Application Configuration

**config/app.json**
```json
{
  "app": {
    "name": "Ultimate Crypto Trading Platform",
    "version": "1.0.0",
    "description": "Professional-grade crypto trading platform"
  },
  "features": {
    "trading": {
      "enabled": true,
      "paperTradingOnly": false,
      "maxPositionSize": 0.1,
      "defaultSlippage": 0.001
    },
    "ai": {
      "enabled": true,
      "providers": ["openrouter", "openai", "anthropic"],
      "defaultModel": "gpt-4-turbo-preview"
    },
    "audit": {
      "enabled": true,
      "autoRun": true,
      "scheduleInterval": "0 0 * * *"
    }
  },
  "limits": {
    "maxBotsPerUser": 10,
    "maxOrdersPerMinute": 100,
    "maxDataRetentionDays": 90
  }
}
```

### Database Configuration

**config/database.json**
```json
{
  "development": {
    "provider": "supabase",
    "url": "${VITE_SUPABASE_URL}",
    "key": "${VITE_SUPABASE_PUBLISHABLE_KEY}",
    "poolSize": 10,
    "ssl": true
  },
  "production": {
    "provider": "postgresql",
    "url": "${DATABASE_URL}",
    "poolSize": 20,
    "ssl": true,
    "migration": {
      "auto": false,
      "backup": true
    }
  },
  "test": {
    "provider": "sqlite",
    "url": ":memory:",
    "logging": false
  }
}
```

### Trading Configuration

**config/trading.json**
```json
{
  "exchanges": {
    "binance": {
      "enabled": true,
      "testnet": false,
      "rateLimits": {
        "requests": 1200,
        "window": 60000
      }
    },
    "coinbase": {
      "enabled": true,
      "sandbox": false,
      "rateLimits": {
        "requests": 10,
        "window": 1000
      }
    }
  },
  "pairs": {
    "default": ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT"],
    "maxTracked": 50
  },
  "risk": {
    "maxDrawdown": 0.2,
    "maxPositionSize": 0.1,
    "stopLossDefault": 0.05,
    "takeProfitDefault": 0.1
  },
  "bots": {
    "maxConcurrent": 5,
    "minInterval": 1000,
    "maxMemoryMB": 100
  }
}
```

### AI Configuration

**config/ai.json**
```json
{
  "providers": {
    "openrouter": {
      "enabled": true,
      "models": {
        "analysis": "gpt-4-turbo-preview",
        "signals": "claude-3-opus-20240229",
        "sentiment": "gemini-pro"
      },
      "timeout": 30000,
      "retries": 3
    }
  },
  "features": {
    "marketAnalysis": {
      "enabled": true,
      "updateInterval": 300000,
      "indicators": ["RSI", "MACD", "BB", "SMA", "EMA"]
    },
    "sentimentAnalysis": {
      "enabled": true,
      "sources": ["twitter", "reddit", "news"],
      "updateInterval": 600000
    },
    "predictions": {
      "enabled": true,
      "horizon": ["1h", "4h", "1d", "1w"],
      "confidence": 0.7
    }
  },
  "limits": {
    "requestsPerMinute": 60,
    "maxTokensPerRequest": 4000,
    "dailyBudget": 100
  }
}
```

## 🔒 Security Configuration

### Authentication Settings

**config/auth.json**
```json
{
  "supabase": {
    "providers": {
      "email": true,
      "google": true,
      "github": false
    },
    "settings": {
      "confirmEmail": false,
      "enableSignups": true,
      "sessionTimeout": 86400
    }
  },
  "jwt": {
    "secret": "${JWT_SECRET}",
    "expiresIn": "24h",
    "algorithm": "HS256"
  },
  "password": {
    "minLength": 8,
    "requireUppercase": true,
    "requireNumbers": true,
    "requireSymbols": true
  },
  "sessions": {
    "secure": true,
    "httpOnly": true,
    "sameSite": "strict",
    "maxAge": 86400
  }
}
```

### API Security

**config/security.json**
```json
{
  "cors": {
    "origin": ["http://localhost:8080", "https://yourdomain.com"],
    "credentials": true,
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "headers": ["Content-Type", "Authorization"]
  },
  "rateLimiting": {
    "windowMs": 900000,
    "max": 100,
    "skipSuccessfulRequests": true,
    "skipFailedRequests": false
  },
  "headers": {
    "contentSecurityPolicy": {
      "directives": {
        "defaultSrc": ["'self'"],
        "scriptSrc": ["'self'", "'unsafe-inline'"],
        "styleSrc": ["'self'", "'unsafe-inline'"],
        "imgSrc": ["'self'", "data:", "https:"]
      }
    },
    "hsts": {
      "maxAge": 31536000,
      "includeSubDomains": true,
      "preload": true
    }
  },
  "encryption": {
    "algorithm": "aes-256-gcm",
    "keyDerivation": "pbkdf2",
    "iterations": 100000
  }
}
```

## 📊 Monitoring Configuration

### Logging Configuration

**config/logging.json**
```json
{
  "level": "${LOG_LEVEL:-info}",
  "format": "${LOG_FORMAT:-json}",
  "transports": {
    "console": {
      "enabled": true,
      "level": "info"
    },
    "file": {
      "enabled": true,
      "level": "warn",
      "filename": "logs/app.log",
      "maxSize": "10MB",
      "maxFiles": 5
    },
    "error": {
      "enabled": true,
      "level": "error",
      "filename": "logs/error.log"
    }
  },
  "audit": {
    "enabled": true,
    "filename": "logs/audit.log",
    "retention": "30d"
  }
}
```

### Performance Configuration

**config/performance.json**
```json
{
  "monitoring": {
    "enabled": true,
    "interval": 60000,
    "metrics": ["cpu", "memory", "disk", "network"]
  },
  "caching": {
    "redis": {
      "enabled": false,
      "url": "${REDIS_URL}",
      "ttl": 3600
    },
    "memory": {
      "enabled": true,
      "maxSize": "100MB",
      "ttl": 300
    }
  },
  "optimization": {
    "compression": true,
    "minification": true,
    "bundleSplitting": true,
    "treeshaking": true
  }
}
```

## 🌍 Environment-Specific Configuration

### Development Environment

**.env.development**
```bash
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
ENABLE_DEVTOOLS=true
SKIP_PREFLIGHT_CHECK=true

# Development-specific features
ENABLE_MOCK_DATA=true
ENABLE_DEBUG_PANEL=true
DISABLE_AUTH_CHECK=false
```

### Production Environment

**.env.production**
```bash
NODE_ENV=production
PORT=${PORT:-8080}
LOG_LEVEL=info
ENABLE_HOT_RELOAD=false
ENABLE_DEVTOOLS=false

# Production optimizations
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true
ENABLE_MONITORING=true

# Security
FORCE_HTTPS=true
SECURE_COOKIES=true
ENABLE_HELMET=true
```

### Testing Environment

**.env.test**
```bash
NODE_ENV=test
DATABASE_URL=sqlite::memory:
LOG_LEVEL=silent
DISABLE_RATE_LIMITING=true
ENABLE_MOCK_APIs=true
```

## 🔧 Configuration Validation

### Environment Validation Script

**scripts/validate-config.js**
```javascript
const fs = require('fs');
const path = require('path');

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'NODE_ENV'
];

const optionalVars = [
  'OPENROUTER_API_KEY',
  'BINANCE_API_KEY',
  'JWT_SECRET'
];

function validateConfig() {
  console.log('🔍 Validating configuration...');
  
  const missing = [];
  const warnings = [];
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });
  
  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach(varName => console.warn(`  - ${varName}`));
    console.warn('   Some features may not work without these variables.');
  }
  
  console.log('✅ Configuration validation passed!');
}

if (require.main === module) {
  validateConfig();
}

module.exports = { validateConfig };
```

## 📝 Configuration Best Practices

### Security Guidelines
1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys regularly** 
4. **Use different keys** for different environments
5. **Enable audit logging** for all configuration changes

### Performance Guidelines
1. **Cache frequently accessed data**
2. **Use connection pooling** for databases
3. **Implement rate limiting** to prevent abuse
4. **Monitor resource usage** and set alerts
5. **Use CDN** for static assets in production

### Maintenance Guidelines
1. **Document all configuration options**
2. **Use validation scripts** to catch errors early
3. **Implement health checks** for all external services
4. **Keep backups** of working configurations
5. **Test configuration changes** in staging first

---

For more help with configuration, see our [troubleshooting guide](./troubleshooting.md).
