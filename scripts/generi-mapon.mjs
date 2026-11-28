#!/usr/bin/env node
/**
 * Generas la bazajn mapojn el Natural Earth (publika havaĵo), per world-atlas.
 * Vidu docs/adr/0007-propra-mapo.md.
 *
 * Eligo:
 * - public/mapo/mondo.svg: la tuta mondo (1:110m), por la hejmpaĝo.
 * - public/mapo/<KODO>.svg: unu lando kaj ĝiaj najbaroj (1:50m), zomita al la lando.
 * - src/data/mapo.json: la viewBox de ĉiu mapo kaj la centro de ĉiu lando,
 *   por ke la servilo metu la vezikojn sur la samajn koordinatojn.
 *
 * Ĉiuj mapoj uzas la saman projekcion (Equal Earth, kiu ne grandigas la nordon),
 * do punkto havas la samajn koordinatojn en ĉiu mapo. La servilo projekcias la
 * urbojn per src/lib/projekcio.ts, kiu devas doni la samajn rezultojn kiel d3-geo:
 * ĉi tiu skripto kontrolas tion.
 *
 * La SVG-oj ne estas en git: `npm run build` regeneras ilin.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoArea, geoCentroid, geoEqualEarth, geoPath } from "d3-geo";
import landoj from "i18n-iso-countries";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const radiko = join(dirname(fileURLToPath(import.meta.url)), "..");
const LARGXO = 960;

/** Landoj sen numera ISO-kodo en Natural Earth. */
const LAUX_NOMO = { Kosovo: "XK" };

function legi(nomo) {
  const topo = JSON.parse(readFileSync(require.resolve(`world-atlas/${nomo}`), "utf8"));
  return feature(topo, topo.objects.countries).features.flatMap((f) => {
    const kodo = f.id ? landoj.numericToAlpha2(f.id) : LAUX_NOMO[f.properties.name];
    return kodo ? [{ ...f, kodo }] : [];
  });
}

const mondo110 = legi("countries-110m.json");
const mondo50 = legi("countries-50m.json");

const projekcio = geoEqualEarth().fitWidth(LARGXO, { type: "Sphere" });
const ALTO = Math.ceil(geoPath(projekcio).bounds({ type: "Sphere" })[1][1]);
const skalo = projekcio.scale();
const [tx, ty] = projekcio.translate();

// Kontrolo: nia propra projekcio (src/lib/projekcio.ts) devas kongrui kun d3.
{
  const A1 = 1.340264,
    A2 = -0.081106,
    A3 = 0.000893,
    A4 = 0.003796,
    M = Math.sqrt(3) / 2;
  const nia = (lon, lat) => {
    const λ = (lon * Math.PI) / 180,
      φ = (lat * Math.PI) / 180;
    const l = Math.asin(M * Math.sin(φ)),
      l2 = l * l,
      l6 = l2 * l2 * l2;
    const x = (λ * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)));
    const y = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
    return [tx + skalo * x, ty - skalo * y];
  };
  for (const [lon, lat] of [
    [-99.13, 19.43],
    [139.69, 35.69],
    [-58.38, -34.6],
    [18.07, 59.33],
  ]) {
    const [a, b] = projekcio([lon, lat]);
    const [c, d] = nia(lon, lat);
    if (Math.abs(a - c) > 1e-6 || Math.abs(b - d) > 1e-6)
      throw new Error("La projekcio ne kongruas kun d3");
  }
}

const vojo = (cifereco) => geoPath(projekcio).digits(cifereco);
const svg = (viewBox, korpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.map((v) => +v.toFixed(2)).join(" ")}">` +
  "<style>path{fill:#dfe8e1;stroke:#fff;stroke-width:var(--s,.5);stroke-linejoin:round}" +
  ".cxefa{fill:#c3d8c8}</style>" +
  `${korpo}</svg>`;

/** La ĉefaj partoj de lando: la plej granda poligono kaj ĉiuj almenaŭ 20% de ĝia areo. */
function cxefajPartoj(f) {
  if (f.geometry.type !== "MultiPolygon") return f.geometry;
  const poligonoj = f.geometry.coordinates.map((c) => ({ type: "Polygon", coordinates: c }));
  const plej = Math.max(...poligonoj.map((p) => geoArea(p)));
  return {
    type: "MultiPolygon",
    coordinates: poligonoj.filter((p) => geoArea(p) >= plej * 0.2).map((p) => p.coordinates),
  };
}

const eligo = join(radiko, "public", "mapo");
mkdirSync(eligo, { recursive: true });

// La mondo
writeFileSync(
  join(eligo, "mondo.svg"),
  svg([0, 0, LARGXO, ALTO], mondo110.map((f) => `<path d="${vojo(1)(f)}"/>`).join("")),
);

// Ĉiu lando
const indekso = { largxo: LARGXO, alto: ALTO, skalo, tx, ty, landoj: {} };
for (const f of mondo50) {
  const cxefa = cxefajPartoj(f);
  let [[x0, y0], [x1, y1]] = geoPath(projekcio).bounds(cxefa);
  if (x1 - x0 > LARGXO * 0.7) {
    // La lando transiras la 180-an meridianon (Rusio, Fiĝio…): ni ignoras la malgrandan
    // parton ĉe la alia rando de la mapo.
    const punktoj = cxefa.coordinates
      .flat(cxefa.type === "Polygon" ? 1 : 2)
      .filter(([lon]) => lon > -150)
      .map((p) => projekcio(p));
    [x0, x1] = [Math.min(...punktoj.map((p) => p[0])), Math.max(...punktoj.map((p) => p[0]))];
    [y0, y1] = [Math.min(...punktoj.map((p) => p[1])), Math.max(...punktoj.map((p) => p[1]))];
  }
  const centro = projekcio(geoCentroid(cxefa)) ?? [(x0 + x1) / 2, (y0 + y1) / 2];
  // Iom da marĝeno, kaj minimuma grandeco por etaj landoj.
  const flanko = Math.max(x1 - x0, y1 - y0, 12);
  const margxeno = flanko * 0.12;
  const cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2;
  const w = Math.max(x1 - x0, flanko * 0.6) + 2 * margxeno;
  const h = Math.max(y1 - y0, flanko * 0.6) + 2 * margxeno;
  const viewBox = [cx - w / 2, cy - h / 2, w, h];

  // Por grandaj landoj (Rusio, Kanado…) la mapo 1:110m sufiĉas kaj estas multe pli malpeza.
  const fonto = w > 250 ? mondo110 : mondo50;
  const fCxi = fonto.find((g) => g.kodo === f.kodo) ?? f;
  // Najbaroj: landoj kies limoj tuŝas la vidon.
  const enVido = fonto.filter((g) => {
    if (g.kodo === f.kodo) return false;
    const [[a, b], [c, d]] = geoPath(projekcio).bounds(g);
    return a < viewBox[0] + w && c > viewBox[0] && b < viewBox[1] + h && d > viewBox[1];
  });
  const streko = +(w / 900).toFixed(3);
  // Tondi al la vido: el najbaro oni desegnas nur la videblan parton.
  const tondita = geoEqualEarth()
    .scale(skalo)
    .translate([tx, ty])
    .clipExtent([
      [viewBox[0] - w * 0.02, viewBox[1] - h * 0.02],
      [viewBox[0] + w * 1.02, viewBox[1] + h * 1.02],
    ]);
  // Precizeco laŭ la zomo: ĉ. 0,1 bildero en la fina bildo.
  const cifereco = Math.max(1, Math.min(3, Math.ceil(-Math.log10(w / 9000))));
  const tVojo = geoPath(tondita).digits(cifereco);
  const korpo = `${enVido
    .map((g) => tVojo(g))
    .filter(Boolean)
    .map((d) => `<path d="${d}"/>`)
    .join("")}<path class="cxefa" d="${tVojo(fCxi)}"/>`;
  writeFileSync(
    join(eligo, `${f.kodo}.svg`),
    svg(viewBox, korpo).replace("var(--s,.5)", String(streko)),
  );
  indekso.landoj[f.kodo] = {
    viewBox: viewBox.map((v) => +v.toFixed(2)),
    centro: centro.map((v) => +v.toFixed(2)),
  };
}

// Landoj nur en la 110m-mapo (ne okazas nun, sed por sekureco).
for (const f of mondo110) {
  if (indekso.landoj[f.kodo]) continue;
  const c = projekcio(geoCentroid(f));
  if (c) indekso.landoj[f.kodo] = { viewBox: null, centro: c.map((v) => +v.toFixed(2)) };
}

mkdirSync(join(radiko, "src", "data"), { recursive: true });
writeFileSync(join(radiko, "src", "data", "mapo.json"), `${JSON.stringify(indekso)}\n`);
console.log(`Mapoj: mondo + ${mondo50.length} landoj; alto ${ALTO}.`);
