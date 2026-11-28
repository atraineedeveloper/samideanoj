import { beforeEach, describe, expect, it } from "vitest";
import {
  EKSPORTA_FORMATO,
  eksportiDatumojn,
  elsalutiCxie,
  forigiKonton,
  konfirmoValidas,
} from "../src/lib/konto";
import { testaDatumbazo } from "./helpoj/d1";
import { plenaUzanto } from "./helpoj/uzantoj";

let db: D1Database;
let sqlite: ReturnType<typeof testaDatumbazo>["sqlite"];

const TABELOJ_KUN_UZANTO = [
  ["identecoj", "uzanto_id"],
  ["seancoj", "uzanto_id"],
  ["ligiloj", "uzanto_id"],
  ["uzanto_lingvoj", "uzanto_id"],
  ["uzanto_interesoj", "uzanto_id"],
  ["profilbildoj", "uzanto_id"],
  ["raportoj", "profilo_id"],
  ["raportoj", "raportanto_id"],
] as const;

const nombro = (tabelo: string, kolumno: string, id: string) =>
  (
    sqlite.prepare(`SELECT count(*) AS n FROM ${tabelo} WHERE ${kolumno} = ?`).get(id) as {
      n: number;
    }
  ).n;

beforeEach(() => {
  ({ d1: db, sqlite } = testaDatumbazo());
  sqlite.exec("INSERT INTO landoj (kodo) VALUES ('MX');");
  plenaUzanto(sqlite, "ANA");
  plenaUzanto(sqlite, "BEN");
  // Ana raportis Ben; Ben raportis Ana.
  sqlite.exec(`
    INSERT INTO raportoj (profilo_id, raportanto_id, kialo, komento, kreita) VALUES ('BEN', 'ANA', 'spamo', 'reklamoj', 1790000100);
    INSERT INTO raportoj (profilo_id, raportanto_id, kialo, kreita) VALUES ('ANA', 'BEN', 'alia', 1790000200);
  `);
});

describe("forigi konton", () => {
  it("forigas la uzanton kaj ĉiujn ĝiajn datumojn en ĉiuj tabeloj", async () => {
    expect(await forigiKonton(db, "ANA")).toBe(true);
    expect(nombro("uzantoj", "id", "ANA")).toBe(0);
    for (const [tabelo, kolumno] of TABELOJ_KUN_UZANTO) {
      expect(nombro(tabelo, kolumno, "ANA"), `${tabelo}.${kolumno}`).toBe(0);
    }
  });

  it("ne tuŝas aliajn uzantojn; la raporto de Ana pri Ben restas, sen aŭtoro", async () => {
    await forigiKonton(db, "ANA");
    for (const [tabelo, kolumno] of TABELOJ_KUN_UZANTO.filter(([t]) => t !== "raportoj")) {
      expect(nombro(tabelo, kolumno, "BEN"), tabelo).toBe(1);
    }
    expect(
      sqlite.prepare("SELECT raportanto_id, kialo FROM raportoj WHERE profilo_id = 'BEN'").all(),
    ).toEqual([{ raportanto_id: null, kialo: "spamo" }]);
  });

  it("la moderigaj registroj restas, sen la moderiganto", async () => {
    sqlite.exec(
      "INSERT INTO moderigaj_agoj (moderiganto_id, profilo_id, ago, kreita) VALUES ('ANA', 'BEN', 'malakcepti', 1)",
    );
    await forigiKonton(db, "ANA");
    expect(sqlite.prepare("SELECT moderiganto_id, profilo_id FROM moderigaj_agoj").all()).toEqual([
      { moderiganto_id: null, profilo_id: "BEN" },
    ]);
  });

  it("nekonata uzanto: false", async () => {
    expect(await forigiKonton(db, "NENIU")).toBe(false);
  });
});

describe("eksporti", () => {
  it("enhavas ĉiujn datumojn de la uzanto", async () => {
    const e = await eksportiDatumojn(db, "ANA", Date.UTC(2026, 10, 27));
    expect(e).toMatchObject({
      formato: EKSPORTA_FORMATO,
      eksportita: "2026-11-27T00:00:00.000Z",
      profilo: {
        slug: "ana",
        kromnomo: "ANA",
        priskribo: "Saluton!",
        nivelo: "flua",
        lando: "MX",
        rolo: "uzanto",
      },
      identecoj: [{ provizanto: "github", ekstera_id: "gh-ANA" }],
      ligiloj: [{ tipo: "retejo", valoro: "https://example.org", videbleco: "publika" }],
      lingvoj: ["es"],
      interesoj: ["literaturo"],
      bildo: { tipo: "image/webp", datumoj: "AQID", kasxita_de_moderiganto: false },
      raportoj_faritaj: [
        {
          kialo: "spamo",
          komento: "reklamoj",
          stato: "nova",
          kreita: new Date(1790000100 * 1000).toISOString(),
        },
      ],
      aktivaj_seancoj: 1,
    });
    expect(e?.profilo.kreita).toBe(new Date(1790000000 * 1000).toISOString());
  });

  it("ne enhavas datumojn de aliaj personoj: nek raportojn pri ŝi, nek seancajn haŝojn", async () => {
    const teksto = JSON.stringify(await eksportiDatumojn(db, "ANA"));
    expect(teksto).not.toContain("BEN");
    expect(teksto).not.toContain("seanca-hasxo");
  });

  it("nekonata uzanto: null", async () => {
    expect(await eksportiDatumojn(db, "NENIU")).toBeNull();
  });
});

describe("elsaluti ĉie", () => {
  it("forigas ĉiujn seancojn de la uzanto, nur de ŝi", async () => {
    sqlite
      .prepare("INSERT INTO seancoj (id_hash, uzanto_id, eksvalidigxo) VALUES ('h2', 'ANA', 9)")
      .run();
    await elsalutiCxie(db, "ANA");
    expect(nombro("seancoj", "uzanto_id", "ANA")).toBe(0);
    expect(nombro("seancoj", "uzanto_id", "BEN")).toBe(1);
  });
});

describe("konfirmoValidas", () => {
  it.each([
    ["Marisol", "Marisol", true],
    ["  marisol ", "Marisol", true],
    ["Ĉiĉero", "ĉiĉero", true],
    ["Mari", "Marisol", false],
    ["", "Marisol", false],
  ])("%j kontraŭ %j → %s", (tajpita, kromnomo, atendita) => {
    expect(konfirmoValidas(tajpita, kromnomo)).toBe(atendita);
  });
});
