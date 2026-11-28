import { beforeEach, describe, expect, it } from "vitest";
import mapo from "../src/data/mapo.json";
import { KASXMEMORA_DAUXRO, kalkuliNombrojn, legiNombrojn, SOJLO } from "../src/lib/mapo";
import { projekcii } from "../src/lib/projekcio";
import { testaDatumbazo } from "./helpoj/d1";

let db: D1Database;
let sqlite: ReturnType<typeof testaDatumbazo>["sqlite"];
let n = 0;

function aldoni(lando: string, urbo: number | null, vid_urbo = "publika", stato = "aktiva") {
  n++;
  sqlite
    .prepare(
      `INSERT INTO uzantoj (id, slug, kromnomo, nivelo, lando_kodo, urbo_id, vid_urbo, stato,
         kreita, gxisdatigita, lasta_ensaluto) VALUES (?, ?, ?, 'flua', ?, ?, ?, ?, 1, 1, 1)`,
    )
    .run(`U${n}`, `u${n}`, `U${n}`, lando, urbo, vid_urbo, stato);
}

beforeEach(() => {
  ({ d1: db, sqlite } = testaDatumbazo());
  sqlite.exec(`
    INSERT INTO landoj (kodo) VALUES ('MX'), ('FR');
    INSERT INTO urboj (id, nomo, lando_kodo, lat, lon, logxantoj, sercxnomo) VALUES
      (1, 'Toluca', 'MX', 19.28, -99.65, 1, 'toluca'),
      (2, 'Puebla', 'MX', 19.04, -98.2, 1, 'puebla'),
      (3, 'Paris', 'FR', 48.85, 2.35, 1, 'paris');
  `);
});

describe("mapaj nombroj", () => {
  it(`urbo aperas nur kun almenaŭ ${SOJLO} publikaj samideanoj`, async () => {
    for (let i = 0; i < 3; i++) aldoni("MX", 1);
    for (let i = 0; i < 2; i++) aldoni("MX", 2);
    const r = await kalkuliNombrojn(db, 0);
    expect(r.urboj.map((u) => [u.nomo, u.nombro])).toEqual([["Toluca", 3]]);
    // Sed ĉiuj estas en la tuto de la lando.
    expect(r.landoj).toEqual({ MX: 5 });
    expect(r.sumo).toBe(5);
  });

  it("urboj ne publikaj ne kalkuliĝas por la urbo, sed ja por la lando", async () => {
    aldoni("FR", 3);
    aldoni("FR", 3);
    aldoni("FR", 3, "ensalutintoj");
    aldoni("FR", 3, "kasxita");
    const r = await kalkuliNombrojn(db, 0);
    expect(r.urboj).toEqual([]);
    expect(r.landoj.FR).toBe(4);
  });

  it("nur aktivaj profiloj", async () => {
    for (let i = 0; i < 3; i++) aldoni("MX", 1);
    aldoni("MX", 1, "publika", "kasxita_de_moderiganto");
    aldoni("MX", 1, "publika", "neaktiva");
    const r = await kalkuliNombrojn(db, 0);
    expect(r.landoj.MX).toBe(3);
    expect(r.urboj[0].nombro).toBe(3);
  });

  it("la kaŝmemoro: unu skribo, renovigita post la daŭro", async () => {
    aldoni("MX", 1);
    expect((await legiNombrojn(db, 1000)).sumo).toBe(1);
    aldoni("MX", 1);
    expect((await legiNombrojn(db, 1000 + KASXMEMORA_DAUXRO - 1)).sumo).toBe(1);
    expect((await legiNombrojn(db, 1000 + KASXMEMORA_DAUXRO)).sumo).toBe(2);
    expect(sqlite.prepare("SELECT count(*) AS n FROM kasxmemoro").get()).toEqual({ n: 1 });
  });
});

describe("projekcio", () => {
  it("Meksikurbo estas ene de la vido de Meksiko; Parizo ene de Francio", () => {
    const en = (kodo: "MX" | "FR", [x, y]: [number, number]) => {
      const [vx, vy, vw, vh] = mapo.landoj[kodo].viewBox as number[];
      return x > vx && x < vx + vw && y > vy && y < vy + vh;
    };
    expect(en("MX", projekcii(-99.13, 19.43))).toBe(true);
    expect(en("FR", projekcii(2.35, 48.85))).toBe(true);
    expect(en("FR", projekcii(-99.13, 19.43))).toBe(false);
  });
});
