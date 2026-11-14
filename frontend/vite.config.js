import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Plugin para permitir la importación directa de archivos .geojson como JSON en Vite
function geojsonPlugin() {
  return {
    name: 'vite-plugin-geojson',
    transform(src, id) {
      if (id.endsWith('.geojson')) {
        return {
          code: `export default ${JSON.stringify(JSON.parse(src))}`,
          map: null
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geojsonPlugin()],
})
