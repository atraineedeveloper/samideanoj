import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));
vi.mock("astro:middleware", () => ({ defineMiddleware: (f: unknown) => f }));

const { originoValidas } = await import("../src/middleware");
const NIA = new URL("https://samideanoj.example/es/aligxi");

const peto = (metodo: string, origin?: string) =>
  new Request(NIA, { method: metodo, headers: origin ? { Origin: origin } : {} });

describe("originoValidas (CSRF)", () => {
  it.each(["GET", "HEAD", "OPTIONS"])("permesas %s sen Origin", (m) => {
    expect(originoValidas(peto(m), NIA)).toBe(true);
  });

  it("permesas POST el nia origino", () => {
    expect(originoValidas(peto("POST", "https://samideanoj.example"), NIA)).toBe(true);
  });

  it.each([
    ["sen Origin", undefined],
    ["el alia retejo", "https://malica.example"],
    ["el simila domajno", "https://samideanoj.example.malica.example"],
    ["kun http anstataŭ https", "http://samideanoj.example"],
    ["kun Origin null", "null"],
  ])("rifuzas POST %s", (_nomo, origin) => {
    expect(originoValidas(peto("POST", origin), NIA)).toBe(false);
  });

  it.each(["PUT", "PATCH", "DELETE"])("rifuzas %s sen Origin", (m) => {
    expect(originoValidas(peto(m), NIA)).toBe(false);
  });
});

const { limigendaVojo } = await import("../src/middleware");

describe("limigendaVojo", () => {
  it.each([
    "/",
    "/es",
    "/es/",
    "/en/",
    "/sercxi",
    "/sercxi/",
    "/es/sercxi",
    "/en/sercxi/",
    "/s/marisol",
    "/es/s/lupe/",
  ])("%s estas limigita", (v) => expect(limigendaVojo(v)).toBe(true));
  it.each([
    "/estonio",
    "/mia-profilo",
    "/sercxilo",
    "/ensaluti",
    "/api/lokoj",
    "/sano",
    "/bildo/marisol",
  ])("%s ne", (v) => expect(limigendaVojo(v)).toBe(false));
});

const { aldoniSekurecajnKapojn, SEKURECAJ_KAPOJ } = await import("../src/middleware");

describe("sekurecaj kapoj", () => {
  it("aldonas ĉiujn kapojn", () => {
    const k = new Headers();
    aldoniSekurecajnKapojn(k);
    for (const [nomo, valoro] of Object.entries(SEKURECAJ_KAPOJ)) expect(k.get(nomo)).toBe(valoro);
    expect(k.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("gardas propran CSP (ekz. de /bildo aŭ de Astro), aldonante frame-ancestors", () => {
    const k = new Headers({ "Content-Security-Policy": "default-src 'none'; sandbox;" });
    aldoniSekurecajnKapojn(k);
    expect(k.get("Content-Security-Policy")).toBe(
      "default-src 'none'; sandbox; frame-ancestors 'none'",
    );
    aldoniSekurecajnKapojn(k);
    expect(k.get("Content-Security-Policy")).toBe(
      "default-src 'none'; sandbox; frame-ancestors 'none'",
    );
  });
});
