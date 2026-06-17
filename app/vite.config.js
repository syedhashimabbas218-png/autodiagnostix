import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'autodiagnostix.loca.lt',
      'autodiagnostix-web.loca.lt',
      'autodiagnostix-frontend.loca.lt',
      'huffiest-growly-annmarie.ngrok-free.dev',
      '.loca.lt',
      '.ngrok-free.dev',
      '.trycloudflare.com'
    ]
  }
})
