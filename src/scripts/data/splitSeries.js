export function splitSeries(monthlySeries, testSize) {
  const allowed = [12, 18, 24, 36];
  const minTrain = 24;
  const enabledOptions = allowed.filter((size) => monthlySeries.length - size >= minTrain);

  if (monthlySeries.length < 36) {
    throw new Error("Serie insuficiente. Sao necessarios ao menos 36 meses validos.");
  }

  const fallbackSize = enabledOptions.includes(24) ? 24 : enabledOptions[0];
  const requested = Number(testSize) || fallbackSize;
  const size = enabledOptions.includes(requested) ? requested : fallbackSize;
  const trainSize = Math.max(monthlySeries.length - size, 0);

  return {
    testSize: size,
    enabledOptions,
    train: monthlySeries.slice(0, trainSize),
    test: monthlySeries.slice(trainSize),
  };
}
