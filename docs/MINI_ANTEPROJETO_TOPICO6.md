# MINI ANTEPROJETO DE PESQUISA EM TI

Equipe nº: 6
Tema Geral: Mineração de Dados (Data Mining) no Varejo
Integrantes: [preencher nomes da equipe]

## 1. Título Provisório da Pesquisa
Uso de modelos de previsão de demanda baseados em séries temporais para apoiar decisões de compras e reposição em uma rede varejista.

## 2. Problema de Pesquisa
Como reduzir rupturas de estoque e excesso de compras no varejo, utilizando dados históricos de vendas (10 anos), sem aumentar desnecessariamente o custo operacional?

## 3. Estratégia PICO
- P (Problema): Rede varejista com histórico extenso de vendas e ineficiência na previsão de demanda por loja/categoria.
- I (Intervenção em TI): Pipeline de ciência de dados com preparação mensal, filtros por loja/categoria e modelos de previsão (Baseline, Regressão com Fourier e Holt-Winters).
- C (Comparação): Método atual não estruturado (senso comum/estimativa manual) e baseline operacional simples.
- O (Métrica de Desfecho): Melhoria estatística nas métricas RMSE, MAE, MAPE e sMAPE, com indicação prática de melhor modelo para decisão de compras.

## 4. Hipótese Científica
Se aplicarmos um pipeline estruturado de mineração de dados com modelagem temporal e avaliação quantitativa, então será possível reduzir erro preditivo em relação ao baseline operacional e aumentar a confiabilidade da decisão de reposição.

- Variável Independente (manipulada): método de previsão utilizado (Baseline, Regressão Fourier, Holt-Winters).
- Variável Dependente (medida): erro de previsão da demanda mensal (RMSE, MAE, MAPE, sMAPE).

## 5. Justificativa
No varejo, decidir compra e reposição apenas por experiência subjetiva tende a gerar perdas por ruptura ou sobre-estoque. Com 10 anos de dados, existe oportunidade real de transformar histórico operacional em inteligência de negócio. A pesquisa é relevante por combinar impacto econômico (melhor alocação de capital em estoque), impacto operacional (menos falta de produto) e impacto tecnológico (uso disciplinado de métodos quantitativos em contexto real).

## 6. Objetivos
- Objetivo Geral:
Analisar e comparar modelos de previsão de demanda com base em dados históricos de vendas para apoiar decisões de compras no varejo.

- Objetivos Específicos:
1. Organizar e padronizar a base histórica de vendas em série temporal mensal, com controle de qualidade dos dados.
2. Implementar e avaliar, no mesmo conjunto de teste, três abordagens de previsão: baseline, regressão com Fourier e Holt-Winters.
3. Comparar o desempenho dos modelos por métricas estatísticas (RMSE, MAE, MAPE, sMAPE) e identificar o método mais adequado por segmento (loja/categoria).
4. Traduzir os resultados para recomendações gerenciais objetivas, em linguagem acessível a gestores não técnicos.

## 7. Metodologia Resumida
- Tipo de pesquisa: aplicada, com abordagem quantitativa, de caráter empírico e exploratório.
- Fonte de dados: histórico de vendas de 10 anos, com consolidação mensal.
- Etapas:
1. Ingestão e validação da base (datas, valores, consistência temporal).
2. Limpeza e agregação mensal por loja/categoria.
3. Separação treino/teste com janela temporal para evitar vazamento de informação.
4. Treinamento e inferência dos modelos.
5. Avaliação comparativa por métricas e análise crítica dos resultados.
6. Elaboração de relatório executivo e recomendações operacionais.
- Critério de decisão: escolher o modelo com melhor desempenho global, considerando também estabilidade e interpretabilidade para uso prático.

## 8. Resultados Esperados
1. Identificar um modelo com desempenho estatisticamente superior ao baseline operacional.
2. Produzir evidências quantitativas para apoiar política de compras mais precisa.
3. Entregar um painel web para simulação e comparação de cenários por loja/categoria.

## 9. Limitações e Cuidados Éticos
- Limitações: dados sintéticos/semisintéticos podem não representar todos os choques de mercado reais; sazonalidades extraordinárias exigem revisão periódica do modelo.
- Ética e conformidade: trabalhar com dados agregados, sem identificação pessoal, respeitando princípios da LGPD (minimização, finalidade e segurança da informação).

## 10. Referências Iniciais (formato ABNT)
- GIL, Antonio Carlos. Como elaborar projetos de pesquisa. 4. ed. São Paulo: Atlas, 2002.
- WAZLAWICK, Raul Sidnei. Metodologia de pesquisa para ciência da computação. Rio de Janeiro: Elsevier, 2009.
- HYNDMAN, Rob J.; ATHANASOPOULOS, George. Forecasting: principles and practice. 3. ed. Melbourne: OTexts, 2021.
- BOX, George E. P.; JENKINS, Gwilym M.; REINSEL, Gregory C.; LJUNG, Greta M. Time series analysis: forecasting and control. 5. ed. Hoboken: Wiley, 2015.

---

## Nota de Apresentação (tom humano para defesa oral)
Este projeto parte de uma dor real: o varejo perde dinheiro quando compra demais e também quando falta produto. Em vez de tratar os dados como um "arquivo antigo", a proposta é transformar esse histórico em decisões melhores e mais transparentes. A ideia central não é substituir o gestor, mas oferecer uma base objetiva para que a experiência de quem decide seja potencializada por evidências.
