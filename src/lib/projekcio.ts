/**
 * Projekcio Equal Earth, la sama kiel en scripts/generi-mapon.mjs (d3-geo).
 * Tiel urbo havas la samajn koordinatojn en la serva superkovro kaj en la
 * statika bazmapo. La skripto kontrolas, ke ambaŭ kongruas.
 */
import mapo from "../data/mapo.json";

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;

export function projekcii(lon: number, lat: number): [number, number] {
  const λ = (lon * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  const l = Math.asin(M * Math.sin(φ));
  const l2 = l * l;
  const l6 = l2 * l2 * l2;
  const x = (λ * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)));
  const y = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
  return [mapo.tx + mapo.skalo * x, mapo.ty - mapo.skalo * y];
}

export type ViewBox = [number, number, number, number];

export const MONDA_VIDO: ViewBox = [0, 0, mapo.largxo, mapo.alto];

export function landaVido(kodo: string): ViewBox | null {
  const l = (mapo.landoj as Record<string, { viewBox: number[] | null }>)[kodo];
  return l?.viewBox ? (l.viewBox as ViewBox) : null;
}

export function landaCentro(kodo: string): [number, number] | null {
  const l = (mapo.landoj as Record<string, { centro: number[] }>)[kodo];
  return l ? (l.centro as [number, number]) : null;
}
