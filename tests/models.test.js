import test from "node:test";
import assert from "node:assert/strict";

import { predictBaseline } from "../src/scripts/models/baseline.js";
import { predictLinearFourier } from "../src/scripts/models/linearFourier.js";
import { predictHoltWinters } from "../src/scripts/models/holtWinters.js";
import { runModels } from "../src/scripts/models/runModels.js";
import { makeSeries, isFiniteArray } from "./helpers.js";

test("Baseline usa media dos ultimos 12 meses", () => {
  const train = makeSeries(24, 2020, 1, (i) => i + 1);
  const testSet = makeSeries(6, 2022, 1, () => 0);

  const pred = predictBaseline(train, testSet);
  const expectedAvg = train.slice(-12).reduce((acc, d) => acc + d.value, 0) / 12;

  assert.equal(pred.length, testSet.length);
  pred.forEach((v) => assert.equal(v, expectedAvg));
});

test("Regressao Fourier retorna previsao finita com tamanho correto", () => {
  const train = makeSeries(36, 2019, 1, (i) => {
    const season = Math.sin((2 * Math.PI * (i % 12)) / 12) * 50;
    return 1000 + 8 * i + season;
  });
  const testSet = makeSeries(12, 2022, 1, () => 0);

  const pred = predictLinearFourier(train, testSet);

  assert.equal(pred.length, testSet.length);
  assert.equal(isFiniteArray(pred), true);
});

test("Holt-Winters retorna previsoes positivas e finitas", () => {
  const train = makeSeries(48, 2018, 1, (i) => {
    const season = Math.cos((2 * Math.PI * (i % 12)) / 12) * 40;
    return 1200 + 5 * i + season;
  });
  const testSet = makeSeries(12, 2022, 1, () => 0);

  const pred = predictHoltWinters(train, testSet);

  assert.equal(pred.length, testSet.length);
  assert.equal(isFiniteArray(pred), true);
  pred.forEach((v) => assert.ok(v >= 0));
});

test("runModels retorna todas as saidas esperadas", () => {
  const train = makeSeries(30, 2020, 1, (i) => 900 + i * 3);
  const testSet = makeSeries(12, 2022, 7, () => 0);

  const output = runModels(train, testSet);

  assert.deepEqual(Object.keys(output).sort(), ["baseline", "holtWinters", "linear"]);
  assert.equal(output.baseline.length, testSet.length);
  assert.equal(output.linear.length, testSet.length);
  assert.equal(output.holtWinters.length, testSet.length);
});
