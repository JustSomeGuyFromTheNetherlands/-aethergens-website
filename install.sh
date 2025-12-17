#!/bin/bash

echo "🚀 AetherGens Website Installation Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build frontend
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
    cp env.example .env 2>/dev/null || echo "# Add your environment variables here" > .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
fi

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p server/data

# Set permissions
chmod +x start.sh
chmod +x install.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Run: ./start.sh (or npm run start:prod)"
echo "   3. Or use PM2: pm2 start ecosystem.config.js"
echo ""

