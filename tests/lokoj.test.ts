import { describe, expect, it } from "vitest";
import * as importilo from "../scripts/importi-lokojn.mjs";
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

  it("legas la regionojn kun lando kaj serĉnomo", () => {
    expect(regionoj.get("MX.09")).toEqual({
      id: "MX.09",
      lando: "MX",
      nomo: "Ciudad de México",
      sercxnomo: "ciudad de mexico",
    });
  });

  it("ordigas laŭ loĝantaro kaj ligas ĉiun urbon al sia regiono", () => {
    expect(urboj[0]).toMatchObject({
      id: 3530597,
      nomo: "Mexico City",
      regionoId: "MX.09",
      lando: "MX",
      sercxnomo: "mexico city",
    });
    expect(urboj[1].regionoId).toBe("MX.15");
  });

  it("ne ligas al regiono kiu ne ekzistas", () => {
    const sola = importilo.legiUrbojn(linio(9, "Nenie", "MX", "99", 20000), regionoj);
    expect(sola[0].regionoId).toBeNull();
  });

  it("rondigas la koordinatojn al 2 decimaloj", () => {
    expect(urboj[1].lat).toBe(19.28);
    expect(urboj[1].lon).toBe(-99.66);
  });

  it("generas SQL kun INSERT OR IGNORE kaj sekure citas apostrofojn", () => {
    const sql = importilo.alSql(new Map(), [{ ...urboj[0], nomo: "L'Aquila", regionoId: null }]);
    expect(sql).toContain("INSERT OR IGNORE INTO urboj");
    expect(sql).toContain("'L''Aquila'");
    expect(sql).toContain("NULL");
  });

  it("legas la landojn el countryInfo, ignorante komentojn", () => {
    expect(importilo.legiLandojn("#ISO\tISO3\nMX\tMEX\tMexico\nES\tESP\nrompita\n")).toEqual([
      "MX",
      "ES",
    ]);
  });

  it("enmetas landojn, poste regionojn, poste urbojn", () => {
    const sql = importilo.alSql(regionoj, urboj, 200, ["MX"]);
    expect(sql.indexOf("INTO landoj")).toBeLessThan(sql.indexOf("INTO regionoj"));
    expect(sql.indexOf("INTO regionoj")).toBeLessThan(sql.indexOf("INTO urboj"));
  });

  it("enmetas la regionojn antaŭ la urboj, en grupoj", () => {
    const multaj = Array.from({ length: 450 }, (_, i) => ({ ...urboj[0], id: i + 1 }));
    const sql = importilo.alSql(regionoj, multaj, 200);
    expect(sql.match(/INSERT OR IGNORE INTO urboj/g)).toHaveLength(3);
    expect(sql.indexOf("INTO regionoj")).toBeLessThan(sql.indexOf("INTO urboj"));
  });
});
