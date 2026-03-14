import { predictBaseline } from "./baseline.js";
import { predictLinearFourier } from "./linearFourier.js";
import { predictHoltWinters } from "./holtWinters.js";

export function runModels(train, test) {
  return {
    baseline: predictBaseline(train, test),
    linear: predictLinearFourier(train, test),
    holtWinters: predictHoltWinters(train, test),
  };
}
