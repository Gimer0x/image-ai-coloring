#!/bin/bash

echo "🎨 AI Coloring Page Generator - Setup Script"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install-all

# Check if .env file exists in server directory
if [ ! -f "server/.env" ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    cp server/env.example server/.env
    echo "✅ Created server/.env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit server/.env and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
    echo "   You can get an API key from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🚀 Setup complete! To start the application:"
echo "   npm run dev"
echo ""
echo "📖 For more information, see README.md"
echo ""
echo "🎯 Next steps:"
echo "   1. Add your OpenAI API key to server/.env"
echo "   2. Run 'npm run dev' to start both servers"
echo "   3. Open http://localhost:3000 in your browser"
echo "" 