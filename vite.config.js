import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Usar rutas relativas para despliegue
  build: {
    outDir: 'dist', // Carpeta de salida
    assetsDir: 'assets', // Carpeta para assets dentro de dist
    minify: 'terser', // Minificación para producción
    sourcemap: false, // Desactivar sourcemaps en producción
    rollupOptions: {
      input: {
        main: 'index.html',
        game: 'game.html'
      },
      output: {
        manualChunks: {
          // Separar dependencias grandes en chunks
          vendor: ['@mediapipe/tasks-vision']
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision']
  }
})
