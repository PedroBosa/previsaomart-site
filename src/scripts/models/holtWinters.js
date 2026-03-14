export function predictHoltWinters(train, test) {
  const alpha = 0.35;
  const beta = 0.08;
  const gamma = 0.3;
  const m = 12;
  const eps = 1e-6;

  if (train.length < 24) {
    const fallback = train.length
      ? train.reduce((acc, item) => acc + item.value, 0) / train.length
      : 0;
    return test.map(() => fallback);
  }

  const y = train.map((item) => Math.max(item.value, eps));
  const years = Math.floor(y.length / m);

  const level0 = y.slice(0, m).reduce((acc, v) => acc + v, 0) / m;
  let trend0 = 0;
  for (let k = 0; k < m; k += 1) {
    trend0 += (y[m + k] - y[k]) / m;
  }
  trend0 /= m;

  const seasonal = new Array(m).fill(1);
  for (let k = 0; k < m; k += 1) {
    let sum = 0;
    let count = 0;
    for (let year = 0; year < years; year += 1) {
      const start = year * m;
      const yearSlice = y.slice(start, start + m);
      if (yearSlice.length < m) continue;
      const yearAvg = yearSlice.reduce((acc, v) => acc + v, 0) / m;
      sum += y[start + k] / Math.max(yearAvg, eps);
      count += 1;
    }
    seasonal[k] = count ? sum / count : 1;
  }

  let level = level0;
  let trend = trend0;

  for (let t = 0; t < y.length; t += 1) {
    const idx = t % m;
    const s = Math.max(seasonal[idx], eps);
    const nextLevel = alpha * (y[t] / s) + (1 - alpha) * (level + trend);
    const nextTrend = beta * (nextLevel - level) + (1 - beta) * trend;
    const nextSeason = gamma * (y[t] / Math.max(nextLevel, eps)) + (1 - gamma) * seasonal[idx];

    level = nextLevel;
    trend = nextTrend;
    seasonal[idx] = nextSeason;
  }

  return test.map((_, h) => {
    const idx = (train.length + h) % m;
    return (level + (h + 1) * trend) * Math.max(seasonal[idx], eps);
  });
}
