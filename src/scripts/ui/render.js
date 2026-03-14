import { state } from "../state.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function brl(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function number(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function percent(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return `${number(value, digits)}%`;
}

function badgeClass(text) {
  if (text === "Confirmada" || text === "Forte" || text === "Moderado") return "good";
  if (text === "N/A" || text === "Inconclusiva") return "neutral";
  return "bad";
}

export function renderSplitOptions() {
  const select = document.getElementById("testSizeSelect");
  if (!select) return;

  const enabled = new Set(state.split.enabledOptions || [12, 18, 24, 36]);
  Array.from(select.options).forEach((option) => {
    const value = Number(option.value);
    option.disabled = !enabled.has(value);
  });

  select.value = String(state.split.testSize);
}

export function renderFilterOptions() {
  const storeSelect = document.getElementById("storeSelect");
  const categorySelect = document.getElementById("categorySelect");
  if (!storeSelect || !categorySelect) return;

  const { stores, categories } = state.filterOptions;

  storeSelect.innerHTML = "";
  categorySelect.innerHTML = "";

  const defaultStore = document.createElement("option");
  defaultStore.value = "";
  defaultStore.textContent = "Todas";
  storeSelect.appendChild(defaultStore);

  stores.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    storeSelect.appendChild(option);
  });

  const defaultCategory = document.createElement("option");
  defaultCategory.value = "";
  defaultCategory.textContent = "Todas";
  categorySelect.appendChild(defaultCategory);

  categories.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    categorySelect.appendChild(option);
  });

  storeSelect.value = state.filters.store;
  categorySelect.value = state.filters.category;
}

export function renderKpis() {
  const kpis = document.getElementById("kpis");
  const trainLen = state.split.train.length;
  const testLen = state.split.test.length;
  const total = state.monthlySeries.length;

  const cards = [
    { label: "Total meses", value: total },
    { label: "Treino", value: trainLen },
    { label: "Teste", value: testLen },
    {
      label: "Media mensal",
      value:
        total > 0
          ? brl(
              state.monthlySeries.reduce((acc, item) => acc + item.value, 0) / total,
            )
          : "-",
    },
    {
      label: "Periodo",
      value:
        total > 0
          ? `${state.monthlySeries[0].month} a ${state.monthlySeries[total - 1].month}`
          : "-",
    },
  ];

  kpis.innerHTML = cards
    .map(
      (card) => `<div class="card"><strong>${card.label}</strong><div>${card.value}</div></div>`,
    )
    .join("");
}

export function renderRunStatus() {
  const el = document.getElementById("runStatus");
  if (!el) return;

  const steps = state.runProgress.steps || [];
  const current = state.runProgress.current;
  if (steps.length === 0) {
    el.innerHTML = '<p class="muted">Execucao aguardando inicio.</p>';
    return;
  }

  const pct = Math.round(((current + 1) / steps.length) * 100);
  el.innerHTML = `
    <div class="card">
      <strong>Status da execucao</strong>
      <div class="progress"><span style="width:${pct}%;"></span></div>
      <ul class="status-list">
        ${steps
          .map((step, idx) => `<li class="${idx <= current ? "done" : ""}">${step}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

export function renderReportMeta() {
  const el = document.getElementById("reportMeta");
  if (!el) return;

  if (!state.datasetInfo) {
    el.innerHTML = '<p class="muted">Metadados do relatorio serao exibidos apos a execucao.</p>';
    return;
  }

  const d = state.datasetInfo;
  el.innerHTML = `
    <div class="card">
      <strong>Metadados do relatorio</strong>
      <p class="muted">Arquivo: ${escapeHtml(d.fileName)}</p>
      <p class="muted">Periodo: ${d.startMonth} a ${d.endMonth}</p>
      <p class="muted">Grupo: Topico 6</p>
      <p class="muted">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
    </div>
  `;
}

export function renderDataSummary() {
  const el = document.getElementById("dataSummary");
  const q = state.qualityReport;
  if (!q) {
    el.innerHTML = '<p class="muted">Carregue e execute um arquivo para ver o resumo de qualidade.</p>';
    return;
  }

  el.innerHTML = `
    <section class="section cards-3">
      <div class="card"><strong>Linhas de entrada</strong><div>${q.totalRows}</div></div>
      <div class="card"><strong>Linhas validas</strong><div>${q.validRows}</div></div>
      <div class="card"><strong>Score de qualidade</strong><div>${number(q.score, 0)}/100</div></div>
    </section>
    <section class="section">
      <div class="card">
        <strong>Filtros aplicados</strong>
        <p class="muted">Loja: ${escapeHtml(state.filters.store || "Todas")} | Categoria: ${escapeHtml(state.filters.category || "Todas")}</p>
      </div>
    </section>
    <section class="section">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th class="numeric">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Taxa de descarte</td><td class="numeric">${number(q.discardRate, 1)}%</td></tr>
            <tr><td>Meses faltantes imputados</td><td class="numeric">${q.imputedMonths}</td></tr>
            <tr><td>Outliers extremos</td><td class="numeric">${q.outliers}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderModelSummary() {
  const el = document.getElementById("modelSummary");
  el.innerHTML = `
    <section class="cards-3">
      <div class="card"><strong>Baseline Gerencial</strong><p class="muted">Media dos ultimos 12 meses de treino.</p></div>
      <div class="card"><strong>Regressao + Fourier</strong><p class="muted">Tendencia e sazonalidade harmonica com Gauss pivotado.</p></div>
      <div class="card"><strong>Holt-Winters Multiplicativo</strong><p class="muted">Nivel, tendencia e sazonalidade com alpha/beta/gamma fixos.</p></div>
    </section>
  `;
}

export function renderResultsTable() {
  const el = document.getElementById("resultsTable");
  const metrics = state.metrics;
  const evalInfo = state.evaluation;
  if (!metrics || !evalInfo) {
    el.innerHTML = '<p class="muted">Execute a analise para gerar a comparacao dos modelos.</p>';
    return;
  }

  const rows = [
    ["Gerente", metrics.baseline, "-", "Referencia"],
    ["Regressao Fourier", metrics.linear, evalInfo.linearImprovementLabel, evalInfo.linearStatus],
    ["Holt-Winters", metrics.holtWinters, evalInfo.hwImprovementLabel, evalInfo.hwStatus],
  ];

  el.innerHTML = `
    <section class="section table-wrap">
      <table>
        <thead>
          <tr>
            <th>Modelo</th>
            <th class="numeric">RMSE</th>
            <th class="numeric">MAE</th>
            <th class="numeric">MAPE</th>
            <th class="numeric">sMAPE</th>
            <th class="numeric">WAPE</th>
            <th class="numeric">MASE</th>
            <th class="numeric">Melhoria</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              ([name, item, improvement, status]) => `
              <tr>
                <td>${name}</td>
                <td class="numeric">${brl(item.rmse)}</td>
                <td class="numeric">${brl(item.mae)}</td>
                <td class="numeric">${percent(item.mape)}</td>
                <td class="numeric">${percent(item.smape)}</td>
                <td class="numeric">${percent(item.wape)}</td>
                <td class="numeric">${number(item.mase, 3)}</td>
                <td class="numeric">${improvement}</td>
                <td><span class="badge ${badgeClass(status)}">${status}</span></td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
    ${evalInfo.notes ? `<p class="muted">${evalInfo.notes}</p>` : ""}
  `;
}

export function renderConclusion() {
  const el = document.getElementById("conclusion");
  const evalInfo = state.evaluation;
  if (!evalInfo) {
    el.innerHTML = '<p class="muted">Conclusao sera exibida apos a execucao.</p>';
    return;
  }

  el.innerHTML = `
    <section class="cards-3">
      <div class="card"><strong>Veredito</strong><div><span class="badge ${badgeClass(evalInfo.verdict)}">${evalInfo.verdict}</span></div></div>
      <div class="card"><strong>Melhoria Holt-Winters</strong><div>${evalInfo.hwImprovementLabel}</div></div>
      <div class="card"><strong>Classificacao</strong><div>${evalInfo.hwStatus}</div></div>
    </section>
    <section class="section">
      <div class="card">
        <strong>Recomendacao executiva</strong>
        <p class="muted">${evalInfo.recommendation}</p>
      </div>
    </section>
  `;
}
