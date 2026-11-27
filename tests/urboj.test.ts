import { describe, expect, it } from "vitest";
// @ts-expect-error: JavaScript-modulo sen tipoj
import * as importilo from "../scripts/importi-urbojn.mjs";
import { normigiSercxon } from "../src/lib/sercxo";

describe("normigiSercxon", () => {
  it.each([
    ["São Paulo", "sao paulo"],
    ["Ciudad de México", "ciudad de mexico"],
    ["Ĉiĉero", "cicero"],
    ["Zürich", "zurich"],
    ["  Saint-Étienne!! ", "saint etienne"],
    ["東京", "東京"],
  ])("%s → %s", (enigo, atendata) => {
    expect(normigiSercxon(enigo)).toBe(atendata);
  });

  it("la importilo uzas precize la saman normigon", () => {
    for (const t of ["São Paulo", "Ĉiĉero", "Saint-Étienne", "Łódź", "Nuuk", "Ōsaka"]) {
      expect(importilo.normigiSercxon(t)).toBe(normigiSercxon(t));
    }
  });
});

const REGIONOJ = "MX.15\tMéxico\tMexico\t3523272\nMX.09\tCiudad de México\tMexico City\t3527646\n";
const linio = (id: number, nomo: string, lando: string, admin1: string, logxantoj: number) =>
  [
    id,
    nomo,
    nomo,
    "",
    "19.2826",
    "-99.6557",
    "P",
    "PPLA",
    lando,
    "",
    admin1,
    "",
    "",
    "",
    logxantoj,
    "",
    "",
    "America/Mexico_City",
    "2024-01-01",
  ].join("\t");

describe("importilo de urboj", () => {
  const regionoj = importilo.legiRegionojn(REGIONOJ);
  const teksto = [
    linio(3515302, "Toluca", "MX", "15", 489333),
    linio(3530597, "Mexico City", "MX", "09", 12294193),
    "rompita linio",
    linio(1, "Sen lando", "", "", 5),
  ].join("\n");
  const urboj = importilo.legiUrbojn(teksto, regionoj);

  it("legas validajn liniojn kaj ignoras la rompitajn", () => {
    expect(urboj).toHaveLength(2);
  });

  it("ordigas laŭ loĝantaro kaj aldonas regionon kaj serĉnomon", () => {
    expect(urboj[0]).toMatchObject({
      id: 3530597,
      nomo: "Mexico City",
      regiono: "Ciudad de México",
      lando: "MX",
      sercxnomo: "mexico city",
    });
    expect(urboj[1].regiono).toBe("México");
  });

  it("rondigas la koordinatojn al 2 decimaloj", () => {
    expect(urboj[1].lat).toBe(19.28);
    expect(urboj[1].lon).toBe(-99.66);
  });

  it("generas SQL kun INSERT OR IGNORE kaj sekure citas apostrofojn", () => {
    const sql = importilo.alSql([{ ...urboj[0], nomo: "L'Aquila", regiono: null }]);
    expect(sql).toContain("INSERT OR IGNORE INTO urboj");
    expect(sql).toContain("'L''Aquila'");
    expect(sql).toContain("NULL");
  });

  it("grupigas la vicojn en pluraj ordonoj", () => {
    const multaj = Array.from({ length: 450 }, (_, i) => ({ ...urboj[0], id: i + 1 }));
    expect(importilo.alSql(multaj, 200).match(/INSERT OR IGNORE/g)).toHaveLength(3);
  });
});
