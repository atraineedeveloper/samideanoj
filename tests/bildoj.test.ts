import { describe, expect, it } from "vitest";
import { kontroliBildon, MAKS_BAJTOJ } from "../src/lib/bildoj";

// ── Konstruiloj de minimumaj, sed strukture validaj, kapoj ─────────────────

const le32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];
const bajtoj = (s: string) => [...s].map((c) => c.charCodeAt(0));

function riff(pecoj: number[][]): Uint8Array {
  const korpo = pecoj.flat();
  return Uint8Array.from([
    ...bajtoj("RIFF"),
    ...le32(korpo.length + 4),
    ...bajtoj("WEBP"),
    ...korpo,
  ]);
}

function peco(nomo: string, enhavo: number[]): number[] {
  return [...bajtoj(nomo), ...le32(enhavo.length), ...enhavo, ...(enhavo.length & 1 ? [0] : [])];
}

function vp8(largxo: number, alto: number): number[] {
  return peco("VP8 ", [
    0x10,
    0x02,
    0x00,
    0x9d,
    0x01,
    0x2a,
    largxo & 0xff,
    (largxo >> 8) & 0x3f,
    alto & 0xff,
    (alto >> 8) & 0x3f,
    ...new Array(20).fill(0),
  ]);
}

function vp8l(largxo: number, alto: number): number[] {
  const w = largxo - 1;
  const h = alto - 1;
  return peco("VP8L", [
    0x2f,
    w & 0xff,
    ((w >> 8) & 0x3f) | ((h & 0x03) << 6),
    (h >> 2) & 0xff,
    (h >> 10) & 0x0f,
    ...new Array(10).fill(0),
  ]);
}

function vp8x(flagoj: number, largxo: number, alto: number): number[] {
  const w = largxo - 1;
  const h = alto - 1;
  return peco("VP8X", [
    flagoj,
    0,
    0,
    0,
    w & 0xff,
    (w >> 8) & 0xff,
    w >> 16,
    h & 0xff,
    (h >> 8) & 0xff,
    h >> 16,
  ]);
}

function jpeg(largxo: number, alto: number, aldonajSegmentoj: number[][] = []): Uint8Array {
  const app0 = [0xff, 0xe0, 0x00, 0x10, ...bajtoj("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];
  const sof0 = [
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    alto >> 8,
    alto & 0xff,
    largxo >> 8,
    largxo & 0xff,
    3,
    ...new Array(9).fill(1),
  ];
  return Uint8Array.from([
    0xff,
    0xd8,
    ...app0,
    ...aldonajSegmentoj.flat(),
    ...sof0,
    0xff,
    0xda,
    0,
    2,
    0xff,
    0xd9,
  ]);
}

const segmento = (marko: number, enhavo: number[]) => [
  0xff,
  marko,
  (enhavo.length + 2) >> 8,
  (enhavo.length + 2) & 0xff,
  ...enhavo,
];

// ── Testoj ───────────────────────────────────────────────────────────────

describe("kontroliBildon: akceptataj bildoj", () => {
  it.each([
    ["WebP perda (VP8)", riff([vp8(256, 256)])],
    ["WebP senperda (VP8L)", riff([vp8l(256, 256)])],
    ["WebP etendita kun travidebleco (VP8X)", riff([vp8x(0x10, 256, 256), vp8(256, 256)])],
  ])("%s", (_nomo, b) => {
    expect(kontroliBildon(b)).toEqual({ bone: true, tipo: "image/webp", largxo: 256, alto: 256 });
  });

  it("JPEG kun kolorprofilo (ICC), kiel la retumiloj kreas ĝin", () => {
    const icc = segmento(0xe2, [...bajtoj("ICC_PROFILE"), 0, 1, 1, ...new Array(20).fill(0)]);
    expect(kontroliBildon(jpeg(256, 256, [icc]))).toMatchObject({ bone: true, tipo: "image/jpeg" });
  });

  it("JPEG kun nur JFIF", () => {
    expect(kontroliBildon(jpeg(256, 256))).toEqual({
      bone: true,
      tipo: "image/jpeg",
      largxo: 256,
      alto: 256,
    });
  });
});

describe("kontroliBildon: malakceptataj bildoj", () => {
  it.each<[string, Uint8Array, string]>([
    ["malplena", new Uint8Array(), "malplena"],
    ["tro granda", new Uint8Array(MAKS_BAJTOJ + 1), "tro-granda"],
    ["PNG", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "nekonata-formato"],
    ["GIF", Uint8Array.from(bajtoj("GIF89a")), "nekonata-formato"],
    [
      "SVG (povas enhavi skriptojn)",
      Uint8Array.from(bajtoj("<svg onload=alert(1)>")),
      "nekonata-formato",
    ],
    ["HTML kaŝita kiel bildo", Uint8Array.from(bajtoj("<html><script>")), "nekonata-formato"],
    ["ne kvadrata", riff([vp8(256, 200)]), "ne-kvadrata"],
    ["tro malgranda", riff([vp8(32, 32)]), "malgxusta-grandeco"],
    ["tro granda laŭ dimensioj", riff([vp8l(1024, 1024)]), "malgxusta-grandeco"],
    ["WebP kun EXIF-flago", riff([vp8x(0x08, 256, 256), vp8(256, 256)]), "metadatenoj"],
    ["WebP kun XMP-flago", riff([vp8x(0x04, 256, 256), vp8(256, 256)]), "metadatenoj"],
    ["WebP animacia", riff([vp8x(0x02, 256, 256), vp8(256, 256)]), "metadatenoj"],
    [
      "WebP kun kaŝita EXIF-peco",
      riff([vp8(256, 256), peco("EXIF", bajtoj("GPS"))]),
      "metadatenoj",
    ],
    ["JPEG kun EXIF (GPS)", jpeg(256, 256, [segmento(0xe1, bajtoj("Exif\0\0GPS"))]), "metadatenoj"],
    ["JPEG kun IPTC", jpeg(256, 256, [segmento(0xed, bajtoj("Photoshop 3.0"))]), "metadatenoj"],
    [
      "JPEG kun MPF (enigita dua bildo)",
      jpeg(256, 256, [segmento(0xe2, bajtoj("MPF\0II*\0"))]),
      "metadatenoj",
    ],
    ["JPEG ne kvadrata", jpeg(300, 256), "ne-kvadrata"],
    [
      "RIFF sed ne WebP",
      Uint8Array.from([...bajtoj("RIFF"), ...le32(4), ...bajtoj("WAVE")]),
      "ne-webp",
    ],
  ])("%s", (_nomo, b, kialo) => {
    expect(kontroliBildon(b)).toEqual({ bone: false, kialo });
  });

  it("detektas la tipon laŭ la enhavo, ne laŭ la nomo", () => {
    // JPEG-bajtoj estas JPEG, eĉ se la kliento dirus "image/webp".
    expect(kontroliBildon(jpeg(256, 256))).toMatchObject({ tipo: "image/jpeg" });
  });
});
