import test from "node:test";
import assert from "node:assert/strict";

import { splitSeries } from "../src/scripts/data/splitSeries.js";
import { makeSeries } from "./helpers.js";

test("splitSeries falha para series menores que 36 meses", () => {
  const series = makeSeries(35, 2021, 1, (i) => i + 1);

  assert.throws(
    () => splitSeries(series, 12),
    /Serie insuficiente/,
  );
});

test("splitSeries respeita tamanho de teste solicitado quando habilitado", () => {
  const series = makeSeries(60, 2019, 1, (i) => 1000 + i);
  const split = splitSeries(series, 24);

  assert.equal(split.testSize, 24);
  assert.equal(split.train.length, 36);
  assert.equal(split.test.length, 24);
  assert.deepEqual(split.enabledOptions, [12, 18, 24, 36]);
});

test("splitSeries usa fallback valido quando solicitado nao e permitido", () => {
  const series = makeSeries(42, 2020, 1, (i) => 500 + i);
  const split = splitSeries(series, 36);

  assert.equal(split.testSize, 12);
  assert.equal(split.train.length, 30);
  assert.equal(split.test.length, 12);
  assert.deepEqual(split.enabledOptions, [12, 18]);
});
