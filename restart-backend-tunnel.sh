#!/bin/bash

# Kill existing cloudflared process
pkill -f "cloudflared tunnel"

# Start new cloudflared tunnel
~/cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared-backend.log 2>&1 &

# Wait for tunnel to start
sleep 5

# Get the URL from the log
TUNNEL_URL=$(grep "Your quick Tunnel has been created" /tmp/cloudflared-backend.log | grep -oP 'https://[^\s]+')

if [ -n "$TUNNEL_URL" ]; then
    echo "✓ Cloudflare tunnel started successfully!"
    echo "  URL: $TUNNEL_URL"
    echo ""
    echo "Update app/src/config.js with:"
    echo "  const API_BASE_URL = '$TUNNEL_URL';"
else
    echo "✗ Failed to start tunnel. Check /tmp/cloudflared-backend.log"
fi