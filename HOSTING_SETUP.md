# Autodiagnostix - Online Hosting Setup

## Current Configuration

### Frontend
- **Local URL**: http://localhost:5174
- **Public URL**: https://huffiest-growly-annmarie.ngrok-free.dev
- **Tunnel Service**: ngrok

### Backend API
- **Local URL**: http://localhost:3000
- **Public URL**: https://price-depending-scott-trust.trycloudflare.com
- **Tunnel Service**: Cloudflare Tunnel (cloudflared)

## Why Cloudflare Tunnel?

Cloudflare Tunnel was chosen over localtunnel because:
- More reliable and stable connection
- Better uptime
- No subdomain registration required
- Free and unlimited
- Faster response times

## Starting the Services

### Start Development Server
```bash
npm run dev
```
This starts both frontend (port 5174) and backend (port 3000) using concurrently.

### Start Backend Tunnel (if needed)
```bash
./restart-backend-tunnel.sh
```
Or manually:
```bash
~/cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared-backend.log 2>&1 &
```

### Start Frontend Tunnel (if needed)
```bash
ngrok http 5174
```

## Configuration Files

### API Configuration
`app/src/config.js` - Contains the backend API URL that all components use.

### Vite Configuration
`app/vite.config.js` - Contains allowedHosts for tunnel domains.

## Troubleshooting

### Backend tunnel not working
1. Check if backend server is running: `curl http://localhost:3000/api/products`
2. Check tunnel logs: `tail -f /tmp/cloudflared-backend.log`
3. Restart tunnel: `./restart-backend-tunnel.sh`

### Frontend not loading API data
1. Check if backend tunnel is accessible: `curl https://price-depending-scott-trust.trycloudflare.com/api/products`
2. Check browser console for CORS errors
3. Verify API_BASE_URL in `app/src/config.js` matches tunnel URL

### Tunnel URL changed
Cloudflare quick tunnels generate random URLs each time. If the URL changes:
1. Get new URL from logs: `grep "Your quick Tunnel has been created" /tmp/cloudflared-backend.log`
2. Update `app/src/config.js` with new URL
3. Restart frontend if needed

## Notes

- ngrok free plan has limitations (random subdomains, one tunnel at a time)
- Cloudflare Tunnel quick mode generates random URLs but is more reliable
- Both tunnels need to be running for the site to work online
- The frontend ngrok tunnel is stable and doesn't need frequent restarts
- The backend cloudflared tunnel is more stable than localtunnel was