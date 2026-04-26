import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./globalSetup.ts",
    projects: [
      {
        test: {
          name: "node-tests",
          include: ["__tests__/**/*.test.ts"],
          exclude: ["__tests__/browser/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "browser-tests",
          include: ["__tests__/browser/**/*.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
