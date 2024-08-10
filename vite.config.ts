import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main/ts/Main.ts',
            name: "Gitline",
            fileName: (format) => `gitline.${format}.js` // ? https://github.com/jakearchibald/idb-keyval/issues/135
        },
    },
    publicDir: 'src/main/public'
});