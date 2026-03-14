import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "fixtures", "smoke.csv");

test("fluxo completo: upload, execucao e exibicao de resultados", async ({ page }) => {
  await page.goto("/index.html");

  await page.setInputFiles("#fileInput", fixturePath);
  await page.click("#runBtn");

  await expect(page.locator("#alerts .alert.success")).toContainText("Analise concluida", {
    timeout: 45_000,
  });

  await expect(page.locator("#resultsTable table")).toBeVisible();
  await expect(page.locator("#resultsTable tbody tr")).toHaveCount(3);

  await expect(page.locator("#kpis .card")).toHaveCount(5);
  await expect(page.locator("#reportMeta")).toContainText("Grupo: Topico 6");

  const storeOptions = page.locator("#storeSelect option");
  const categoryOptions = page.locator("#categorySelect option");
  await expect(storeOptions).toHaveCount(3);
  await expect(categoryOptions).toHaveCount(3);

  await expect(page.locator("#forecastChart")).toBeVisible();
  await expect(page.locator("#errorChart")).toBeVisible();
  await expect(page.locator("#mapeChart")).toBeVisible();
});
