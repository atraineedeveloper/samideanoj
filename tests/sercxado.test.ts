import { beforeEach, describe, expect, it } from "vitest";
import {
  alSercxparametroj,
  type Filtriloj,
  legiFiltrilojn,
  MAKS_PAGXOJ,
  MALPLENAJ_FILTRILOJ,
  PO_PAGXO,
  sercxi,
} from "../src/lib/sercxado";
import type { Rigardanto, Videbleco } from "../src/lib/tipoj";
import { testaDatumbazo } from "./helpoj/d1";

const VIZITANTO: Rigardanto = { tipo: "vizitanto" };
const ENSALUTINTO: Rigardanto = { tipo: "ensalutinto", uzantoId: "01ALIA" };

interface Persono {
  id: string;
  lando?: string;
  regiono?: string | null;
  urbo?: number | null;
  nivelo?: string;
  stato?: string;
  vid_urbo?: Videbleco;
  vid_regiono?: Videbleco;
  vid_interesoj?: Videbleco;
  vid_lingvoj?: Videbleco;
  interesoj?: number[];
  lingvoj?: string[];
  gxisdatigita?: number;
}

let db: D1Database;
let sqlite: ReturnType<typeof testaDatumbazo>["sqlite"];

function aldoni(p: Persono) {
  sqlite
    .prepare(
      `INSERT INTO uzantoj (id, slug, kromnomo, nivelo, lando_kodo, regiono_id, urbo_id, stato,
         vid_urbo, vid_regiono, vid_interesoj, vid_lingvoj, kreita, gxisdatigita, lasta_ensaluto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)`,
    )
    .run(
      p.id,
      p.id.toLowerCase(),
      p.id,
      p.nivelo ?? "flua",
      p.lando ?? "MX",
      p.regiono === undefined ? "MX.15" : p.regiono,
      p.urbo === undefined ? 3530597 : p.urbo,
      p.stato ?? "aktiva",
      p.vid_urbo ?? "publika",
      p.vid_regiono ?? "publika",
      p.vid_interesoj ?? "publika",
      p.vid_lingvoj ?? "publika",
      p.gxisdatigita ?? 1000,
    );
  for (const i of p.interesoj ?? []) {
    sqlite.prepare("INSERT INTO uzanto_interesoj VALUES (?, ?)").run(p.id, i);
  }
  for (const l of p.lingvoj ?? []) {
    sqlite.prepare("INSERT INTO uzanto_lingvoj VALUES (?, ?)").run(p.id, l);
  }
}

const f = (sxangxoj: Partial<Filtriloj>): Filtriloj => ({ ...MALPLENAJ_FILTRILOJ, ...sxangxoj });
const kiuj = async (filtriloj: Filtriloj, r: Rigardanto) =>
  (await sercxi(db, filtriloj, r)).profiloj.map((p) => p.kromnomo).sort();

beforeEach(() => {
  ({ d1: db, sqlite } = testaDatumbazo());
  sqlite.exec(`
    INSERT INTO landoj (kodo) VALUES ('MX'), ('BR');
    INSERT INTO regionoj (id, lando_kodo, nomo, sercxnomo) VALUES
      ('MX.15', 'MX', 'México', 'mexico'), ('MX.27', 'MX', 'Tabasco', 'tabasco');
    INSERT INTO urboj (id, nomo, lando_kodo, regiono_id, lat, lon, logxantoj, sercxnomo) VALUES
      (3530597, 'Toluca', 'MX', 'MX.15', 19.28, -99.65, 1, 'toluca'),
      (3514670, 'Villahermosa', 'MX', 'MX.27', 17.98, -92.92, 1, 'villahermosa');
  `);
});

describe("serĉado: privateco", () => {
  it.each<[string, Videbleco, boolean, boolean]>([
    ["publika", "publika", true, true],
    ["ensalutintoj", "ensalutintoj", false, true],
    ["kaŝita", "kasxita", false, false],
  ])("urbo %s: vizitanto trovas=%s, ensalutinto trovas=%s", async (_n, vid, viz, ens) => {
    aldoni({ id: "LUPE", vid_urbo: vid });
    const filtriloj = f({ lando: "MX", loko: { tipo: "urbo", id: 3530597 } });
    expect(await kiuj(filtriloj, VIZITANTO)).toEqual(viz ? ["LUPE"] : []);
    expect(await kiuj(filtriloj, ENSALUTINTO)).toEqual(ens ? ["LUPE"] : []);
    // La nombro ankaŭ ne malkaŝas ŝin.
    expect((await sercxi(db, filtriloj, VIZITANTO)).nombro).toBe(viz ? 1 : 0);
  });

  it("kaŝita regiono: ne trovebla per la regiono, sed ja per la lando (ĉiam publika)", async () => {
    aldoni({ id: "LUPE", vid_regiono: "kasxita", vid_urbo: "kasxita" });
    expect(await kiuj(f({ loko: { tipo: "regiono", id: "MX.15" } }), ENSALUTINTO)).toEqual([]);
    expect(await kiuj(f({ lando: "MX" }), VIZITANTO)).toEqual(["LUPE"]);
  });

  it("kaŝitaj interesoj kaj lingvoj ne estas serĉeblaj", async () => {
    aldoni({ id: "A", interesoj: [1], lingvoj: ["es"] });
    aldoni({
      id: "B",
      interesoj: [1],
      lingvoj: ["es"],
      vid_interesoj: "kasxita",
      vid_lingvoj: "kasxita",
    });
    aldoni({
      id: "C",
      interesoj: [1],
      lingvoj: ["es"],
      vid_interesoj: "ensalutintoj",
      vid_lingvoj: "ensalutintoj",
    });
    expect(await kiuj(f({ interesoj: [1] }), VIZITANTO)).toEqual(["A"]);
    expect(await kiuj(f({ interesoj: [1] }), ENSALUTINTO)).toEqual(["A", "C"]);
    expect(await kiuj(f({ lingvoj: ["es"] }), VIZITANTO)).toEqual(["A"]);
    expect(await kiuj(f({ lingvoj: ["es"] }), ENSALUTINTO)).toEqual(["A", "C"]);
  });

  it("nur aktivaj profiloj aperas", async () => {
    aldoni({ id: "A" });
    aldoni({ id: "B", stato: "kasxita_de_moderiganto" });
    aldoni({ id: "C", stato: "neaktiva" });
    expect(await kiuj(f({}), ENSALUTINTO)).toEqual(["A"]);
  });

  it("la kartoj montras nur videblajn kampojn", async () => {
    aldoni({ id: "LUPE", vid_urbo: "ensalutintoj", interesoj: [1], vid_interesoj: "kasxita" });
    const [karto] = (await sercxi(db, f({ lando: "MX" }), VIZITANTO)).profiloj;
    expect(karto.urbo).toBeNull();
    expect(karto.interesoj).toEqual([]);
    expect(karto.pliPostEnsaluto).toBe(true);
  });
});

describe("serĉado: filtriloj", () => {
  beforeEach(() => {
    aldoni({ id: "MARISOL", nivelo: "flua", interesoj: [1, 2], lingvoj: ["en"] });
    aldoni({ id: "TOMASO", nivelo: "komencanto", interesoj: [3], urbo: 3514670, regiono: "MX.27" });
    aldoni({ id: "JOAO", lando: "BR", regiono: null, urbo: null, nivelo: "denaska" });
  });

  it("lando", async () => {
    expect(await kiuj(f({ lando: "BR" }), VIZITANTO)).toEqual(["JOAO"]);
  });

  it("regiono", async () => {
    expect(await kiuj(f({ loko: { tipo: "regiono", id: "MX.27" } }), VIZITANTO)).toEqual([
      "TOMASO",
    ]);
  });

  it("pluraj niveloj (aŭ)", async () => {
    expect(await kiuj(f({ niveloj: ["flua", "denaska"] }), VIZITANTO)).toEqual(["JOAO", "MARISOL"]);
  });

  it("interesoj: almenaŭ unu el la elektitaj", async () => {
    expect(await kiuj(f({ interesoj: [2, 3] }), VIZITANTO)).toEqual(["MARISOL", "TOMASO"]);
  });

  it("filtriloj kombinitaj (kaj)", async () => {
    expect(
      await kiuj(f({ lando: "MX", niveloj: ["komencanto"], interesoj: [3] }), VIZITANTO),
    ).toEqual(["TOMASO"]);
    expect(await kiuj(f({ lando: "BR", interesoj: [3] }), VIZITANTO)).toEqual([]);
  });

  it("kromnomo, sen distingi majusklojn; % kaj _ estas laŭvortaj", async () => {
    expect(await kiuj(f({ nomo: "maris" }), VIZITANTO)).toEqual(["MARISOL"]);
    expect(await kiuj(f({ nomo: "%" }), VIZITANTO)).toEqual([]);
    expect(await kiuj(f({ nomo: "_" }), VIZITANTO)).toEqual([]);
  });

  it("injekto en la kromnomo estas nur teksto", async () => {
    expect(await kiuj(f({ nomo: "' OR 1=1 --" }), VIZITANTO)).toEqual([]);
  });
});

describe("serĉado: paĝoj kaj ordo", () => {
  it("la plej freŝe ĝisdatigitaj unue; 20 por paĝo", async () => {
    for (let i = 0; i < 45; i++) aldoni({ id: `P${String(i).padStart(2, "0")}`, gxisdatigita: i });
    const unua = await sercxi(db, f({}), VIZITANTO);
    expect(unua.nombro).toBe(45);
    expect(unua.pagxoj).toBe(3);
    expect(unua.profiloj).toHaveLength(PO_PAGXO);
    expect(unua.profiloj[0].kromnomo).toBe("P44");
    const tria = await sercxi(db, f({ pagxo: 3 }), VIZITANTO);
    expect(tria.profiloj.map((p) => p.kromnomo)).toEqual(["P04", "P03", "P02", "P01", "P00"]);
  });
});

describe("legiFiltrilojn", () => {
  const legi = (s: string) => legiFiltrilojn(new URLSearchParams(s));

  it("legas validajn valorojn", () => {
    expect(
      legi(
        "lando=mx&loko=urbo:3530597&nivelo=flua&nivelo=flua&intereso=3&lingvo=es&nomo=%20Lupe%20&pagxo=2",
      ),
    ).toEqual({
      lando: "MX",
      loko: { tipo: "urbo", id: 3530597 },
      niveloj: ["flua"],
      interesoj: [3],
      lingvoj: ["es"],
      nomo: "Lupe",
      q: "",
      pagxo: 2,
    });
  });

  it("ignoras nevalidajn valorojn anstataŭ erari", () => {
    expect(legi("lando=Meksiko&loko=x&nivelo=reĝo&intereso=abc&lingvo=ESP&pagxo=-3")).toEqual(
      MALPLENAJ_FILTRILOJ,
    );
  });

  it("limigas la profundon de paĝoj kaj la nombron de elektoj", () => {
    expect(legi("pagxo=9999").pagxo).toBe(MAKS_PAGXOJ);
    const multaj = Array.from({ length: 30 }, (_, i) => `intereso=${i + 1}`).join("&");
    expect(legi(multaj).interesoj).toHaveLength(10);
  });

  it("alSercxparametroj estas la inverso", () => {
    const s =
      "lando=MX&loko=regiono%3AMX.27&nivelo=flua&intereso=3&lingvo=es&nomo=Lupe&q=Toluca&pagxo=2";
    expect(alSercxparametroj(legi(s))).toBe(s);
  });
});
