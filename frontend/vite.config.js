import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Ensure esbuild parses JSX in .js files (handle CRA-style .js JSX files)
  esbuild: {
    loader: 'jsx'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
})
