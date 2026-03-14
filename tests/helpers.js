export function makeSeries(length, startYear = 2018, startMonth = 1, valueFn = (i) => i + 1) {
  const out = [];
  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < length; i += 1) {
    const mm = String(month).padStart(2, "0");
    out.push({ month: `${year}-${mm}`, value: valueFn(i) });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return out;
}

export function isFiniteArray(values) {
  return Array.isArray(values) && values.every((v) => Number.isFinite(v));
}
