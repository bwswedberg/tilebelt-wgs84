import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "./",
  plugins: [
    tsconfigPaths(),
    dts({
      include: "src",
      exclude: ["**/*.test.ts"],
      insertTypesEntry: true,
    })
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      name: "tilebeltWgs84",
      formats: ["es", "umd"]
    }
  },
  test: {
    globals: true,
    coverage: {
      include: ["src"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
    }
  }
});
