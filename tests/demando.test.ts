import { beforeEach, describe, expect, it } from "vitest";
import { interpreti, trovuLandon, trovuLingvon } from "../src/lib/demando";
import { testaDatumbazo } from "./helpoj/d1";

let db: D1Database;
const INTERESOJ = [
  { id: 1, sxlosilo: "literaturo" },
  { id: 3, sxlosilo: "muziko" },
];

beforeEach(() => {
  const t = testaDatumbazo();
  db = t.d1;
  t.sqlite.exec(`
    INSERT INTO landoj (kodo) VALUES ('MX'), ('ES'), ('US');
    INSERT INTO regionoj (id, lando_kodo, nomo, sercxnomo) VALUES
      ('MX.27', 'MX', 'Tabasco', 'tabasco'), ('ES.54', 'ES', 'Castilla-La Mancha', 'castilla la mancha'),
      ('US.OH', 'US', 'Ohio', 'ohio');
    INSERT INTO urboj (id, nomo, nomo_eo, lando_kodo, regiono_id, lat, lon, logxantoj, sercxnomo) VALUES
      (3530597, 'Mexico City', 'Meksikurbo', 'MX', NULL, 19.4, -99.1, 12000000, 'mexico city'),
      (3108286, 'Toledo', NULL, 'ES', 'ES.54', 39.8, -4.0, 74000, 'toledo'),
      (5174035, 'Toledo', NULL, 'US', 'US.OH', 41.6, -83.5, 270000, 'toledo');
  `);
});

describe("interpreti", () => {
  it.each([
    ["Meksiko", { tipo: "lando", lando: "MX" }],
    ["México", { tipo: "lando", lando: "MX" }],
    ["mexico", { tipo: "lando", lando: "MX" }],
    ["Hispanio", { tipo: "lando", lando: "ES" }],
    ["Spain", { tipo: "lando", lando: "ES" }],
  ])("lando en ĉiu lingvo: %s", async (q, atendita) => {
    expect(await interpreti(db, q, INTERESOJ)).toEqual(atendita);
  });

  it("urbo laŭ esperanta nomo", async () => {
    expect(await interpreti(db, "Meksikurbo", INTERESOJ)).toEqual({
      tipo: "loko",
      lando: "MX",
      loko: { tipo: "urbo", id: 3530597 },
    });
  });

  it("urbo laŭ loka nomo, sen diakritaj signoj", async () => {
    expect(await interpreti(db, "mexico city", INTERESOJ)).toMatchObject({ loko: { id: 3530597 } });
  });

  it("samnomaj urboj: la plej loĝata", async () => {
    expect(await interpreti(db, "Toledo", INTERESOJ)).toMatchObject({
      lando: "US",
      loko: { id: 5174035 },
    });
  });

  it("regiono", async () => {
    expect(await interpreti(db, "Tabasco", INTERESOJ)).toEqual({
      tipo: "loko",
      lando: "MX",
      loko: { tipo: "regiono", id: "MX.27" },
    });
  });

  it.each([
    ["Muziko", 3],
    ["música", 3],
    ["Literature", 1],
  ])("intereso: %s", async (q, id) => {
    expect(await interpreti(db, q, INTERESOJ)).toEqual({ tipo: "intereso", id });
  });

  it.each([
    ["japana", "ja"],
    ["portugués", "pt"],
    ["German", "de"],
  ])("lingvo: %s", async (q, kodo) => {
    expect(await interpreti(db, q, INTERESOJ)).toEqual({ tipo: "lingvo", kodo });
  });

  it("alie: kromnomo", async () => {
    expect(await interpreti(db, "  Marisol ", INTERESOJ)).toEqual({
      tipo: "nomo",
      nomo: "Marisol",
    });
  });

  it("malplena: nenio", async () => {
    expect(await interpreti(db, "   ", INTERESOJ)).toBeNull();
  });

  it("injekto estas nur teksto", async () => {
    expect(await interpreti(db, "' OR 1=1 --", INTERESOJ)).toEqual({
      tipo: "nomo",
      nomo: "' OR 1=1 --",
    });
  });

  it("helpaj indeksoj", () => {
    expect(trovuLandon("meksiko")).toBe("MX");
    expect(trovuLingvon("hispana")).toBe("es");
  });
});
