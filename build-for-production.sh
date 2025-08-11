#!/bin/bash

# Build the application for production deployment
echo "Building frontend..."
npm run build

echo "Moving static files for production serving..."
# Move files from dist/public to dist for static serving
if [ -d "dist/public" ]; then
    cp -r dist/public/* dist/
    rm -rf dist/public
    echo "Static files moved successfully"
fi

echo "Production build complete!"
echo "Files are ready in the 'dist' directory"
echo "To deploy to Railway:"
echo "1. Set NODE_ENV=production"
echo "2. Set DATABASE_URL to your production database"
echo "3. Deploy using 'npm start'"