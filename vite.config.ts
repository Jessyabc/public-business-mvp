import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Conditionally import lovable-tagger only in development to avoid ESM build issues
  let componentTaggerPlugin = null;
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      componentTaggerPlugin = componentTagger();
    } catch (e) {
      // Silently fail if lovable-tagger is not available
      console.warn('lovable-tagger not available:', e);
    }
  }

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: true as const,
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
      componentTaggerPlugin,
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
      outDir: 'build',
      // Increase chunk size warning limit (after optimization)
      chunkSizeWarningLimit: 500,
      // Enable source maps for production debugging (optional)
      sourcemap: mode === 'development',
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Minification settings - use terser for better compression
      minify: 'esbuild' as const,
      // CSS code splitting
      cssCodeSplit: true,
      // Reduce chunk size by compressing more aggressively
      cssMinify: true,
      // Report compressed sizes
      reportCompressedSize: true,
    }
  };
});
