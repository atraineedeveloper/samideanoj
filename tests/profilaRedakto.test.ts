import { describe, expect, it } from "vitest";
import { analiziLokon, MAKS_LIGILOJ, validigiProfilon } from "../src/lib/profilaRedakto";

type Valoroj = Record<string, string | string[]>;

function formularo(anstatauxoj: Valoroj = {}): FormData {
  const bazaj: Valoroj = {
    kromnomo: "Marisol",
    nivelo: "flua",
    priskribo: "Saluton!",
    lando: "MX",
    loko: "urbo:3530597",
    vid_regiono: "publika",
    vid_urbo: "ensalutintoj",
    vid_priskribo: "publika",
    vid_lingvoj: "publika",
    vid_interesoj: "publika",
    lingvoj: ["es", "en"],
    interesoj: ["1", "3"],
    ligilo_tipo: ["telegramo", "retejo"],
    ligilo_valoro: ["@marisol_eo", "https://example.org"],
    ligilo_videbleco: ["ensalutintoj", "publika"],
  };
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...bazaj, ...anstatauxoj })) {
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  }
  return f;
}

const eraroj = (f: FormData) => {
  const r = validigiProfilon(f);
  return r.bone ? [] : r.eraroj;
};

describe("validigiProfilon: valida formularo", () => {
  it("normigas kaj redonas ĉiujn kampojn", () => {
    const r = validigiProfilon(formularo({ kromnomo: "  Marisol   García ", priskribo: "a\r\nb" }));
    expect(r.bone).toBe(true);
    if (!r.bone) return;
    expect(r.datumoj).toMatchObject({
      kromnomo: "Marisol García",
      priskribo: "a\nb",
      lando: "MX",
      loko: { tipo: "urbo", id: 3530597 },
      lingvoj: ["es", "en"],
      interesoj: [1, 3],
    });
    expect(r.datumoj.ligiloj).toEqual([
      { tipo: "telegramo", valoro: "marisol_eo", videbleco: "ensalutintoj", ordo: 0 },
      { tipo: "retejo", valoro: "https://example.org/", videbleco: "publika", ordo: 1 },
    ]);
  });

  it("ignoras malplenajn vicojn de ligiloj kaj renumeras la ordon", () => {
    const r = validigiProfilon(
      formularo({
        ligilo_tipo: ["telegramo", "instagram", "retejo"],
        ligilo_valoro: ["@marisol_eo", "   ", "https://example.org"],
        ligilo_videbleco: ["publika", "publika", "publika"],
      }),
    );
    expect(r.bone && r.datumoj.ligiloj.map((l) => [l.tipo, l.ordo])).toEqual([
      ["telegramo", 0],
      ["retejo", 1],
    ]);
  });

  it("akceptas nur landon, sen regiono nek urbo", () => {
    const r = validigiProfilon(formularo({ loko: "" }));
    expect(r.bone && r.datumoj.loko).toBeNull();
  });

  it("akceptas regionon de la sama lando", () => {
    const r = validigiProfilon(formularo({ loko: "regiono:MX.27" }));
    expect(r.bone && r.datumoj.loko).toEqual({ tipo: "regiono", id: "MX.27" });
  });

  it("malplena priskribo iĝas null; duoblaj lingvoj kaj interesoj forigitaj", () => {
    const r = validigiProfilon(
      formularo({ priskribo: "   ", lingvoj: ["es", "es"], interesoj: ["1", "1"] }),
    );
    expect(r.bone && [r.datumoj.priskribo, r.datumoj.lingvoj, r.datumoj.interesoj]).toEqual([
      null,
      ["es"],
      [1],
    ]);
  });
});

describe("validigiProfilon: eraroj", () => {
  it.each<[string, Valoroj, string]>([
    ["malplena kromnomo", { kromnomo: " " }, "kromnomo"],
    ["nekonata nivelo", { nivelo: "majstro" }, "nivelo"],
    ["tro longa priskribo", { priskribo: "a".repeat(501) }, "priskribo"],
    ["regsigno en priskribo", { priskribo: "a\u0000b" }, "priskribo"],
    ["sen lando", { lando: "" }, "lando"],
    ["malvalida lando", { lando: "mex" }, "lando"],
    ["malvalida loko", { loko: "urbo:abc" }, "loko"],
    ["regiono de alia lando", { loko: "regiono:ES.29" }, "loko"],
    ["SQL en loko", { loko: "regiono:MX.27'; DROP TABLE uzantoj;--" }, "loko"],
    ["nekonata videbleco", { vid_urbo: "cxiuj" }, "videbleco"],
    ["nekonata lingvo", { lingvoj: ["xx"] }, "lingvoj"],
    ["Esperanto kiel kroma lingvo", { lingvoj: ["eo"] }, "lingvoj"],
    ["malvalida intereso", { interesoj: ["1; DROP"] }, "interesoj"],
  ])("%s", (_nomo, anstatauxoj, kampo) => {
    expect(eraroj(formularo(anstatauxoj)).map((e) => e.kampo)).toContain(kampo);
  });

  it("indikas, kiu ligilo estas malvalida", () => {
    const e = eraroj(
      formularo({
        ligilo_tipo: ["telegramo", "retejo"],
        ligilo_valoro: ["@marisol_eo", "javascript:alert(1)"],
        ligilo_videbleco: ["publika", "publika"],
      }),
    );
    expect(e).toEqual([{ kampo: "ligilo", indekso: 1 }]);
  });

  it("malakceptas nekonatan tipon aŭ videblecon de ligilo", () => {
    const e = eraroj(
      formularo({
        ligilo_tipo: ["myspace", "telegramo"],
        ligilo_valoro: ["x", "@marisol_eo"],
        ligilo_videbleco: ["publika", "cxiuj"],
      }),
    );
    expect(e).toEqual([
      { kampo: "ligilo", indekso: 0 },
      { kampo: "ligilo", indekso: 1 },
    ]);
  });

  it("malakceptas misaranĝitajn ligilajn kolumnojn", () => {
    const e = eraroj(formularo({ ligilo_tipo: ["telegramo"], ligilo_valoro: ["a", "b"] }));
    expect(e.map((x) => x.kampo)).toContain("ligiloj");
  });

  it(`malakceptas pli ol ${MAKS_LIGILOJ} ligilojn`, () => {
    const n = MAKS_LIGILOJ + 1;
    const e = eraroj(
      formularo({
        ligilo_tipo: Array(n).fill("retejo"),
        ligilo_valoro: Array.from({ length: n }, (_, i) => `https://example.org/${i}`),
        ligilo_videbleco: Array(n).fill("publika"),
      }),
    );
    expect(e.map((x) => x.kampo)).toContain("ligiloj");
  });
});

describe("analiziLokon", () => {
  it.each([
    ["", null],
    ["urbo:3530597", { tipo: "urbo", id: 3530597 }],
    ["regiono:MX.27", { tipo: "regiono", id: "MX.27" }],
    ["regiono:US.OH", { tipo: "regiono", id: "US.OH" }],
    ["urbo:", "eraro"],
    ["lando:MX", "eraro"],
    ["regiono:mx.27", "eraro"],
  ])("%s", (enigo, atendata) => {
    expect(analiziLokon(enigo)).toEqual(atendata);
  });
});
