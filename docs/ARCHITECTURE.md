# Arquitetura do Projeto

## Visao Geral
Aplicacao front-end estatica para previsao de demanda no varejo com pipeline de dados, modelagem e painel executivo.

## Modulos
- src/scripts/data: ingestao, normalizacao, qualidade e split temporal.
- src/scripts/models: baseline, regressao Fourier e Holt-Winters.
- src/scripts/metrics: metricas de avaliacao e regras de veredito.
- src/scripts/charts: renderizacao dos graficos com Chart.js.
- src/scripts/ui: tabs, alertas e renderizacao textual.
- src/scripts/pipeline: orquestracao end-to-end.

## Fluxo
1. Upload de arquivo CSV/XLSX.
2. Parsing e normalizacao temporal mensal.
3. Split treino/teste com regras minimas.
4. Execucao dos modelos.
5. Calculo de metricas e recomendacao executiva.
6. Renderizacao de tabelas, KPIs e graficos.

## Qualidade
- Testes unitarios para dados, modelos e metricas.
- Teste E2E Playwright para fluxo real no navegador.
- Regressao numerica com fixture deterministica para estabilidade dos calculos.
