#!/bin/bash

# CogniFillz Setup Script
# Run this to get started quickly

set -e  # Exit on error

echo "🧠 CogniFillz Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

echo ""
echo -e "${BLUE}What would you like to set up?${NC}"
echo "1) Extension only (basic autofill)"
echo "2) Extension + Backend (with AI)"
echo "3) Everything (Extension + Backend + create Python venv)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1|2|3)
        echo ""
        echo -e "${BLUE}Setting up Chrome Extension...${NC}"
        cd apps/extension
        
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        else
            echo "Dependencies already installed, skipping..."
        fi
        
        echo "Building extension..."
        npm run build
        
        echo -e "${GREEN}✓ Extension built successfully!${NC}"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "1. Open Chrome and go to chrome://extensions/"
        echo "2. Enable 'Developer mode' (top right)"
        echo "3. Click 'Load unpacked'"
        echo "4. Select: $(pwd)/dist"
        echo ""
        
        cd ../..
        ;;
esac

case $choice in
    2|3)
        echo -e "${BLUE}Setting up Python Backend...${NC}"
        cd apps/server
        
        if [ "$choice" == "3" ]; then
            if [ ! -d "venv" ]; then
                echo "Creating virtual environment..."
                python3 -m venv venv
            else
                echo "Virtual environment already exists, skipping..."
            fi
            
            echo "Activating virtual environment..."
            source venv/bin/activate
            
            echo "Installing Python dependencies..."
            pip install -r requirements.txt
            
            echo -e "${GREEN}✓ Backend setup complete!${NC}"
            echo ""
            echo -e "${YELLOW}To start the backend server:${NC}"
            echo "cd apps/server"
            echo "source venv/bin/activate"
            echo "python main.py"
        else
            echo -e "${YELLOW}Note: Python virtual environment not created.${NC}"
            echo "You'll need to install dependencies manually:"
            echo "  cd apps/server"
            echo "  pip install -r requirements.txt"
        fi
        
        cd ../..
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}What's next?${NC}"
echo ""

if [ "$choice" == "1" ]; then
    echo "1. Load the extension in Chrome (see steps above)"
    echo "2. Click the CogniFillz icon and create your profile"
    echo "3. Visit a job application page and test autofill!"
    echo ""
    echo "📖 For more details, see: QUICK_START.md"
fi

if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
    echo "1. Install LM Studio from https://lmstudio.ai/"
    echo "2. Download a model (recommended: llama-3.2-3b-instruct)"
    echo "3. Start LM Studio's local server"
    echo "4. Start the backend: cd apps/server && python main.py"
    echo "5. Load the extension in Chrome (see steps above)"
    echo "6. Test AI features!"
    echo ""
    echo "📖 For detailed guide, see: START_HERE.md (Path B)"
fi

echo ""
echo "Happy building! 🧠"
