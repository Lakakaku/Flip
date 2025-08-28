#!/bin/bash

# Open Swedish Marketplace Platform Workspace
# This script opens the project in VS Code or Cursor with the proper workspace configuration

echo "🚀 Opening Swedish Marketplace Platform workspace..."

# Check if Cursor is available (preferred for this project)
if command -v cursor &> /dev/null; then
    echo "📝 Opening in Cursor..."
    cursor flip.code-workspace
elif command -v code &> /dev/null; then
    echo "📝 Opening in VS Code..."
    code flip.code-workspace
else
    echo "❌ Neither VS Code nor Cursor found in PATH"
    echo "Please install one of the following:"
    echo "  - VS Code: https://code.visualstudio.com/"
    echo "  - Cursor: https://cursor.sh/"
    echo ""
    echo "Or open the project manually by opening flip.code-workspace in your editor"
    exit 1
fi

echo "✅ Workspace opened!"
echo ""
echo "Next steps:"
echo "1. Install recommended extensions when prompted"
echo "2. Run 'Full Development Setup' task (Ctrl+Shift+P → Tasks: Run Task)"
echo "3. Check .vscode/README.md for detailed setup instructions"