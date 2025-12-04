#!/bin/bash

# Script to push code to GitHub
# Run this in your terminal: bash push-to-github.sh

echo "🚀 Setting up GitHub repository..."

# Initialize git
git init

# Add all files
git add .

# Create commit
git commit -m "Initial commit - ready for deployment"

echo ""
echo "✅ Code is ready to push!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://github.com and create a new repository"
echo "2. Name it 'jomicheck' (or any name you like)"
echo "3. DO NOT initialize with README"
echo "4. Copy the repository URL"
echo "5. Run these commands (replace YOUR_USERNAME and REPO_NAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

