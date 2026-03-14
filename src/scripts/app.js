import { state } from "./state.js";
import { setupTabs, switchTab } from "./ui/tabs.js";
import { showAlert } from "./ui/alerts.js";
import {
  renderConclusion,
  renderDataSummary,
  renderFilterOptions,
  renderKpis,
  renderModelSummary,
  renderReportMeta,
  renderRunStatus,
  renderResultsTable,
  renderSplitOptions,
} from "./ui/render.js";
import { runPipeline } from "./pipeline/runPipeline.js";

async function rerunWithFilters(successMessage) {
  if (!state.rawFile) return;
  try {
    await runPipeline(state.rawFile);
    showAlert("success", successMessage);
  } catch (error) {
    showAlert("error", `Falha ao aplicar filtro: ${error.message}`);
    console.error(error);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar: ${url}`));
    document.head.appendChild(script);
  });
}

async function ensureDependency(dep) {
  if (dep.test()) return;

  let lastError = null;
  for (const url of dep.fallbacks) {
    try {
      await loadScript(url);
      if (dep.test()) return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Dependencia ausente: ${dep.name}${lastError ? ` (${lastError.message})` : ""}`);
}

async function ensureDependencies() {
  const deps = [
    {
      name: "Chart.js",
      test: () => typeof window.Chart !== "undefined",
      fallbacks: [
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js",
        "https://unpkg.com/chart.js@4.4.0/dist/chart.umd.min.js",
      ],
    },
    {
      name: "PapaParse",
      test: () => typeof window.Papa !== "undefined",
      fallbacks: [
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js",
        "https://unpkg.com/papaparse@5.4.1/papaparse.min.js",
      ],
    },
    {
      name: "Day.js",
      test: () => typeof window.dayjs !== "undefined",
      fallbacks: [
        "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.13/dayjs.min.js",
        "https://unpkg.com/dayjs@1.11.13/dayjs.min.js",
      ],
    },
    {
      name: "Day.js customParseFormat",
      test: () => typeof window.dayjs_plugin_customParseFormat !== "undefined",
      fallbacks: [
        "https://unpkg.com/dayjs@1.11.13/plugin/customParseFormat.js",
      ],
    },
    {
      name: "Day.js utc",
      test: () => typeof window.dayjs_plugin_utc !== "undefined",
      fallbacks: [
        "https://unpkg.com/dayjs@1.11.13/plugin/utc.js",
      ],
    },
    {
      name: "DOMPurify",
      test: () => typeof window.DOMPurify !== "undefined",
      fallbacks: [
        "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js",
        "https://unpkg.com/dompurify@3.1.6/dist/purify.min.js",
      ],
    },
  ];

  for (const dep of deps) {
    await ensureDependency(dep);
  }

  window.dayjs.extend(window.dayjs_plugin_customParseFormat);
  window.dayjs.extend(window.dayjs_plugin_utc);
}

function setupActions() {
  const fileInput = document.getElementById("fileInput");
  const runBtn = document.getElementById("runBtn");
  const printBtn = document.getElementById("printBtn");
  const testSizeSelect = document.getElementById("testSizeSelect");
  const storeSelect = document.getElementById("storeSelect");
  const categorySelect = document.getElementById("categorySelect");

  testSizeSelect.addEventListener("change", (event) => {
    state.split.testSize = Number(event.target.value);
  });

  storeSelect.addEventListener("change", async (event) => {
    state.filters.store = event.target.value;
    await rerunWithFilters("Filtro de loja aplicado.");
  });

  categorySelect.addEventListener("change", async (event) => {
    state.filters.category = event.target.value;
    await rerunWithFilters("Filtro de categoria aplicado.");
  });

  printBtn.addEventListener("click", () => {
    window.print();
  });

  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    state.rawFile = file || null;
    if (file) {
      showAlert("success", `Arquivo carregado: ${file.name}`);
    }
  });

  runBtn.addEventListener("click", async () => {
    if (!state.rawFile) {
      showAlert("error", "Selecione um arquivo CSV ou XLSX antes de executar.");
      return;
    }

    try {
      await runPipeline(state.rawFile);
      showAlert("success", "Analise concluida com sucesso.");
      switchTab("resultados");
    } catch (error) {
      showAlert("error", `Falha na execucao: ${error.message}`);
      console.error(error);
    }
  });
}

async function bootstrap() {
  try {
    await ensureDependencies();
  } catch (error) {
    showAlert("error", error.message);
    return;
  }

  setupTabs();
  setupActions();
  renderFilterOptions();
  renderSplitOptions();
  renderKpis();
  renderDataSummary();
  renderModelSummary();
  renderResultsTable();
  renderConclusion();
  renderRunStatus();
  renderReportMeta();
}

bootstrap();
