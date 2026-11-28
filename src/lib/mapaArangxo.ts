/**
 * Disigas vezikojn, kiuj kovras unu la alian (ekz. la landoj de Eŭropo en la
 * monda mapo), por ke ĉiu estu aparte alklakebla (WCAG 2.5.8: celoj de almenaŭ
 * 24 bilderoj kun sufiĉa spaco). Simpla puŝado: ĉiu paro tro proksima foriĝas
 * unu de la alia, ĝis neniu kovras alian.
 */

import type { ViewBox } from "./projekcio";

/** Larĝoj de la mapo por kiuj ni kalkulas la aranĝon: labortablo kaj poŝtelefono. */
export const LARGXO_LABORTABLO = 640;
export const LARGXO_POSXTELEFONO = 340;
const SPACO = 3;

export interface DisigeblaVeziko {
  x: number;
  y: number;
  /** Radiuso en bilderoj. */
  r: number;
}

export function disigiVezikojn(
  vezikoj: DisigeblaVeziko[],
  vido: ViewBox,
  largxo = LARGXO_LABORTABLO,
  iteracioj = 120,
): void {
  if (vezikoj.length < 2) return;
  // De unuoj de la viewBox al bilderoj de la referenca larĝo.
  const k = largxo / vido[2];
  const p = vezikoj.map((v) => ({
    x: (v.x - vido[0]) * k,
    y: (v.y - vido[1]) * k,
    r: v.r,
    movita: false,
  }));
  for (let it = 0; it < iteracioj; it++) {
    let movis = false;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const a = p[i];
        const b = p[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + SPACO;
        if (d >= min) continue;
        if (d < 0.01) {
          // Samloke: eta, determinisma direkto.
          dx = Math.cos(i + j);
          dy = Math.sin(i + j);
          d = 1;
        }
        const pusxo = (min - d) / 2 + 0.01;
        a.x -= (dx / d) * pusxo;
        a.y -= (dy / d) * pusxo;
        b.x += (dx / d) * pusxo;
        b.y += (dy / d) * pusxo;
        a.movita = true;
        b.movita = true;
        movis = true;
      }
    }
    if (!movis) break;
  }
  const alto = vido[3] * k;
  for (let i = 0; i < p.length; i++) {
    const q = p[i];
    if (!q.movita) continue;
    // Restu ene de la mapo.
    q.x = Math.min(Math.max(q.x, q.r), largxo - q.r);
    q.y = Math.min(Math.max(q.y, q.r), alto - q.r);
    vezikoj[i].x = q.x / k + vido[0];
    vezikoj[i].y = q.y / k + vido[1];
  }
}
