import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
  },
  webServer: {
    command: "node tests/e2e/static-server.js",
    port: 4173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
