import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      overlay: true
    },
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@heroicons') || id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons-vendor';
            }
            if (id.includes('@google/generative-ai')) {
              return 'ai-vendor';
            }
            if (id.includes('axios') || id.includes('@react-oauth')) {
              return 'api-vendor';
            }
            return 'vendor';
          }

          // App chunks
          if (id.includes('/services/')) {
            return 'services';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/create-trip/') || id.includes('/view-trip/') || id.includes('/my-trips/')) {
            return 'trip-features';
          }
          if (id.includes('/auth/')) {
            return 'auth';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'framer-motion',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid'
    ]
  }
})
