import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        target: "esnext",
        rollupOptions: {
            input: ["src/index.html", "src/setup.html", "src/edit.html", "src/disclaimer.html"]
        }
    },
});
