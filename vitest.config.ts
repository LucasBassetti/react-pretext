import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "@chenglou/pretext": path.resolve(
        __dirname,
        "src/__tests__/__mocks__/pretext.ts",
      ),
    },
  },
});
