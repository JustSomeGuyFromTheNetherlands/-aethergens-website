#!/bin/bash

echo "🚀 Starting AetherGens Website..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using defaults."
fi

# Start production server
npm run start:prod


