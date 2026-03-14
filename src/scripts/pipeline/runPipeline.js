import { parseFile } from "../data/parseFile.js";
import { buildMonthlySeries } from "../data/monthlySeries.js";
import { splitSeries } from "../data/splitSeries.js";
import { runModels } from "../models/runModels.js";
import { computeMetrics } from "../metrics/metrics.js";
import { renderAllCharts } from "../charts/mainChart.js";
import { state } from "../state.js";
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
} from "../ui/render.js";

export async function runPipeline(file) {
  const steps = [
    "Carregando arquivo",
    "Preparando serie mensal",
    "Executando split treino/teste",
    "Treinando modelos",
    "Calculando metricas",
    "Renderizando paineis",
  ];
  state.runProgress.steps = steps;
  state.runProgress.current = 0;
  renderRunStatus();

  const records = await parseFile(file);
  state.runProgress.current = 1;
  renderRunStatus();

  const { series, qualityReport, logs, filterOptions } = buildMonthlySeries(records, state.filters);
  const monthlySeries = series;

  state.runProgress.current = 2;
  renderRunStatus();

  const split = splitSeries(monthlySeries, state.split.testSize);

  state.runProgress.current = 3;
  renderRunStatus();

  const predictions = runModels(split.train, split.test);

  state.runProgress.current = 4;
  renderRunStatus();

  const { metrics, evaluation } = computeMetrics(split.test, predictions, split.train);

  state.records = records;
  state.filterOptions = filterOptions;
  state.qualityReport = qualityReport;
  state.logs = logs;
  state.monthlySeries = monthlySeries;
  state.split = split;
  state.predictions = predictions;
  state.metrics = metrics;
  state.evaluation = evaluation;
  state.datasetInfo = {
    fileName: file.name,
    startMonth: monthlySeries[0]?.month || "-",
    endMonth: monthlySeries[monthlySeries.length - 1]?.month || "-",
  };

  state.runProgress.current = 5;
  renderRunStatus();

  renderFilterOptions();
  renderKpis();
  renderSplitOptions();
  renderDataSummary();
  renderModelSummary();
  renderResultsTable();
  renderConclusion();
  renderReportMeta();
  renderAllCharts();
}
