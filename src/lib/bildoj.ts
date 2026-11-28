/**
 * Kontrolo de profilbildoj, bajto post bajto. Vidu docs/profilbildoj.md.
 *
 * La retumilo konvertas la bildon al WebP (aŭ JPEG, se la retumilo ne povas
 * krei WebP, ekz. Safari). Ni tamen ne fidas al la kliento:
 * - nur WebP aŭ JPEG, rekonitaj laŭ la enhavo (ne laŭ la nomo aŭ la deklarita tipo);
 * - maksimume 64 KB, kvadrata, inter 64 kaj 512 bilderoj;
 * - sen metadatenoj (EXIF, XMP, IPTC), kiuj povus enhavi la GPS-lokon;
 * - sen animacio.
 */

export const MAKS_BAJTOJ = 65_536;
const MIN_FLANKO = 64;
const MAKS_FLANKO = 512;

export type BildaTipo = "image/webp" | "image/jpeg";

export type BildaKontrolo =
  | { bone: true; tipo: BildaTipo; largxo: number; alto: number }
  | { bone: false; kialo: string };

const ascii = (b: Uint8Array, de: number, longo: number) =>
  String.fromCharCode(...b.subarray(de, de + longo));
const u16le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const u24le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const u32le = (b: Uint8Array, i: number) => (u24le(b, i) | (b[i + 3] << 24)) >>> 0;
const u16be = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];

const MALPERMESITAJ_WEBP = new Set(["EXIF", "XMP ", "ANIM", "ANMF"]);

function webpDimensioj(b: Uint8Array): { largxo: number; alto: number } | string {
  if (b.length < 30 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return "ne-webp";
  if (u32le(b, 4) + 8 > b.length) return "trancxita";

  // Ĉiuj pecoj: neniu metadateno, neniu animacio.
  for (let i = 12; i + 8 <= b.length; ) {
    const nomo = ascii(b, i, 4);
    if (MALPERMESITAJ_WEBP.has(nomo)) return "metadatenoj";
    const grandeco = u32le(b, i + 4);
    i += 8 + grandeco + (grandeco & 1);
  }

  const unua = ascii(b, 12, 4);
  if (unua === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return "ne-webp";
    return { largxo: u16le(b, 26) & 0x3fff, alto: u16le(b, 28) & 0x3fff };
  }
  if (unua === "VP8L") {
    if (b[20] !== 0x2f) return "ne-webp";
    return {
      largxo: 1 + (((b[22] & 0x3f) << 8) | b[21]),
      alto: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
    };
  }
  if (unua === "VP8X") {
    const flagoj = b[20];
    if (flagoj & (0x02 | 0x04 | 0x08)) return "metadatenoj";
    return { largxo: u24le(b, 24) + 1, alto: u24le(b, 27) + 1 };
  }
  return "ne-webp";
}

function jpegDimensioj(b: Uint8Array): { largxo: number; alto: number } | string {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return "ne-jpeg";
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return "ne-jpeg";
    const marko = b[i + 1];
    if (marko === 0xd8 || (marko >= 0xd0 && marko <= 0xd7) || marko === 0x01) {
      i += 2;
      continue;
    }
    const longo = u16be(b, i + 2);
    // APP1 (EXIF, XMP) kaj APP13 (IPTC) estas malpermesitaj. APP2 estas permesita nur por
    // kolorprofilo (ICC), kiun la retumiloj aldonas; ne por MPF/FlashPix, kiuj povas enhavi
    // tutajn bildojn kun siaj propraj metadatenoj.
    if (marko === 0xe1 || marko === 0xed) return "metadatenoj";
    if (marko === 0xe2 && ascii(b, i + 4, 12) !== "ICC_PROFILE\0") return "metadatenoj";
    const estasSof =
      marko >= 0xc0 && marko <= 0xcf && marko !== 0xc4 && marko !== 0xc8 && marko !== 0xcc;
    if (estasSof) return { alto: u16be(b, i + 5), largxo: u16be(b, i + 7) };
    if (marko === 0xda) return "ne-jpeg";
    i += 2 + longo;
  }
  return "ne-jpeg";
}

export function kontroliBildon(bajtoj: Uint8Array): BildaKontrolo {
  if (bajtoj.length === 0) return { bone: false, kialo: "malplena" };
  if (bajtoj.length > MAKS_BAJTOJ) return { bone: false, kialo: "tro-granda" };

  let tipo: BildaTipo;
  let dimensioj: { largxo: number; alto: number } | string;
  if (ascii(bajtoj, 0, 4) === "RIFF") {
    tipo = "image/webp";
    dimensioj = webpDimensioj(bajtoj);
  } else if (bajtoj[0] === 0xff && bajtoj[1] === 0xd8) {
    tipo = "image/jpeg";
    dimensioj = jpegDimensioj(bajtoj);
  } else {
    return { bone: false, kialo: "nekonata-formato" };
  }

  if (typeof dimensioj === "string") return { bone: false, kialo: dimensioj };
  const { largxo, alto } = dimensioj;
  if (largxo !== alto) return { bone: false, kialo: "ne-kvadrata" };
  if (largxo < MIN_FLANKO || largxo > MAKS_FLANKO)
    return { bone: false, kialo: "malgxusta-grandeco" };
  return { bone: true, tipo, largxo, alto };
}
