#!/bin/bash
set -e

echo "🐳 Setting up Docker environment for tictactoe-server..."

# Create the shared network if it doesn't exist
if ! docker network ls | grep -q "cloudflare-tunnel"; then
    echo "Creating cloudflare-tunnel network..."
    docker network create cloudflare-tunnel
else
    echo "Network cloudflare-tunnel already exists"
fi

# Check if cloudflared is running and connect it to the network
CLOUDFLARED_CONTAINER=$(docker ps --filter "name=cloudflare" --format "{{.Names}}" | head -1)
if [ -n "$CLOUDFLARED_CONTAINER" ]; then
    echo "Found cloudflared container: $CLOUDFLARED_CONTAINER"
    if ! docker inspect "$CLOUDFLARED_CONTAINER" --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -q "cloudflare-tunnel"; then
        echo "Connecting $CLOUDFLARED_CONTAINER to cloudflare-tunnel network..."
        docker network connect cloudflare-tunnel "$CLOUDFLARED_CONTAINER"
    else
        echo "$CLOUDFLARED_CONTAINER already connected to cloudflare-tunnel network"
    fi
else
    echo "⚠️  No cloudflared container found. Make sure it's running and connected to cloudflare-tunnel network."
fi

# Build and start tictactoe-server
echo "Building and starting tictactoe-server..."
cd "$(dirname "$0")/.."
docker compose up -d --build

echo ""
echo "✅ Done! tictactoe-server is running."
echo ""
echo "Container status:"
docker ps --filter "name=tictactoe" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Network members:"
docker network inspect cloudflare-tunnel --format '{{range .Containers}}{{.Name}} {{end}}'
echo ""
echo "📝 Configure your Cloudflare tunnel to point to: http://tictactoe-server:3000"
