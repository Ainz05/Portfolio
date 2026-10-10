/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Fallback for hosts that cannot set HTTP headers (see docs/DEPLOY-SECURITY.md).
// Build only: the dev server needs an inline script for React Fast Refresh.
// `frame-ancestors` is ignored in a <meta> tag, so the real header remains required.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests";

function cspMetaPlugin(): Plugin {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend',
      },
    ],
  };
}

export default defineConfig({
  plugins: [react(), cspMetaPlugin()],
  resolve: { tsconfigPaths: true },
  build: {
    // Public bundle: no sourcemaps, no console/debugger (see frontend/CLAUDE.md).
    sourcemap: false,
    // Never inline assets as data: URLs: the CSP (font-src/img-src 'self') would block fonts.
    assetsInlineLimit: 0,
    target: 'es2022',
    rolldownOptions: {
      output: { minify: { compress: { dropConsole: true, dropDebugger: true } } },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
