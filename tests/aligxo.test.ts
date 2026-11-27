import { describe, expect, it } from "vitest";
import { slugDe, ulid, validigiAligxon } from "../src/lib/aligxo";
import { egalajSekure, hazardaJxetono } from "../src/lib/kripto";

describe("slugDe", () => {
  it.each([
    ["Marisol", "marisol"],
    ["Marisol García", "marisol-garcia"],
    ["Ĉiĉero Ŝuŝu", "cxicxero-sxusxu"],
    ["  Jo  ", "samideano"],
    ["日本語", "samideano"],
    ["Tomaso!!! (eo)", "tomaso-eo"],
    ["a".repeat(50), "a".repeat(30)],
  ])("%s → %s", (enigo, atendata) => {
    expect(slugDe(enigo)).toBe(atendata);
  });
});

describe("validigiAligxon", () => {
  it("akceptas kaj normigas validan enigon", () => {
    expect(validigiAligxon("  Marisol   García ", "flua", "jes", "MX")).toEqual({
      bone: true,
      kromnomo: "Marisol García",
      nivelo: "flua",
      lando: "MX",
    });
  });

  it("malakceptas malplenan aŭ tro longan kromnomon", () => {
    expect(validigiAligxon("   ", "flua", "jes", "MX")).toEqual({
      bone: false,
      eraroj: ["kromnomo"],
    });
    expect(validigiAligxon("a".repeat(61), "flua", "jes", "MX")).toEqual({
      bone: false,
      eraroj: ["kromnomo"],
    });
  });

  it("postulas la konfirmon de minimuma aĝo", () => {
    expect(validigiAligxon("Marisol", "flua", null, "MX")).toEqual({
      bone: false,
      eraroj: ["agxo"],
    });
    expect(validigiAligxon("Marisol", "flua", "jes", "MX")).toMatchObject({ bone: true });
  });

  it("postulas validan landon", () => {
    expect(validigiAligxon("Marisol", "flua", "jes", "")).toEqual({
      bone: false,
      eraroj: ["lando"],
    });
    expect(validigiAligxon("Marisol", "flua", "jes", "mex")).toEqual({
      bone: false,
      eraroj: ["lando"],
    });
  });

  it("malakceptas regsignojn kaj nekonatan nivelon", () => {
    expect(validigiAligxon("Mari\u0000sol", "majstro", "jes", "MX")).toEqual({
      bone: false,
      eraroj: ["kromnomo", "nivelo"],
    });
  });
});

describe("ulid kaj ĵetonoj", () => {
  it("ULID havas 26 signojn de Crockford kaj ordiĝas laŭ tempo", () => {
    const a = ulid(1_700_000_000_000);
    const b = ulid(1_700_000_000_001);
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(a < b).toBe(true);
  });

  it("ĵetonoj estas 43 signojn longaj kaj unikaj", () => {
    const a = hazardaJxetono();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hazardaJxetono()).not.toBe(a);
  });

  it("egalajSekure komparas ĝuste", () => {
    expect(egalajSekure("abc", "abc")).toBe(true);
    expect(egalajSekure("abc", "abd")).toBe(false);
    expect(egalajSekure("abc", "abcd")).toBe(false);
  });
});
