import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { provaEnsalutoPermesita } from "../src/lib/provaEnsaluto";

/** Legas wrangler.jsonc, forigante la komentajn liniojn. */
function agordo() {
  const teksto = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
    .split("\n")
    .filter((linio) => !/^\s*\/\//.test(linio))
    .join("\n");
  return JSON.parse(teksto);
}

describe("wrangler.jsonc: seruroj de la prova ensaluto", () => {
  const a = agordo();

  it("produktado NENIAM havas PROVA_ENSALUTO", () => {
    expect(a.env.produktado.vars).toBeDefined();
    expect(a.env.produktado.vars.PROVA_ENSALUTO).toBeUndefined();
    expect(a.env.produktado.vars.MEDIO).toBe("produktado");
  });

  it("la produkta agordo ne permesas la provan ensaluton", () => {
    expect(provaEnsalutoPermesita(a.env.produktado.vars)).toBe(false);
  });

  it("la provmedio kaj la loka agordo permesas ĝin", () => {
    expect(provaEnsalutoPermesita(a.env.provmedio.vars)).toBe(true);
    expect(provaEnsalutoPermesita(a.vars)).toBe(true);
  });

  it("ĉiu medio havas sian propran datumbazon", () => {
    expect(a.env.produktado.d1_databases[0].database_name).toBe("samideanoj-produktado");
    expect(a.env.provmedio.d1_databases[0].database_name).toBe("samideanoj-provmedio");
  });
});

describe("provaEnsalutoPermesita", () => {
  it.each([
    [{ PROVA_ENSALUTO: "jes", MEDIO: "produktado" }, false],
    [{ PROVA_ENSALUTO: "jes" }, false],
    [{ PROVA_ENSALUTO: "jes", MEDIO: "alia" }, false],
    [{ PROVA_ENSALUTO: "true", MEDIO: "provmedio" }, false],
    [{ MEDIO: "provmedio" }, false],
    [{ PROVA_ENSALUTO: "jes", MEDIO: "provmedio" }, true],
    [{ PROVA_ENSALUTO: "jes", MEDIO: "loka" }, true],
  ])("%o → %s", (medio, atendata) => {
    expect(provaEnsalutoPermesita(medio)).toBe(atendata);
  });
});

describe("wrangler.jsonc: rapidlimoj en ĉiu medio", () => {
  const a = agordo();
  const medioj: [string, { ratelimits?: { name: string }[] }][] = [
    ["loka", a],
    ["provmedio", a.env.provmedio],
    ["produktado", a.env.produktado],
  ];
  it.each(medioj)("%s havas PROFILA_LIMIGILO kaj SKRIBA_LIMIGILO", (_n, m) => {
    const nomoj = (m.ratelimits ?? []).map((r) => r.name).sort();
    expect(nomoj).toEqual(["PROFILA_LIMIGILO", "SKRIBA_LIMIGILO"]);
  });
});
