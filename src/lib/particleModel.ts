/**
 * A one-dimensional diffusion model, independent of the literature dataset.
 * The model assumes an infinite domain with constant diffusivity: no flow,
 * walls, particle interactions, or aggregation. Channel width is a comparison
 * length only; it does not impose a boundary condition. Zeta potential (ζ) is
 * used only to label observations and does not enter the diffusion coefficient.
 */

export type ZetaGroup = "negative" | "near-neutral" | "positive";

export interface ProfilePoint {
  /** Position relative to the initial Gaussian center, in µm. */
  x: number;
  /** Concentration divided by the fixed initial centerline concentration. */
  concentration: number;
}

export interface CenterlinePoint {
  /** Elapsed time in seconds. */
  time: number;
  /** Concentration at x = 0 divided by its initial value. */
  concentration: number;
}

function requireFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

function requirePositive(value: number, name: string): void {
  requireFinite(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be positive.`);
  }
}

function requireNonnegative(value: number, name: string): void {
  requireFinite(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be nonnegative.`);
  }
}

function requireSamples(samples: number): void {
  if (!Number.isInteger(samples) || samples < 2) {
    throw new RangeError("samples must be an integer of at least 2.");
  }
}

/** ±10 mV are illustrative grouping cutoffs, not stability thresholds. */
export function classifyZeta(zetaMv: number): ZetaGroup {
  requireFinite(zetaMv, "zetaMv");
  if (zetaMv < -10) return "negative";
  if (zetaMv > 10) return "positive";
  return "near-neutral";
}

/**
 * Stokes–Einstein diffusion of an isolated sphere: D = kBT / (3πηd).
 * diameterNm is the hydrodynamic diameter in nm; viscosityMpaS is dynamic
 * viscosity in mPa·s, and temperatureK is absolute temperature in kelvin.
 * Convert nm → m and mPa·s → Pa·s, then m²/s → µm²/s for the returned value.
 */
export function diffusionCoefficient(
  diameterNm: number,
  viscosityMpaS: number,
  temperatureK = 298.15,
): number {
  requirePositive(diameterNm, "diameterNm");
  requirePositive(viscosityMpaS, "viscosityMpaS");
  requirePositive(temperatureK, "temperatureK");

  const boltzmannJK = 1.380649e-23;
  const diameterM = diameterNm * 1e-9;
  const viscosityPaS = viscosityMpaS * 1e-3;
  const diffusionM2S =
    (boltzmannJK * temperatureK) / (3 * Math.PI * viscosityPaS * diameterM);
  return diffusionM2S * 1e12;
}

/**
 * Time in seconds for the one-dimensional RMS displacement sqrt(2Dt) to
 * reach halfWidthUm: t = L² / (2D). This is a diffusion timescale comparison,
 * not a confined-channel mixing time or a first-passage calculation.
 */
export function transverseDiffusionTime(
  halfWidthUm: number,
  D: number,
): number {
  requirePositive(halfWidthUm, "halfWidthUm");
  requirePositive(D, "D");
  return halfWidthUm ** 2 / (2 * D);
}

/**
 * Infinite-domain diffusion of an initially finite-width, unit-mass Gaussian:
 * sigma² = sigma0² + 2Dt, C(x,t) = exp(-x² / (2sigma²)) / sqrt(2πsigma²).
 * Return C(x,t) / C(0,0), so every time uses the same initial peak reference;
 * later profiles are not renormalized to their own peaks. Position and sigma
 * are in µm, time is in seconds, and D is in µm²/s. At x = 0 this gives the
 * centerline concentration. The normalized profile itself is not unit-mass.
 */
export function gaussianConcentration(
  positionUm: number,
  timeSeconds: number,
  D: number,
  initialSigmaUm = 12,
): number {
  requireFinite(positionUm, "positionUm");
  requireNonnegative(timeSeconds, "timeSeconds");
  requirePositive(D, "D");
  requirePositive(initialSigmaUm, "initialSigmaUm");

  const varianceUm2 = initialSigmaUm ** 2 + 2 * D * timeSeconds;
  const sigmaUm = Math.sqrt(varianceUm2);
  return (
    (initialSigmaUm / sigmaUm) *
    Math.exp(-(positionUm ** 2) / (2 * varianceUm2))
  );
}

/** Sample the infinite-domain profile over a centered channel-width window. */
export function profilePoints(
  widthUm: number,
  timeSeconds: number,
  D: number,
  initialSigmaUm = 12,
  samples = 101,
): ProfilePoint[] {
  requirePositive(widthUm, "widthUm");
  requireNonnegative(timeSeconds, "timeSeconds");
  requirePositive(D, "D");
  requirePositive(initialSigmaUm, "initialSigmaUm");
  requireSamples(samples);

  return Array.from({ length: samples }, (_, index) => {
    const x = widthUm * (index / (samples - 1) - 0.5);
    return {
      x,
      concentration: gaussianConcentration(x, timeSeconds, D, initialSigmaUm),
    };
  });
}

/** Sample concentration at x = 0 from t = 0 through maxTimeSeconds. */
export function centerlinePoints(
  maxTimeSeconds: number,
  D: number,
  initialSigmaUm = 12,
  samples = 101,
): CenterlinePoint[] {
  requireNonnegative(maxTimeSeconds, "maxTimeSeconds");
  requirePositive(D, "D");
  requirePositive(initialSigmaUm, "initialSigmaUm");
  requireSamples(samples);

  return Array.from({ length: samples }, (_, index) => {
    const time = maxTimeSeconds * (index / (samples - 1));
    return {
      time,
      concentration: gaussianConcentration(0, time, D, initialSigmaUm),
    };
  });
}
