import { beforeEach, describe, expect, it } from "vitest";
import {
  estasModeriganto,
  kasxitajProfiloj,
  lastajAgoj,
  nombroDeNovaj,
  novajRaportoj,
  plenumiAgon,
} from "../src/lib/moderigado";
import { raporti, TAGA_LIMO, validigiRaporton } from "../src/lib/raportoj";
import { testaDatumbazo } from "./helpoj/d1";
import { plenaUzanto } from "./helpoj/uzantoj";

let db: D1Database;
let sqlite: ReturnType<typeof testaDatumbazo>["sqlite"];
const unu = (sql: string) => sqlite.prepare(sql).get() as Record<string, unknown>;

beforeEach(() => {
  ({ d1: db, sqlite } = testaDatumbazo());
  sqlite.exec("INSERT INTO landoj (kodo) VALUES ('MX')");
  plenaUzanto(sqlite, "ANA");
  plenaUzanto(sqlite, "BEN");
  plenaUzanto(sqlite, "SPAMISTO");
  plenaUzanto(sqlite, "MOD", "moderiganto");
  plenaUzanto(sqlite, "ADMIN", "administranto");
});

describe("validigiRaporton", () => {
  it("akceptas validan kialon kaj komenton", () => {
    expect(validigiRaporton("spamo", "  reklamoj  ")).toEqual({
      bone: true,
      kialo: "spamo",
      komento: "reklamoj",
    });
    expect(validigiRaporton("falsa_profilo", "")).toEqual({
      bone: true,
      kialo: "falsa_profilo",
      komento: null,
    });
  });
  it.each([
    ["nekonata", "", "kialo"],
    [undefined, "", "kialo"],
    ["spamo", "x".repeat(1001), "komento"],
    ["alia", "   ", "alia-sen-komento"],
  ])("%s / komento → eraro %s", (kialo, komento, eraro) => {
    expect(validigiRaporton(kialo, komento)).toEqual({ bone: false, eraro });
  });
});

describe("raporti", () => {
  const r = (raportantoId: string, profiloId = "SPAMISTO") =>
    raporti(db, { raportantoId, profiloId, kialo: "spamo", komento: null }, 1000);

  it("kreas raporton", async () => {
    expect(await r("ANA")).toBe("kreita");
    expect(await nombroDeNovaj(db)).toBe(1);
  });

  it("la sama persono ne duobligas raporton pri la sama profilo", async () => {
    await r("ANA");
    expect(
      await raporti(
        db,
        { raportantoId: "ANA", profiloId: "SPAMISTO", kialo: "ofenda_enhavo", komento: "x" },
        2000,
      ),
    ).toBe("gxisdatigita");
    expect(await nombroDeNovaj(db)).toBe(1);
    expect(unu("SELECT kialo, komento FROM raportoj")).toEqual({
      kialo: "ofenda_enhavo",
      komento: "x",
    });
  });

  it("oni ne povas raporti sin mem", async () => {
    expect(await r("ANA", "ANA")).toBe("memo");
  });

  it(`maksimume ${TAGA_LIMO} raportoj en 24 horoj`, async () => {
    for (let i = 0; i < TAGA_LIMO; i++) {
      plenaUzanto(sqlite, `P${i}`);
      expect(await r("ANA", `P${i}`)).toBe("kreita");
    }
    expect(await r("ANA", "BEN")).toBe("limo");
    // Post 24 horoj, denove eblas.
    expect(
      await raporti(
        db,
        { raportantoId: "ANA", profiloId: "BEN", kialo: "spamo", komento: null },
        1000 + 86_401,
      ),
    ).toBe("kreita");
  });
});

describe("moderigado", () => {
  beforeEach(async () => {
    await raporti(
      db,
      { raportantoId: "ANA", profiloId: "SPAMISTO", kialo: "spamo", komento: "reklamoj" },
      100,
    );
    await raporti(
      db,
      { raportantoId: "BEN", profiloId: "SPAMISTO", kialo: "malkonvena_bildo", komento: null },
      200,
    );
  });

  it("la rolo", () => {
    expect(estasModeriganto("moderiganto")).toBe(true);
    expect(estasModeriganto("administranto")).toBe(true);
    expect(estasModeriganto("uzanto")).toBe(false);
    expect(estasModeriganto(undefined)).toBe(false);
  });

  it("la vico grupigas la raportojn laŭ profilo", async () => {
    const vico = await novajRaportoj(db);
    expect(vico).toHaveLength(1);
    expect(vico[0]).toMatchObject({ slug: "spamisto", havasBildon: true, bildoKasxita: false });
    expect(vico[0].raportoj.map((r) => r.kialo)).toEqual(["spamo", "malkonvena_bildo"]);
  });

  it("kaŝi profilon: la profilo kaŝiĝas, la raportoj akceptiĝas, la ago registriĝas", async () => {
    expect(
      await plenumiAgon(
        db,
        { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "kasxi_profilon" },
        500,
      ),
    ).toBe(true);
    expect(unu("SELECT stato FROM uzantoj WHERE id = 'SPAMISTO'")).toEqual({
      stato: "kasxita_de_moderiganto",
    });
    expect(sqlite.prepare("SELECT DISTINCT stato FROM raportoj").all()).toEqual([
      { stato: "akceptita" },
    ]);
    expect(await novajRaportoj(db)).toEqual([]);
    const [ago] = await lastajAgoj(db);
    expect(ago).toMatchObject({
      ago: "kasxi_profilon",
      moderiganto: "MOD",
      slug: "spamisto",
      kreita: 500,
    });
    expect(await kasxitajProfiloj(db)).toMatchObject([{ slug: "spamisto", profiloKasxita: true }]);
  });

  it("kaŝi nur la bildon", async () => {
    await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "kasxi_bildon" });
    expect(
      unu("SELECT kasxita_de_moderiganto AS k FROM profilbildoj WHERE uzanto_id = 'SPAMISTO'"),
    ).toEqual({ k: 1 });
    expect(unu("SELECT stato FROM uzantoj WHERE id = 'SPAMISTO'")).toEqual({ stato: "aktiva" });
  });

  it("malakcepti: nenio ŝanĝiĝas krom la raportoj", async () => {
    await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "malakcepti" });
    expect(unu("SELECT stato FROM uzantoj WHERE id = 'SPAMISTO'")).toEqual({ stato: "aktiva" });
    expect(sqlite.prepare("SELECT DISTINCT stato FROM raportoj").all()).toEqual([
      { stato: "malakceptita" },
    ]);
  });

  it("restarigi profilon kaj montri bildon denove", async () => {
    await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "kasxi_profilon" });
    await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "kasxi_bildon" });
    await plenumiAgon(db, {
      moderigantoId: "MOD",
      profiloId: "SPAMISTO",
      ago: "restarigi_profilon",
    });
    await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "SPAMISTO", ago: "montri_bildon" });
    expect(unu("SELECT stato FROM uzantoj WHERE id = 'SPAMISTO'")).toEqual({ stato: "aktiva" });
    expect(await kasxitajProfiloj(db)).toEqual([]);
    expect((await lastajAgoj(db)).map((a) => a.ago)).toEqual([
      "montri_bildon",
      "restarigi_profilon",
      "kasxi_bildon",
      "kasxi_profilon",
    ]);
  });

  it("moderiganto ne povas moderigi sin mem nek administranton", async () => {
    expect(
      await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "MOD", ago: "kasxi_profilon" }),
    ).toBe(false);
    expect(
      await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "ADMIN", ago: "kasxi_profilon" }),
    ).toBe(false);
    expect(await lastajAgoj(db)).toEqual([]);
  });

  it("nekonata profilo aŭ bildo kiu ne ekzistas: false, nenio registrita", async () => {
    expect(
      await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "NENIU", ago: "kasxi_profilon" }),
    ).toBe(false);
    sqlite.exec("DELETE FROM profilbildoj WHERE uzanto_id = 'BEN'");
    expect(
      await plenumiAgon(db, { moderigantoId: "MOD", profiloId: "BEN", ago: "kasxi_bildon" }),
    ).toBe(false);
    expect(await lastajAgoj(db)).toEqual([]);
  });
});
