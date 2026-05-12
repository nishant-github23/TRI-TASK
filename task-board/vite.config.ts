/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const VENDOR_CHUNKS: Record<string, string[]> = {
  "vendor-react": ["react", "react-dom"],
  "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
  "vendor-virtual": ["@tanstack/react-virtual"],
  "vendor-faker": ["@faker-js/faker"],
  "vendor-toast": ["react-hot-toast"],
  "vendor-uuid": ["uuid"],
};

export default defineConfig({
  plugins: [react()],

  // ─── Test Configuration ────────────────────────────────────────────
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["./src/tests/**/*.test.ts", "./src/tests/**/*.test.tsx"],
  },

  // ─── Build Configuration ───────────────────────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [chunkName, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some((pkg) => id.includes(`node_modules/${pkg}`))) {
              return chunkName;
            }
          }
        },
      },
    },
  },
});
