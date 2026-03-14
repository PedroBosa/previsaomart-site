import { state } from "../state.js";

function baseOptions(horizontal = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    plugins: {
      legend: {
        labels: {
          color: "#4b5563",
          font: { family: "IBM Plex Mono", size: 11 },
        },
      },
    },
    scales: {
      x: { ticks: { color: "#4b5563" }, grid: { color: "#eef2f7" } },
      y: { ticks: { color: "#4b5563" }, grid: { color: "#eef2f7" } },
    },
  };
}

function mountChart(key, canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;
  if (state.charts[key]) state.charts[key].destroy();
  state.charts[key] = new Chart(canvas, config);
}

export function renderAllCharts() {
  if (!state.metrics || !state.split.test.length) return;

  const labels = state.split.test.map((d) => d.month);
  const actual = state.split.test.map((d) => d.value);
  const trainLabels = state.split.train.map((d) => d.month);
  const trainValues = state.split.train.map((d) => d.value);

  mountChart("historical", "historicalChart", {
    type: "line",
    data: {
      labels: [...trainLabels, ...labels],
      datasets: [
        {
          label: "Treino",
          data: [...trainValues, ...new Array(labels.length).fill(null)],
          borderColor: "#0b4a7a",
          tension: 0.2,
        },
        {
          label: "Teste",
          data: [...new Array(trainLabels.length).fill(null), ...actual],
          borderColor: "#9f1239",
          tension: 0.2,
        },
      ],
    },
    options: baseOptions(),
  });

  const monthStats = Array.from({ length: 12 }, (_, m) => {
    const items = state.monthlySeries.filter((it) => Number(it.month.split("-")[1]) - 1 === m);
    const avg = items.length ? items.reduce((acc, it) => acc + it.value, 0) / items.length : 0;
    return avg;
  });

  mountChart("seasonality", "seasonalityChart", {
    type: "bar",
    data: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      datasets: [{ label: "Sazonalidade media", data: monthStats, backgroundColor: "#0b4a7a" }],
    },
    options: baseOptions(),
  });

  mountChart("forecast", "forecastChart", {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Real", data: actual, borderColor: "#111827", tension: 0.2 },
        { label: "Gerente", data: state.metrics.baseline.series, borderColor: "#a16207", tension: 0.2 },
        { label: "Regressao", data: state.metrics.linear.series, borderColor: "#0b4a7a", tension: 0.2 },
        { label: "Holt-Winters", data: state.metrics.holtWinters.series, borderColor: "#177245", tension: 0.2 },
      ],
    },
    options: baseOptions(),
  });

  const err = (pred) => actual.map((v, i) => Math.abs(v - pred[i]));

  mountChart("error", "errorChart", {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Gerente", data: err(state.metrics.baseline.series), backgroundColor: "#a16207" },
        { label: "Regressao", data: err(state.metrics.linear.series), backgroundColor: "#0b4a7a" },
        { label: "Holt-Winters", data: err(state.metrics.holtWinters.series), backgroundColor: "#177245" },
      ],
    },
    options: baseOptions(),
  });

  mountChart("mape", "mapeChart", {
    type: "bar",
    data: {
      labels: ["Gerente", "Regressao", "Holt-Winters"],
      datasets: [
        {
          label: "MAPE (%)",
          data: [state.metrics.baseline.mape, state.metrics.linear.mape, state.metrics.holtWinters.mape],
          backgroundColor: "#0b4a7a",
        },
        {
          label: "sMAPE (%)",
          data: [state.metrics.baseline.smape, state.metrics.linear.smape, state.metrics.holtWinters.smape],
          backgroundColor: "#177245",
        },
      ],
    },
    options: baseOptions(true),
  });
}
