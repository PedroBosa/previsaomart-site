import test from "node:test";
import assert from "node:assert/strict";

import "./setupDayjs.js";
import { buildMonthlySeries } from "../src/scripts/data/monthlySeries.js";
import { splitSeries } from "../src/scripts/data/splitSeries.js";
import { runModels } from "../src/scripts/models/runModels.js";
import { computeMetrics } from "../src/scripts/metrics/metrics.js";

function approx(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: esperado ${expected}, recebido ${actual}`,
  );
}

test("regression fixture: pipeline numerica permanece estavel", () => {
  const records = [];
  const stores = ["Loja A", "Loja B"];
  const categories = ["Bebidas", "Mercearia"];

  for (let i = 0; i < 72; i += 1) {
    const year = 2019 + Math.floor(i / 12);
    const month = (i % 12) + 1;
    const mm = String(month).padStart(2, "0");
    const season = Math.sin((2 * Math.PI * (i % 12)) / 12) * 120;
    const base = 3500 + i * 22 + season;

    stores.forEach((store, sIdx) => {
      categories.forEach((category, cIdx) => {
        const noise = (sIdx + 1) * 17 + (cIdx + 1) * 9;
        records.push({
          data: `${year}-${mm}-15`,
          loja: store,
          categoria: category,
          vendas: (base + noise).toFixed(2),
        });
      });
    });
  }

  const { series } = buildMonthlySeries(records, { store: "Loja A", category: "Bebidas" });
  const split = splitSeries(series, 24);
  const predictions = runModels(split.train, split.test);
  const { metrics, evaluation } = computeMetrics(split.test, predictions, split.train);

  assert.equal(split.train.length, 48);
  assert.equal(split.test.length, 24);

  approx(metrics.baseline.rmse, 421.135, 0.5, "baseline.rmse");
  approx(metrics.linear.rmse, 0.001245, 0.001, "linear.rmse");
  approx(metrics.holtWinters.rmse, 129.253, 1.0, "holtWinters.rmse");

  assert.ok(metrics.linear.wape >= 0);
  assert.ok(metrics.holtWinters.mase > 0);
  assert.equal(typeof evaluation.verdict, "string");
});
