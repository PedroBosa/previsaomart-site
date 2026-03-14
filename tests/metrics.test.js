import test from "node:test";
import assert from "node:assert/strict";

import { computeMetrics } from "../src/scripts/metrics/metrics.js";
import { makeSeries } from "./helpers.js";

test("computeMetrics marca Inconclusiva quando baseline muito proximo do real", () => {
  const testSet = makeSeries(12, 2024, 1, () => 1000);
  const perfect = testSet.map((d) => d.value);

  const result = computeMetrics(testSet, {
    baseline: perfect,
    linear: perfect,
    holtWinters: perfect,
  });

  assert.equal(result.evaluation.verdict, "Inconclusiva");
  assert.equal(result.evaluation.hwImprovementLabel, "N/A");
  assert.equal(result.evaluation.linearImprovementLabel, "N/A");
});

test("computeMetrics aplica clip para previsoes negativas", () => {
  const testSet = makeSeries(6, 2025, 1, () => 100);
  const train = makeSeries(36, 2022, 1, (i) => 90 + i);

  const result = computeMetrics(testSet, {
    baseline: [-10, -10, -10, -10, -10, -10],
    linear: [80, 90, 95, 100, 110, 120],
    holtWinters: [70, 85, 90, 95, 105, 115],
  }, train);

  result.metrics.baseline.series.forEach((v) => assert.ok(v >= 0));
  assert.ok(Number.isFinite(result.metrics.baseline.rmse));
  assert.ok(Number.isFinite(result.metrics.linear.mape));
  assert.ok(Number.isFinite(result.metrics.holtWinters.smape));
  assert.ok(Number.isFinite(result.metrics.linear.wape));
  assert.ok(Number.isFinite(result.metrics.holtWinters.mase));
});

test("computeMetrics marca MAPE e sMAPE como N/A quando teste possui zeros", () => {
  const testSet = [
    { month: "2025-01", value: 0 },
    { month: "2025-02", value: 100 },
    { month: "2025-03", value: 0 },
    { month: "2025-04", value: 120 },
  ];
  const train = makeSeries(36, 2022, 1, (i) => 100 + (i % 12));

  const result = computeMetrics(
    testSet,
    {
      baseline: [0, 90, 5, 110],
      linear: [1, 95, 1, 115],
      holtWinters: [0, 97, 0, 118],
    },
    train,
  );

  assert.equal(result.metrics.baseline.mape, null);
  assert.equal(result.metrics.linear.smape, null);
  assert.ok(result.evaluation.notes.includes("MAPE e sMAPE"));
  assert.ok(Number.isFinite(result.metrics.holtWinters.wape));
  assert.equal(result.metrics.holtWinters.mase, null);
});
