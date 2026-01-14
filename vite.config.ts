import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Reduce file watcher overhead
      usePolling: false,
      interval: 100,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.log',
        '**/coverage/**',
        '**/tmp/**',
        '**/temp/**'
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@supabase/postgrest-js',
      '@supabase/realtime-js',
      '@supabase/storage-js',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion'
    ]
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - rarely change, cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework - stable, cached long-term
          'vendor-ui': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
          // Supabase - backend integration
          'vendor-supabase': ['@supabase/supabase-js'],
          // TanStack Query - data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Charts - only loaded when needed
          'vendor-charts': ['recharts'],
        }
      }
    },
    // Increase chunk size warning limit (after optimization)
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional)
    sourcemap: mode === 'development',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Minification settings
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
  }
}));
