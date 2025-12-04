#!/bin/bash

# Check if repo is initialized and synced with GitHub

echo "🔍 Checking GitHub status..."

if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    echo ""
    echo "To initialize and push to GitHub:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin https://github.com/projectkuddus/Jomicehck.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    exit 1
fi

echo "✅ Git repository found"
echo ""
echo "Current status:"
git status --short

echo ""
echo "Recent commits:"
git log --oneline -5

echo ""
echo "Remote status:"
git remote -v

echo ""
echo "To push latest changes:"
echo "  git add ."
echo "  git commit -m 'Your commit message'"
echo "  git push"

