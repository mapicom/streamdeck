/* Copying and distribution of this file, with or without modification,
    are permitted in any medium without royalty provided the copyright
    notice and this notice are preserved.  This file is offered as-is,
    without any warranty. */

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
