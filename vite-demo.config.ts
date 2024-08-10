import path from "path";
import { normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { defineConfig } from "vite";

export default defineConfig({
  root: path.join(__dirname, "src/demo"),
  server: {
    open: "index.html",
  },
  build: {
    outDir: path.join(__dirname, "demo-dist"),
    rollupOptions: {
      input: {
        index: path.join(__dirname, "src/demo/index.html"),
        github: path.join(__dirname, "src/demo/github.html"),
        portal: path.join(__dirname, "src/demo/portal.html"),
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.join(__dirname, "dist", "*")),
          dest: "assets/lib"
        },
        {
            src: normalizePath(path.join(__dirname, "src", "test", "data", "*")),
            dest: "assets/data"
        }
      ]
    })
  ]
});