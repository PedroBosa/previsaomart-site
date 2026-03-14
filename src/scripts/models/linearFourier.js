function monthIndex(monthStr) {
  const parts = monthStr.split("-");
  return Math.max(0, Math.min(11, Number(parts[1]) - 1));
}

function featureVector(i, denom, m) {
  const t = i / Math.max(denom, 1);
  return [
    1,
    t,
    Math.sin((2 * Math.PI * m) / 12),
    Math.cos((2 * Math.PI * m) / 12),
    Math.sin((4 * Math.PI * m) / 12),
    Math.cos((4 * Math.PI * m) / 12),
  ];
}

function solveGaussian(matrix, vector) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivotRow][col])) {
        pivotRow = row;
      }
    }

    [a[col], a[pivotRow]] = [a[pivotRow], a[col]];

    const pivot = a[col][col];
    if (Math.abs(pivot) < 1e-12) {
      return null;
    }

    for (let row = col + 1; row < n; row += 1) {
      const factor = a[row][col] / pivot;
      for (let k = col; k <= n; k += 1) {
        a[row][k] -= factor * a[col][k];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = a[row][n];
    for (let col = row + 1; col < n; col += 1) {
      sum -= a[row][col] * x[col];
    }
    x[row] = sum / a[row][row];
  }

  return x;
}

export function predictLinearFourier(train, test) {
  if (train.length < 2) return test.map(() => 0);

  const p = 6;
  const xtx = Array.from({ length: p }, () => new Array(p).fill(0));
  const xty = new Array(p).fill(0);
  const denom = Math.max(train.length - 1, 1);

  train.forEach((item, i) => {
    const m = monthIndex(item.month);
    const x = featureVector(i, denom, m);
    for (let r = 0; r < p; r += 1) {
      xty[r] += x[r] * item.value;
      for (let c = 0; c < p; c += 1) {
        xtx[r][c] += x[r] * x[c];
      }
    }
  });

  for (let i = 0; i < p; i += 1) {
    xtx[i][i] += 1e-6;
  }

  const beta = solveGaussian(xtx, xty);
  if (!beta) return test.map(() => 0);

  return test.map((item, idx) => {
    const m = monthIndex(item.month);
    const x = featureVector(train.length + idx, denom, m);
    return x.reduce((acc, value, j) => acc + value * beta[j], 0);
  });
}
