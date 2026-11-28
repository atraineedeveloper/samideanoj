import { describe, expect, it } from "vitest";
import {
  type Ligilo,
  type PlenaProfilo,
  type Rigardanto,
  VIDEBLECOJ,
  type Videbleco,
} from "../src/lib/tipoj";
import { filtriProfilon } from "../src/lib/videbleco";

const POSEDANTO_ID = "01POSEDANTO";

/** Valoroj kun unikaj markiloj, por kontroli ke nenio kaŝita likiĝas en la eligo. */
const SEKRETOJ = {
  urbo: "URBO-SEKRETO",
  regiono: "REGIONO-SEKRETO",
  priskribo: "PRISKRIBO-SEKRETO",
  lingvo: "zz",
  interesoj: "INTERESO-SEKRETO",
  ligilo: "LIGILO-SEKRETO",
};

function profilo(
  videbleco: Partial<PlenaProfilo["videbleco"]> = {},
  ligiloj: Ligilo[] = [],
  stato: PlenaProfilo["stato"] = "aktiva",
  bildo: PlenaProfilo["bildo"] = null,
): PlenaProfilo {
  return {
    id: POSEDANTO_ID,
    slug: "marisol",
    kromnomo: "Marisol",
    nivelo: "flua",
    priskribo: SEKRETOJ.priskribo,
    landoKodo: "MX",
    regiono: { id: "MX.15", nomo: SEKRETOJ.regiono },
    urbo: { id: 3515302, nomo: SEKRETOJ.urbo, nomoEo: null, landoKodo: "MX" },
    lingvoj: [SEKRETOJ.lingvo],
    interesoj: [SEKRETOJ.interesoj],
    ligiloj,
    bildo,
    videbleco: {
      regiono: "publika",
      urbo: "publika",
      priskribo: "publika",
      lingvoj: "publika",
      interesoj: "publika",
      ...videbleco,
    },
    stato,
    gxisdatigita: 1_790_000_000,
  };
}

const RIGARDANTOJ: Record<string, Rigardanto> = {
  vizitanto: { tipo: "vizitanto" },
  ensalutinto: { tipo: "ensalutinto", uzantoId: "01ALIA" },
  moderiganto: { tipo: "moderiganto", uzantoId: "01MODERIGANTO" },
  posedanto: { tipo: "ensalutinto", uzantoId: POSEDANTO_ID },
};

/** Ĉu ĉi tiu rigardanto rajtas vidi kampon kun ĉi tiu videbleco? (La specifo, skribita aparte.) */
function atendataVidas(rigardanto: string, videbleco: Videbleco): boolean {
  if (rigardanto === "posedanto") return true;
  if (videbleco === "publika") return true;
  if (videbleco === "ensalutintoj") return rigardanto !== "vizitanto";
  return false;
}

describe("filtriProfilon: personaj kampoj", () => {
  const kampoj = [
    { kampo: "regiono", legi: (p: ReturnType<typeof filtriProfilon>) => p?.regiono?.nomo },
    { kampo: "urbo", legi: (p: ReturnType<typeof filtriProfilon>) => p?.urbo?.nomo },
    { kampo: "priskribo", legi: (p: ReturnType<typeof filtriProfilon>) => p?.priskribo },
    { kampo: "lingvoj", legi: (p: ReturnType<typeof filtriProfilon>) => p?.lingvoj[0] },
    { kampo: "interesoj", legi: (p: ReturnType<typeof filtriProfilon>) => p?.interesoj[0] },
  ] as const;

  for (const { kampo, legi } of kampoj) {
    for (const videbleco of VIDEBLECOJ) {
      for (const [nomo, rigardanto] of Object.entries(RIGARDANTOJ)) {
        const vidas = atendataVidas(nomo, videbleco);
        it(`${kampo} "${videbleco}": ${nomo} ${vidas ? "vidas" : "ne vidas"}`, () => {
          const rezulto = filtriProfilon(profilo({ [kampo]: videbleco }), rigardanto);
          const valoro = legi(rezulto);
          if (vidas) {
            expect(valoro).toBeTruthy();
          } else {
            expect(valoro ?? null).toBeNull();
            const sekreto =
              kampo === "lingvoj"
                ? `"${SEKRETOJ.lingvo}"`
                : SEKRETOJ[kampo as keyof typeof SEKRETOJ];
            expect(JSON.stringify(rezulto)).not.toContain(sekreto);
          }
        });
      }
    }
  }
});

describe("filtriProfilon: ligiloj", () => {
  for (const videbleco of VIDEBLECOJ) {
    for (const [nomo, rigardanto] of Object.entries(RIGARDANTOJ)) {
      it(`ligilo "${videbleco}" por ${nomo}`, () => {
        const ligilo: Ligilo = { tipo: "telegramo", valoro: SEKRETOJ.ligilo, videbleco, ordo: 0 };
        const rezulto = filtriProfilon(profilo({}, [ligilo]), rigardanto);
        const json = JSON.stringify(rezulto);

        if (atendataVidas(nomo, videbleco)) {
          expect(rezulto?.ligiloj).toEqual([
            { tipo: "telegramo", sxlosita: false, valoro: SEKRETOJ.ligilo },
          ]);
        } else if (videbleco === "ensalutintoj") {
          // Vizitanto vidas nur la tipon, kun seruro.
          expect(rezulto?.ligiloj).toEqual([{ tipo: "telegramo", sxlosita: true }]);
          expect(json).not.toContain(SEKRETOJ.ligilo);
        } else {
          // Kaŝita: eĉ la ekzisto de la ligilo ne estas malkaŝita.
          expect(rezulto?.ligiloj).toEqual([]);
          expect(json).not.toContain(SEKRETOJ.ligilo);
          expect(json).not.toContain("telegramo");
        }
      });
    }
  }

  it("ordigas la ligilojn laŭ ilia ordo", () => {
    const ligiloj: Ligilo[] = [
      { tipo: "retejo", valoro: "https://b.example", videbleco: "publika", ordo: 2 },
      { tipo: "mastodon", valoro: "@a@example.social", videbleco: "publika", ordo: 1 },
    ];
    const rezulto = filtriProfilon(profilo({}, ligiloj), RIGARDANTOJ.vizitanto);
    expect(rezulto?.ligiloj.map((l) => l.tipo)).toEqual(["mastodon", "retejo"]);
  });
});

describe("filtriProfilon: ĝeneralaj reguloj", () => {
  it("kromnomo, nivelo kaj lando estas ĉiam publikaj", () => {
    const rezulto = filtriProfilon(
      profilo({
        regiono: "kasxita",
        urbo: "kasxita",
        priskribo: "kasxita",
        lingvoj: "kasxita",
        interesoj: "kasxita",
      }),
      RIGARDANTOJ.vizitanto,
    );
    expect(rezulto).toMatchObject({ kromnomo: "Marisol", nivelo: "flua", landoKodo: "MX" });
    expect(rezulto?.urbo).toBeNull();
    expect(rezulto?.regiono).toBeNull();
  });

  it("regiono kaj urbo havas sendependajn videblecojn", () => {
    const rezulto = filtriProfilon(
      profilo({ regiono: "publika", urbo: "kasxita" }),
      RIGARDANTOJ.vizitanto,
    );
    expect(rezulto?.regiono?.nomo).toBe(SEKRETOJ.regiono);
    expect(rezulto?.urbo).toBeNull();
    expect(JSON.stringify(rezulto)).not.toContain(SEKRETOJ.urbo);
  });

  it("indikas, ke ensaluto montrus pli, nur kiam tio veras", () => {
    expect(filtriProfilon(profilo(), RIGARDANTOJ.vizitanto)?.pliPostEnsaluto).toBe(false);
    expect(
      filtriProfilon(profilo({ urbo: "ensalutintoj" }), RIGARDANTOJ.vizitanto)?.pliPostEnsaluto,
    ).toBe(true);
    expect(
      filtriProfilon(profilo({ urbo: "kasxita" }), RIGARDANTOJ.vizitanto)?.pliPostEnsaluto,
    ).toBe(false);
    expect(
      filtriProfilon(profilo({ urbo: "ensalutintoj" }), RIGARDANTOJ.ensalutinto)?.pliPostEnsaluto,
    ).toBe(false);
  });

  it("rekonas la posedanton", () => {
    expect(filtriProfilon(profilo(), RIGARDANTOJ.posedanto)?.estasPosedanto).toBe(true);
    expect(filtriProfilon(profilo(), RIGARDANTOJ.ensalutinto)?.estasPosedanto).toBe(false);
  });

  it("ne elsendas la internan identigilon de la uzanto", () => {
    const json = JSON.stringify(filtriProfilon(profilo(), RIGARDANTOJ.vizitanto));
    expect(json).not.toContain(POSEDANTO_ID);
  });

  for (const stato of ["kasxita_de_moderiganto", "neaktiva"] as const) {
    it(`profilo "${stato}" estas videbla nur por posedanto kaj moderigantoj`, () => {
      const p = profilo({}, [], stato);
      expect(filtriProfilon(p, RIGARDANTOJ.vizitanto)).toBeNull();
      expect(filtriProfilon(p, RIGARDANTOJ.ensalutinto)).toBeNull();
      expect(filtriProfilon(p, RIGARDANTOJ.moderiganto)).not.toBeNull();
      expect(filtriProfilon(p, RIGARDANTOJ.posedanto)).not.toBeNull();
    });
  }

  it("moderiganto ne vidas kaŝitajn kampojn", () => {
    const rezulto = filtriProfilon(profilo({ priskribo: "kasxita" }), RIGARDANTOJ.moderiganto);
    expect(rezulto?.priskribo).toBeNull();
  });
});

describe("filtriProfilon: profilbildo", () => {
  const kunBildo = (videbleco: Videbleco, kasxitaDeModeriganto = false) =>
    profilo({}, [], "aktiva", { videbleco, kasxitaDeModeriganto, versio: 1_790_000_123 });

  for (const videbleco of VIDEBLECOJ) {
    for (const [nomo, rigardanto] of Object.entries(RIGARDANTOJ)) {
      it(`${videbleco} / ${nomo}`, () => {
        const atendita = atendataVidas(nomo, videbleco);
        expect(filtriProfilon(kunBildo(videbleco), rigardanto)?.bildo).toBe(
          atendita ? "/bildo/marisol?v=1790000123" : null,
        );
      });
    }
  }

  it("vizitanto ricevas avizon, ke ensalutintoj vidas pli", () => {
    expect(filtriProfilon(kunBildo("ensalutintoj"), RIGARDANTOJ.vizitanto)?.pliPostEnsaluto).toBe(
      true,
    );
  });

  it("bildo kaŝita de moderiganto: nur la posedanto kaj moderigantoj vidas ĝin", () => {
    const p = kunBildo("publika", true);
    expect(filtriProfilon(p, RIGARDANTOJ.vizitanto)?.bildo).toBeNull();
    expect(filtriProfilon(p, RIGARDANTOJ.ensalutinto)?.bildo).toBeNull();
    expect(filtriProfilon(p, RIGARDANTOJ.posedanto)?.bildo).not.toBeNull();
    expect(filtriProfilon(p, RIGARDANTOJ.moderiganto)?.bildo).not.toBeNull();
  });

  it("sen bildo: null por ĉiuj", () => {
    for (const r of Object.values(RIGARDANTOJ))
      expect(filtriProfilon(profilo(), r)?.bildo).toBeNull();
  });
});
