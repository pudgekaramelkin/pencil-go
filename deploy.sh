#!/bin/bash

echo "🎨 PencilGO Deployment Script"
echo "================================"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Ask which platform
echo "Choose deployment platform:"
echo "1) Railway"
echo "2) Render"
echo "3) Heroku"
echo "4) Docker"
echo "5) Cancel"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🚂 Deploying to Railway..."
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        railway up
        ;;
    2)
        echo "🎨 Deploying to Render..."
        echo "Please push to GitHub and deploy via Render dashboard"
        echo "https://dashboard.render.com"
        ;;
    3)
        echo "🟣 Deploying to Heroku..."
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        git push heroku main
        heroku open
        ;;
    4)
        echo "🐳 Building Docker image..."
        docker build -t drawguess .
        echo "✅ Docker image built!"
        echo "Run with: docker run -p 3001:3001 drawguess"
        ;;
    5)
        echo "Cancelled"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo "🎉 Your game is live!"
