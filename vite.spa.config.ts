/**
 * Vite config for Capacitor Android SPA build.
 *
 * This produces a pure client-side bundle (no SSR) that Capacitor
 * loads in its WebView. Output goes to dist-spa/ which is then
 * referenced by capacitor.config.ts as the webDir.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  root: ".",
  build: {
    outDir: "dist-spa",
    emptyOutDir: true,
    target: "es2020",
    // Relative base so Capacitor can load from file://
    base: "./",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
