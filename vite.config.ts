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
    // Optimize chunk splitting for better caching and smaller initial bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries - rarely change, cached long-term
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // React Router - core navigation
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@remix-run/router')) {
            return 'vendor-router';
          }
          // Framer Motion - animation library (large)
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Radix UI - component primitives (split into separate chunk)
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Supabase - backend integration
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // TanStack Query - data fetching
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // Charts - only loaded when needed (large)
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory')) {
            return 'vendor-charts';
          }
          // React Flow - graph visualization (large, lazy loaded)
          if (id.includes('node_modules/@xyflow') || 
              id.includes('node_modules/reactflow')) {
            return 'vendor-flow';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          // Form handling
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          // Lucide icons (tree-shaking should handle this but just in case)
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    },
    // Increase chunk size warning limit (after optimization)
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (optional)
    sourcemap: mode === 'development',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Minification settings - use terser for better compression
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
    // Reduce chunk size by compressing more aggressively
    cssMinify: true,
    // Report compressed sizes
    reportCompressedSize: true,
  }
}));
