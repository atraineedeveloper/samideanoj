import { describe, expect, it } from "vitest";
import { hmacSha256Hex, pkceDefio, sha256Bajtoj } from "../src/lib/kripto";
import {
  githubRajtigaUrl,
  googleRajtigaUrl,
  googleSubElIdJxetono,
  legiAgordojn,
  sekuraReveno,
  telegramaIdentigilo,
  telegramajAtributoj,
} from "../src/lib/provizantoj";

const BAZAJ = {
  klientoId: "kliento",
  revokoUrl: "https://ekz.dev/revoko",
  stato: "s",
  pkceDefio: "d",
};

describe("ADR 0006: minimumaj permesoj", () => {
  it("Google petas nur la skopon openid", () => {
    const url = new URL(googleRajtigaUrl(BAZAJ));
    expect(url.searchParams.get("scope")).toBe("openid");
    expect(url.searchParams.get("access_type")).toBeNull();
  });

  it("GitHub petas neniun skopon", () => {
    const url = new URL(githubRajtigaUrl(BAZAJ));
    expect(url.searchParams.has("scope")).toBe(false);
  });

  it("Telegramo neniam petas skribpermeson", () => {
    const atributoj = telegramajAtributoj("SamideanojBot", "https://ekz.dev/revoko");
    expect(Object.keys(atributoj)).not.toContain("data-request-access");
  });

  it("ambaŭ OAuth-fluoj uzas state kaj PKCE S256", () => {
    for (const ligilo of [googleRajtigaUrl(BAZAJ), githubRajtigaUrl(BAZAJ)]) {
      const p = new URL(ligilo).searchParams;
      expect(p.get("state")).toBe("s");
      expect(p.get("code_challenge")).toBe("d");
      expect(p.get("code_challenge_method")).toBe("S256");
    }
  });
});

describe("PKCE", () => {
  it("kalkulas la defion laŭ la ekzemplo de RFC 7636", async () => {
    expect(await pkceDefio("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
});

function falsaIdJxetono(asertoj: Record<string, unknown>): string {
  const kodi = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, "");
  return `${kodi({ alg: "RS256" })}.${kodi(asertoj)}.subskribo`;
}

describe("googleSubElIdJxetono", () => {
  const NUN = 1_800_000_000;
  const bonaj = {
    iss: "https://accounts.google.com",
    aud: "kliento",
    exp: NUN + 60,
    sub: "1234567890",
  };

  it("akceptas validan ĵetonon", () => {
    expect(googleSubElIdJxetono(falsaIdJxetono(bonaj), "kliento", NUN)).toBe("1234567890");
  });

  it.each([
    ["alia eldoninto", { ...bonaj, iss: "https://malica.example" }],
    ["alia kliento", { ...bonaj, aud: "alia" }],
    ["eksvalidiĝinta", { ...bonaj, exp: NUN - 1 }],
    ["sen sub", { ...bonaj, sub: undefined }],
    ["stranga sub", { ...bonaj, sub: "../admin" }],
  ])("malakceptas: %s", (_nomo, asertoj) => {
    expect(googleSubElIdJxetono(falsaIdJxetono(asertoj), "kliento", NUN)).toBeNull();
  });

  it("malakceptas misformitan ĵetonon", () => {
    expect(googleSubElIdJxetono("ne.jxetono", "kliento", NUN)).toBeNull();
    expect(googleSubElIdJxetono("a.%%%.c", "kliento", NUN)).toBeNull();
  });
});

describe("telegramaIdentigilo", () => {
  const JXETONO = "123456:ABC-roboto";
  const NUN = 1_800_000_000;

  async function subskribitaj(datumoj: Record<string, string>) {
    const teksto = Object.keys(datumoj)
      .sort()
      .map((k) => `${k}=${datumoj[k]}`)
      .join("\n");
    const hash = await hmacSha256Hex(await sha256Bajtoj(JXETONO), teksto);
    return new URLSearchParams({ ...datumoj, hash });
  }

  const datumoj = {
    id: "42",
    first_name: "Marisol",
    username: "marisol_eo",
    auth_date: String(NUN),
  };

  it("akceptas ĝustan subskribon", async () => {
    expect(await telegramaIdentigilo(await subskribitaj(datumoj), JXETONO, NUN)).toBe("42");
  });

  it("ignoras niajn proprajn parametrojn reveno kaj lingvo", async () => {
    const p = await subskribitaj(datumoj);
    p.set("reveno", "/s/tomaso");
    p.set("lingvo", "es");
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBe("42");
  });

  it("malakceptas ŝanĝitan identigilon", async () => {
    const p = await subskribitaj(datumoj);
    p.set("id", "43");
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBeNull();
  });

  it("malakceptas subskribon per alia roboto", async () => {
    expect(await telegramaIdentigilo(await subskribitaj(datumoj), "alia:jxetono", NUN)).toBeNull();
  });

  it("malakceptas datumojn pli malnovajn ol 5 minutoj", async () => {
    const p = await subskribitaj({ ...datumoj, auth_date: String(NUN - 301) });
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBeNull();
  });

  it("malakceptas datumojn el la estonteco", async () => {
    const p = await subskribitaj({ ...datumoj, auth_date: String(NUN + 120) });
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBeNull();
  });

  it("malakceptas mankantan aŭ misformitan hash", async () => {
    const p = await subskribitaj(datumoj);
    p.set("hash", "ne-hash");
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBeNull();
    p.delete("hash");
    expect(await telegramaIdentigilo(p, JXETONO, NUN)).toBeNull();
  });
});

describe("sekuraReveno", () => {
  it.each(["/s/marisol", "/es/", "/"])("akceptas lokan vojon %s", (v) => {
    expect(sekuraReveno(v)).toBe(v);
  });

  it.each([
    "https://malica.example",
    "//malica.example",
    "/\\malica.example",
    "javascript:alert(1)",
    "s/marisol",
    "/s\r\nSet-Cookie: x=y",
    "",
    null,
  ])("malakceptas %s", (v) => {
    expect(sekuraReveno(v)).toBeNull();
  });
});

describe("legiAgordojn", () => {
  it("ŝaltas provizanton nur kun kompleta agordo", () => {
    const a = legiAgordojn({
      GOOGLE_CLIENT_ID: "id",
      GOOGLE_CLIENT_SECRET: "sekreto",
      GITHUB_CLIENT_ID: "id",
      TELEGRAM_BOT_NAME: "  ",
      TELEGRAM_BOT_TOKEN: "jxetono",
    });
    expect(a.google).toEqual({ klientoId: "id", klientoSekreto: "sekreto" });
    expect(a.github).toBeUndefined();
    expect(a.telegramo).toBeUndefined();
  });
});
