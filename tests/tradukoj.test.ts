import { describe, expect, it } from "vitest";
import { CXEFA_LINGVO, estasLingvo, tradukilo } from "../src/i18n/tradukoj";

describe("tradukilo", () => {
  it("redonas la esperantan tekston por Esperanto", () => {
    expect(tradukilo("eo")("hejmo.titolo")).toBe("Trovu samideanojn ĉirkaŭ vi");
  });

  it("redonas la tradukon kiam ĝi ekzistas", () => {
    expect(tradukilo("es")("hejmo.titolo")).toBe("Encuentra samideanos cerca de ti");
  });

  it("uzas Esperanton kiam traduko mankas", () => {
    expect(tradukilo("es")("retejo.nomo")).toBe("Samideanoj");
  });

  it("uzas Esperanton por nekonata aŭ manka lingvo", () => {
    expect(tradukilo("xx")("hejmo.titolo")).toBe("Trovu samideanojn ĉirkaŭ vi");
    expect(tradukilo(undefined)("hejmo.titolo")).toBe("Trovu samideanojn ĉirkaŭ vi");
  });
});

describe("estasLingvo", () => {
  it("rekonas nur la subtenatajn lingvojn", () => {
    expect(estasLingvo("eo")).toBe(true);
    expect(estasLingvo("fr")).toBe(false);
    expect(estasLingvo(42)).toBe(false);
  });

  it("havas Esperanton kiel ĉefan lingvon", () => {
    expect(CXEFA_LINGVO).toBe("eo");
  });
});
