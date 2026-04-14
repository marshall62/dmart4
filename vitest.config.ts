import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    env: {
      POSTGRES_URL: "postgresql://localhost:5432/dmart_test",
    },
  },
  resolve: {
    alias: {
      "@/lib/getArtworks": path.resolve(
        __dirname,
        "./tests/mocks/getArtworks.ts",
      ),
      "@/lib/db": path.resolve(__dirname, "./tests/mocks/db.ts"),
      "server-only": path.resolve(__dirname, "./tests/mocks/server-only.ts"),
      "@": path.resolve(__dirname, "./"),
    },
  },
});
