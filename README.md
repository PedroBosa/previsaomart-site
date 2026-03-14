# PrevisaoMart (Estrutura Profissional)

Projeto estatico organizado em arquivos separados, com pipeline de previsao e painel executivo.

## Estrutura

- `index.html`: ponto de entrada da aplicacao.
- `dados/`: datasets e geradores.
- `docs/`: documentacao tecnica e material academico.
- `src/styles/main.css`: estilos globais e layout.
- `src/scripts/app.js`: bootstrap da aplicacao.
- `src/scripts/state.js`: estado global.
- `src/scripts/ui/`: comportamento de interface.
- `src/scripts/data/`: parsing e qualidade de dados.
- `src/scripts/models/`: modelos de previsao.
- `src/scripts/metrics/`: metricas de avaliacao.
- `src/scripts/charts/`: renderizacao de graficos.
- `src/scripts/pipeline/`: orquestracao do fluxo.
- `.github/workflows/ci.yml`: pipeline de CI para testes.

## Documentacao

1. Arquitetura tecnica: `docs/ARCHITECTURE.md`.
2. Mini anteprojeto (Topico 6): `docs/MINI_ANTEPROJETO_TOPICO6.md`.

## Como abrir

1. Abra `index.html` no navegador.
2. Faça upload de `CSV` ou `XLSX`.
3. Clique em `Executar analise`.

## Testes automatizados

1. No terminal, entre na pasta do projeto: `previsaomart-site`.
2. Execute testes unitarios: `npm test`.
3. Execute teste E2E de navegador: `npm run test:e2e`.
4. Execute tudo em sequencia: `npm run test:all`.
5. O projeto usa o runner nativo do Node (`node --test`) para validar dados, split temporal, modelos e metricas.
6. A suite inclui teste de regressao numerica com fixture deterministica para detectar drift em calculos.
7. O E2E usa Playwright para validar upload, execucao, filtros e exibicao de resultados no navegador.

## Funcionalidades implementadas

1. Upload de CSV/XLSX com parsing e normalizacao mensal.
2. Relatorio de qualidade com descarte, imputacao e outliers.
3. Split temporal configuravel com regra de treino minimo.
4. Tres modelos: baseline, regressao Fourier e Holt-Winters multiplicativo.
5. Metricas RMSE, MAE, MAPE e sMAPE com comparacao contra baseline.
6. Metricas robustas adicionais: WAPE e MASE para apoio em cenarios com zeros.
7. Cinco graficos com lifecycle seguro (`destroy` antes de recriar).
8. Conclusao executiva com veredito de hipotese.
9. Filtros por loja e categoria com reexecucao automatica da pipeline.
10. Exportacao de relatorio via impressao do navegador.
11. Metadados de relatorio com identificacao do Grupo: Topico 6.
12. Regra de robustez: MAPE e sMAPE sao exibidos como N/A quando o teste contem valores reais zero.

## Proximos passos recomendados

1. Incluir comparacao com modelo naive sazonal para benchmark adicional.
2. Incorporar variaveis exogenas (promocao, feriados, clima) para ganho preditivo.
3. Adicionar fixture fixa de regressao com tolerancia para monitorar drift de metricas ao evoluir algoritmos.
