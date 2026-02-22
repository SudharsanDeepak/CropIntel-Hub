#!/bin/bash
echo "🚀 Starting build process..."
pip install -r requirements.txt
python setup_env.py
echo "✅ Build complete!"
