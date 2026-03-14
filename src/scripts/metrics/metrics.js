function rmse(actual, predicted) {
  const n = actual.length || 1;
  const sum = actual.reduce((acc, y, idx) => {
    const e = y - predicted[idx];
    return acc + e * e;
  }, 0);
  return Math.sqrt(sum / n);
}

function mae(actual, predicted) {
  const n = actual.length || 1;
  const sum = actual.reduce((acc, y, idx) => acc + Math.abs(y - predicted[idx]), 0);
  return sum / n;
}

function mape(actual, predicted) {
  const n = actual.length || 1;
  const eps = 1e-6;
  const sum = actual.reduce(
    (acc, y, idx) => acc + Math.abs(y - predicted[idx]) / Math.max(Math.abs(y), eps),
    0,
  );
  return (sum / n) * 100;
}

function smape(actual, predicted) {
  const n = actual.length || 1;
  const eps = 1e-6;
  const sum = actual.reduce((acc, y, idx) => {
    const num = 2 * Math.abs(y - predicted[idx]);
    const den = Math.max(Math.abs(y) + Math.abs(predicted[idx]), eps);
    return acc + num / den;
  }, 0);
  return (sum / n) * 100;
}

function wape(actual, predicted) {
  const eps = 1e-6;
  const num = actual.reduce((acc, y, idx) => acc + Math.abs(y - predicted[idx]), 0);
  const den = actual.reduce((acc, y) => acc + Math.abs(y), 0);
  if (Math.abs(den) < eps) return null;
  return (num / den) * 100;
}

function mase(actual, predicted, train, seasonality = 12) {
  const eps = 1e-6;
  if (!Array.isArray(train) || train.length < 2) return null;

  const lag = train.length > seasonality ? seasonality : 1;
  if (train.length <= lag) return null;

  let denomSum = 0;
  let denomN = 0;
  for (let i = lag; i < train.length; i += 1) {
    denomSum += Math.abs(train[i].value - train[i - lag].value);
    denomN += 1;
  }

  const denom = denomN ? denomSum / denomN : 0;
  if (denom < eps) return null;

  const maeValue = mae(actual, predicted);
  return maeValue / denom;
}

function formatPercentLabel(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}

function hasRelevantZeros(actual) {
  const eps = 1e-6;
  return actual.some((y) => Math.abs(y) <= eps);
}

function evaluate(actual, predicted, train = []) {
  const clipped = predicted.map((v) => Math.max(v, 0));
  const zeroSensitive = hasRelevantZeros(actual);

  return {
    rmse: rmse(actual, clipped),
    mae: mae(actual, clipped),
    mape: zeroSensitive ? null : mape(actual, clipped),
    smape: zeroSensitive ? null : smape(actual, clipped),
    wape: wape(actual, clipped),
    mase: mase(actual, clipped, train, 12),
    zeroSensitive,
    series: clipped,
  };
}

function classifyImprovement(improvement, baselineRmse) {
  if (baselineRmse < 1 || !Number.isFinite(improvement)) return "N/A";
  if (improvement >= 30) return "Forte";
  if (improvement >= 20) return "Moderado";
  if (improvement >= 10) return "Fraco";
  return "Nulo";
}

export function computeMetrics(test, predictions, train = []) {
  const actual = test.map((item) => item.value);

  const baseline = evaluate(actual, predictions.baseline, train);
  const linear = evaluate(actual, predictions.linear, train);
  const holtWinters = evaluate(actual, predictions.holtWinters, train);

  const eps = 1e-6;
  const baselineRmse = baseline.rmse;
  const linearImprovement = ((baselineRmse - linear.rmse) / Math.max(baselineRmse, eps)) * 100;
  const hwImprovement = ((baselineRmse - holtWinters.rmse) / Math.max(baselineRmse, eps)) * 100;

  const verdict =
    baselineRmse < 1 ? "Inconclusiva" : hwImprovement >= 20 ? "Confirmada" : "Refutada";

  return {
    metrics: {
      baseline,
      linear,
      holtWinters,
    },
    evaluation: {
      linearImprovement,
      hwImprovement,
      linearStatus: classifyImprovement(linearImprovement, baselineRmse),
      hwStatus: classifyImprovement(hwImprovement, baselineRmse),
      linearImprovementLabel:
        baselineRmse < 1 ? "N/A" : formatPercentLabel(linearImprovement),
      hwImprovementLabel:
        baselineRmse < 1 ? "N/A" : formatPercentLabel(hwImprovement),
      verdict,
      recommendation:
        verdict === "Confirmada"
          ? "Adotar Holt-Winters como referencia para planejamento mensal e revisar parametros trimestralmente."
          : verdict === "Refutada"
            ? "Manter baseline operacional e ampliar variaveis externas antes de promover mudanca de metodo."
            : "Resultado inconclusivo; baseline com erro muito baixo exige nova janela de avaliacao para confirmar ganho real.",
      notes:
        baseline.zeroSensitive || linear.zeroSensitive || holtWinters.zeroSensitive
          ? "MAPE e sMAPE marcados como N/A por presenca de valores reais zero no periodo de teste."
          : "",
    },
  };
}
