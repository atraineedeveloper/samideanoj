import { describe, expect, it } from "vitest";
import { montrebla, normigi } from "../src/lib/ligiloj";
import { LIGILAJ_TIPOJ, type LigilaTipo } from "../src/lib/tipoj";

describe("normigi: validaj enigoj", () => {
  const kazoj: [LigilaTipo, string, string][] = [
    ["telegramo", "@marisol_eo", "marisol_eo"],
    ["telegramo", "marisol_eo", "marisol_eo"],
    ["instagram", "@marisol.legas", "marisol.legas"],
    ["x", "@samideano", "samideano"],
    ["tiktok", "esperanto.ok", "esperanto.ok"],
    ["youtube", "@EsperantoTV", "EsperantoTV"],
    ["discord", "marisol.eo", "marisol.eo"],
    ["fejsbuko", "marisol.garcia", "marisol.garcia"],
    ["whatsapp", "+52 55 1234 5678", "+525512345678"],
    ["whatsapp", "525512345678", "+525512345678"],
    ["signal", "+52 (55) 1234-5678", "+525512345678"],
    ["mastodon", "@marisol@Esperanto.Masto.Host", "@marisol@esperanto.masto.host"],
    ["mastodon", "marisol@mastodon.social", "@marisol@mastodon.social"],
    ["bluesky", "@marisol.bsky.social", "marisol.bsky.social"],
    ["retposxto", "marisol@example.org", "marisol@example.org"],
    ["retejo", "https://example.org/pri-mi", "https://example.org/pri-mi"],
    ["lernu", "https://lernu.net/profilo/marisol", "https://lernu.net/profilo/marisol"],
    ["pasporta_servo", "https://pasportaservo.org/ejo/123/", "https://pasportaservo.org/ejo/123/"],
    ["amikumu", "https://www.amikumu.com/u/marisol", "https://www.amikumu.com/u/marisol"],
  ];
  for (const [tipo, enigo, atendata] of kazoj) {
    it(`${tipo}: "${enigo}"`, () => {
      expect(normigi(tipo, enigo)).toEqual({ bone: true, valoro: atendata });
    });
  }
});

describe("normigi: malvalidaj kaj danĝeraj enigoj", () => {
  const kazoj: [LigilaTipo, string][] = [
    ["telegramo", "abc"],
    ["telegramo", "marisol eo"],
    ["telegramo", "<script>"],
    ["instagram", "nomo/../admin"],
    ["x", "nomo_tro_longa_por_x"],
    ["whatsapp", "123"],
    ["whatsapp", "telefonu-min"],
    ["mastodon", "marisol"],
    ["mastodon", "@marisol@"],
    ["retposxto", "ne-retposxto"],
    ["retposxto", "a@b"],
    ["retejo", "http://example.org"],
    ["retejo", "javascript:alert(1)"],
    ["retejo", "data:text/html,<script>alert(1)</script>"],
    ["retejo", "https://uzanto:pasvorto@example.org"],
    ["retejo", "ne ligilo"],
    ["lernu", "https://lernu.net.malica.example/profilo"],
    ["lernu", "https://example.org/lernu.net"],
    ["pasporta_servo", "https://pasportaservo.org.example.com/"],
    ["amikumu", "http://amikumu.com/u/x"],
    ["discord", "Majuskloj"],
    ["telegramo", ""],
    ["telegramo", "   "],
  ];
  for (const [tipo, enigo] of kazoj) {
    it(`${tipo}: "${enigo}" estas malakceptita`, () => {
      expect(normigi(tipo, enigo)).toEqual({ bone: false });
    });
  }

  it("malakceptas tro longajn valorojn", () => {
    expect(normigi("retejo", `https://example.org/${"a".repeat(300)}`)).toEqual({ bone: false });
  });
});

describe("montrebla", () => {
  const kazoj: [LigilaTipo, string, string, string | null][] = [
    ["telegramo", "marisol_eo", "@marisol_eo", "https://t.me/marisol_eo"],
    ["instagram", "marisol.legas", "@marisol.legas", "https://www.instagram.com/marisol.legas/"],
    ["x", "samideano", "@samideano", "https://x.com/samideano"],
    ["tiktok", "esperanto.ok", "@esperanto.ok", "https://www.tiktok.com/@esperanto.ok"],
    ["youtube", "EsperantoTV", "@EsperantoTV", "https://www.youtube.com/@EsperantoTV"],
    ["fejsbuko", "marisol.garcia", "marisol.garcia", "https://www.facebook.com/marisol.garcia"],
    ["discord", "marisol.eo", "marisol.eo", null],
    ["whatsapp", "+525512345678", "+525512345678", "https://wa.me/525512345678"],
    ["signal", "+525512345678", "+525512345678", "https://signal.me/#p/+525512345678"],
    [
      "mastodon",
      "@marisol@mastodon.social",
      "@marisol@mastodon.social",
      "https://mastodon.social/@marisol",
    ],
    [
      "bluesky",
      "marisol.bsky.social",
      "@marisol.bsky.social",
      "https://bsky.app/profile/marisol.bsky.social",
    ],
    ["retposxto", "marisol@example.org", "marisol@example.org", "mailto:marisol@example.org"],
    ["retejo", "https://example.org/", "example.org", "https://example.org/"],
    [
      "lernu",
      "https://lernu.net/profilo/marisol",
      "lernu.net/profilo/marisol",
      "https://lernu.net/profilo/marisol",
    ],
  ];
  for (const [tipo, valoro, teksto, href] of kazoj) {
    it(`${tipo}: "${valoro}"`, () => {
      expect(montrebla(tipo, valoro)).toEqual({ teksto, href });
    });
  }

  it("nevalida konservita valoro neniam iĝas ligilo", () => {
    expect(montrebla("retejo", "javascript:alert(1)")).toEqual({
      teksto: "javascript:alert(1)",
      href: null,
    });
  });

  it("ĉiu ligilo uzas nur https: aŭ mailto:", () => {
    const ekzemploj: Record<LigilaTipo, string> = {
      telegramo: "marisol_eo",
      whatsapp: "+525512345678",
      signal: "+525512345678",
      discord: "marisol.eo",
      mastodon: "@m@mastodon.social",
      instagram: "m",
      fejsbuko: "marisol.garcia",
      x: "m",
      bluesky: "m.bsky.social",
      youtube: "mmm",
      tiktok: "mm",
      lernu: "https://lernu.net/",
      pasporta_servo: "https://pasportaservo.org/",
      amikumu: "https://amikumu.com/",
      retejo: "https://example.org/",
      retposxto: "m@example.org",
    };
    for (const tipo of LIGILAJ_TIPOJ) {
      const { href } = montrebla(tipo, ekzemploj[tipo]);
      if (href !== null) expect(href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });
});
