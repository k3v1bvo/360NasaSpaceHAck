import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/gamc-proxy': {
        target: 'https://recursosgamc.cochabamba.bo/proxy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gamc-proxy/, ''),
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'geojson-loader',
      transform(code, id) {
        if (id.endsWith('.geojson')) {
          return {
            code: `export default ${code};`,
            map: null,
          }
        }
      },
    },
  ],
})
