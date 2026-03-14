function normalizeDate(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const formats = [
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "YYYY/MM/DD",
    "DD-MM-YYYY",
    "YYYY-MM",
    "MM/YYYY",
  ];
  for (const format of formats) {
    const parsed = dayjs.utc(value, format, true);
    if (parsed.isValid()) {
      return parsed.startOf("month").toDate();
    }
  }

  return null;
}

function normalizeText(raw) {
  return String(raw ?? "").trim();
}

function normalizeKey(raw) {
  return String(raw ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^"+|"+$/g, "")
    .toLowerCase();
}

function getField(row, aliases) {
  const normalizedAliases = new Set(aliases.map((a) => normalizeKey(a)));
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(normalizeKey(key))) {
      return value;
    }
  }
  return null;
}

function normalizeNumber(raw) {
  if (raw == null) return null;
  let value = String(raw)
    .replace(/R\$/g, "")
    .replace(/\s+/g, "")
    .replace(/^"+|"+$/g, "")
    .trim();

  if (!value) return null;

  const negativeByParentheses = /^\(.*\)$/.test(value);
  if (negativeByParentheses) {
    value = `-${value.slice(1, -1)}`;
  }

  const hasDot = value.includes(".");
  const hasComma = value.includes(",");

  if (hasDot && hasComma) {
    const lastDot = value.lastIndexOf(".");
    const lastComma = value.lastIndexOf(",");

    if (lastComma > lastDot) {
      value = value.replace(/\./g, "").replace(/,/g, ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (hasComma) {
    if (/^-?\d{1,3}(,\d{3})+$/.test(value)) {
      value = value.replace(/,/g, "");
    } else {
      value = value.replace(/,/g, ".");
    }
  } else if (hasDot && /^-?\d{1,3}(\.\d{3})+$/.test(value)) {
    value = value.replace(/\./g, "");
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function monthDiff(start, end) {
  return (end.year() - start.year()) * 12 + (end.month() - start.month());
}

function fillMissingMonths(sortedSeries) {
  if (sortedSeries.length < 2) return { filled: sortedSeries, imputedMonths: 0 };

  const filled = [];
  let imputedMonths = 0;

  for (let i = 0; i < sortedSeries.length - 1; i += 1) {
    const current = sortedSeries[i];
    const next = sortedSeries[i + 1];
    filled.push(current);

    const currDate = dayjs.utc(`${current.month}-01`);
    const nextDate = dayjs.utc(`${next.month}-01`);
    const gap = monthDiff(currDate, nextDate);

    if (gap > 1) {
      for (let step = 1; step < gap; step += 1) {
        const date = currDate.add(step, "month");
        const ratio = step / gap;
        const value = current.value + (next.value - current.value) * ratio;
        filled.push({ month: date.format("YYYY-MM"), value });
        imputedMonths += 1;
      }
    }
  }

  filled.push(sortedSeries[sortedSeries.length - 1]);
  return { filled, imputedMonths };
}

function estimateOutliers(series) {
  if (series.length < 4) return 0;
  const values = series.map((item) => item.value);
  const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance || 1);

  return values.filter((v) => Math.abs((v - mean) / std) > 3).length;
}

export function buildMonthlySeries(records, filters = {}) {
  const monthMap = new Map();
  const storeSet = new Set();
  const categorySet = new Set();
  let consideredRows = 0;
  const report = {
    totalRows: 0,
    validRows: 0,
    discardedRows: 0,
    discardRate: 0,
    imputedMonths: 0,
    outliers: 0,
    score: 0,
  };
  const logs = [];

  records.forEach((row) => {
    const store = normalizeText(getField(row, ["loja", "store", "filial"]));
    const category = normalizeText(getField(row, ["categoria", "category", "departamento"]));

    if (store) storeSet.add(store);
    if (category) categorySet.add(category);

    const selectedStore = filters.store || "";
    const selectedCategory = filters.category || "";
    if (selectedStore && store !== selectedStore) return;
    if (selectedCategory && category !== selectedCategory) return;

    consideredRows += 1;

    const date = normalizeDate(
      getField(row, ["data", "date", "dt", "timestamp", "mes", "month"]),
    );
    const sales = normalizeNumber(
      getField(row, ["vendas", "sales", "receita", "faturamento", "valor"]),
    );

    if (!date || sales == null) {
      report.discardedRows += 1;
      return;
    }

    report.validRows += 1;

    const key = dayjs.utc(date).format("YYYY-MM");
    monthMap.set(key, (monthMap.get(key) || 0) + sales);
  });

  const sorted = Array.from(monthMap.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const { filled, imputedMonths } = fillMissingMonths(sorted);
  report.totalRows = consideredRows;
  report.imputedMonths = imputedMonths;
  report.discardRate = report.totalRows
    ? (report.discardedRows / report.totalRows) * 100
    : 0;
  report.outliers = estimateOutliers(filled);

  const penalty = Math.min(60, report.discardRate) + Math.min(20, report.imputedMonths * 2) + Math.min(20, report.outliers * 2);
  report.score = Math.max(0, 100 - penalty);

  logs.push({ level: "info", message: `Linhas consideradas apos filtro: ${report.totalRows}` });
  logs.push({ level: "info", message: `Linhas validas: ${report.validRows}` });
  if (report.discardRate > 15) {
    logs.push({ level: "warn", message: `Taxa de descarte elevada: ${report.discardRate.toFixed(1)}%` });
  }

  return {
    series: filled,
    qualityReport: report,
    logs,
    filterOptions: {
      stores: Array.from(storeSet).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
    },
  };
}
