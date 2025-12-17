#!/bin/bash

# AetherGens Website Installation Script
# Downloads from GitHub and installs everything

set -e  # Exit on error

REPO_URL="https://github.com/JustSomeGuyFromTheNetherlands/-aethergens-website.git"
INSTALL_DIR="aethergens-website"

echo "🚀 AetherGens Website Installation Script"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Installing git..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y git
    elif command -v yum &> /dev/null; then
        sudo yum install -y git
    else
        echo "❌ Please install git manually first"
        exit 1
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js 18..."
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ Please install Node.js 18+ manually"
        echo "   Visit: https://nodejs.org/"
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ Git $(git --version) detected"
echo ""

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    echo "📦 Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull origin main
else
    echo "📦 Cloning repository from GitHub..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    if [ -f env.example ]; then
        cp env.example .env
    else
        cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Mailjet Configuration (Optional)
# MAILJET_API_KEY=your_api_key
# MAILJET_API_SECRET=your_api_secret
# MAILJET_FROM_EMAIL=noreply@yourdomain.com
# ADMIN_EMAIL=admin@yourdomain.com
EOF
    fi
    echo "⚠️  Please edit .env file with your configuration before starting the server"
fi

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p server/data

# Set permissions
chmod +x start.sh 2>/dev/null || true
chmod +x install.sh 2>/dev/null || true

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file: nano .env"
echo "   2. Start server:"
echo "      - Production: ./start.sh"
echo "      - Or: npm run start:prod"
echo "      - Or with PM2: pm2 start ecosystem.config.js"
echo ""
echo "📂 Installation directory: $(pwd)"
echo ""
