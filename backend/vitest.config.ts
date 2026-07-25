import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        testTimeout: 15000,
        hookTimeout: 30000,
        setupFiles: ["./src/tests/setup.ts"],
        // Run test files sequentially to avoid DB conflicts
        fileParallelism: false,
    },
});
