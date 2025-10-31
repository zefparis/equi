#!/bin/bash

echo "🔨 Testing Docker build locally..."

# Build the Docker image
docker build -t equi-saddles-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo "🚀 Starting container..."
    docker run -p 8080:8080 -e PORT=8080 equi-saddles-test
else
    echo "❌ Docker build failed!"
    exit 1
fi
