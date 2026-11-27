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
