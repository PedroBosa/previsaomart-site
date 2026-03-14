export const state = {
  rawFile: null,
  filters: {
    store: "",
    category: "",
  },
  filterOptions: {
    stores: [],
    categories: [],
  },
  datasetInfo: null,
  runProgress: {
    steps: [],
    current: -1,
  },
  records: [],
  qualityReport: null,
  logs: [],
  monthlySeries: [],
  split: {
    testSize: 24,
    enabledOptions: [12, 18, 24, 36],
    train: [],
    test: [],
  },
  predictions: {
    baseline: [],
    linear: [],
    holtWinters: [],
  },
  metrics: null,
  evaluation: null,
  charts: {},
};
