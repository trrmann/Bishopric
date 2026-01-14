import { defineConfig } from "vite";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    open: "index.html",
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "dev-server/public/images/church-logo.png",
          dest: "images",
        },
      ],
    }),
  ],
});
