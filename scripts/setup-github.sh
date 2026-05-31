#!/bin/bash
# Setup GitHub repo via gh CLI with PAT
# Usage: bash setup-github.sh <token> <repo-name> <public|private>

TOKEN=$1
REPO_NAME=$2
VISIBILITY=${3:-private}

if [ -z "$TOKEN" ] || [ -z "$REPO_NAME" ]; then
    echo "Usage: bash setup-github.sh <token> <repo-name> <public|private>"
    exit 1
fi

# Configure gh to use token
echo "$TOKEN" | gh auth login --with-token 2>/dev/null

# Check if auth works
if ! gh auth status 2>/dev/null; then
    echo "Auth failed. Trying alternate method..."
    # Fallback: set GITHUB_TOKEN env
    export GITHUB_TOKEN=$TOKEN
fi

# Create repo
echo "Creating repo: Yudha/$REPO_NAME ($VISIBILITY)..."
gh repo create "Yudha/$REPO_NAME" --"$VISIBILITY" --description "Nota - Aplikasi Catatan PWA (Django + React)" --confirm

if [ $? -eq 0 ]; then
    echo "✅ Repo created: https://github.com/Yudha/$REPO_NAME"
    echo ""
    echo "Remote URL:"
    echo "  https://github.com/Yudha/$REPO_NAME.git"
    echo ""
    echo "Push command:"
    echo "  git remote add origin https://\$TOKEN@github.com/Yudha/$REPO_NAME.git"
    echo "  git push -u origin main"
else
    echo "❌ Failed to create repo. Make sure:"
    echo "  - Token has 'repo' and 'read:org' scopes"
    echo "  - Repo name doesn't already exist"
fi
