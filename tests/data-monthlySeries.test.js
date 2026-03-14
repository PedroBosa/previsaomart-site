import test from "node:test";
import assert from "node:assert/strict";

import "./setupDayjs.js";
import { buildMonthlySeries } from "../src/scripts/data/monthlySeries.js";

test("buildMonthlySeries agrega vendas por mes e preenche lacunas", () => {
  const records = [
    { data: "2024-01-15", loja: "Loja A", categoria: "Bebidas", vendas: "100" },
    { data: "2024-01-28", loja: "Loja A", categoria: "Bebidas", vendas: "50" },
    { data: "2024-03-02", loja: "Loja A", categoria: "Bebidas", vendas: "210" },
  ];

  const { series, qualityReport } = buildMonthlySeries(records);

  assert.equal(series.length, 3);
  assert.equal(series[0].month, "2024-01");
  assert.equal(series[0].value, 150);
  assert.equal(series[1].month, "2024-02");
  assert.equal(series[1].value, 180);
  assert.equal(series[2].month, "2024-03");
  assert.equal(series[2].value, 210);
  assert.equal(qualityReport.imputedMonths, 1);
});

test("buildMonthlySeries aplica filtros por loja e categoria", () => {
  const records = [
    { data: "2024-01-10", loja: "Loja A", categoria: "Bebidas", vendas: "100" },
    { data: "2024-01-10", loja: "Loja B", categoria: "Bebidas", vendas: "90" },
    { data: "2024-01-10", loja: "Loja A", categoria: "Mercearia", vendas: "80" },
  ];

  const { series, qualityReport } = buildMonthlySeries(records, {
    store: "Loja A",
    category: "Bebidas",
  });

  assert.equal(series.length, 1);
  assert.equal(series[0].value, 100);
  assert.equal(qualityReport.totalRows, 1);
  assert.equal(qualityReport.validRows, 1);
});

test("buildMonthlySeries reconhece header com BOM/aspas e coluna mensal", () => {
  const records = [
    { '\ufeff"mes"': "2024-01", vendas: "10" },
    { '\ufeff"mes"': "2024-02", vendas: "20" },
    { '\ufeff"mes"': "2024-03", vendas: "30" },
  ];

  const { series, qualityReport } = buildMonthlySeries(records);

  assert.equal(series.length, 3);
  assert.deepEqual(
    series.map((s) => s.month),
    ["2024-01", "2024-02", "2024-03"],
  );
  assert.equal(qualityReport.validRows, 3);
  assert.equal(qualityReport.discardedRows, 0);
});

test("buildMonthlySeries normaliza valores monetarios pt-BR e en-US", () => {
  const records = [
    { data: "2024-01-10", vendas: "1.234" },
    { data: "2024-01-11", vendas: "2,50" },
    { data: "2024-01-12", vendas: "3,000.75" },
    { data: "2024-01-13", vendas: "4.000,25" },
    { data: "2024-01-14", vendas: "(10,00)" },
  ];

  const { series, qualityReport } = buildMonthlySeries(records);

  assert.equal(series.length, 1);
  assert.equal(series[0].month, "2024-01");
  assert.equal(series[0].value, 8227.5);
  assert.equal(qualityReport.validRows, 5);
  assert.equal(qualityReport.discardedRows, 0);
});
