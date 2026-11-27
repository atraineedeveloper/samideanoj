/**
 * Profilbildo: elekto, konverto en la retumilo kaj alŝuto. Vidu docs/profilbildoj.md.
 *
 * La retumilo eltondas centran kvadraton, malgrandigas ĝin al 256×256 kaj kodas
 * ĝin kiel WebP (aŭ JPEG, se la retumilo ne povas krei WebP, ekz. Safari).
 * La nova kodado forigas ĉiujn metadatenojn (EXIF, GPS). La servilo kontrolas
 * ĉion denove.
 */

import { useId, useRef, useState } from "react";

const FLANKO = 256;
const MIN_FLANKO = 64;
const KVALITOJ = [0.82, 0.7, 0.55, 0.4];

interface Props {
  bildo: { url: string | null; videbleco: string; kasxitaDeModeriganto: boolean };
  kromnomo: string;
  videblecoj: { valoro: string; nomo: string }[];
  maksBajtoj: number;
  tekstoj: Record<string, string>;
}

type Stato =
  | { tipo: "senago" }
  | { tipo: "laboranta" }
  | { tipo: "sukceso"; mesagxo: string }
  | { tipo: "eraro"; mesagxo: string };

class BildaEraro extends Error {}

interface ServilaRespondo {
  bone?: boolean;
  versio?: number;
  eraro?: string;
}

function alBlob(kanvaso: HTMLCanvasElement, tipo: string, kvalito: number): Promise<Blob | null> {
  return new Promise((solvi) => kanvaso.toBlob(solvi, tipo, kvalito));
}

async function konverti(dosiero: File, maksBajtoj: number): Promise<Blob> {
  let bitmapo: ImageBitmap;
  try {
    // La orientiĝo de la foto (EXIF) estas aplikata antaŭ ol la metadatenoj malaperas.
    bitmapo = await createImageBitmap(dosiero, { imageOrientation: "from-image" });
  } catch {
    throw new BildaEraro("ne-legebla");
  }

  const flanko = Math.min(bitmapo.width, bitmapo.height);
  if (flanko < MIN_FLANKO) throw new BildaEraro("tro-malgranda");
  const celo = Math.min(FLANKO, flanko);

  const kanvaso = document.createElement("canvas");
  kanvaso.width = celo;
  kanvaso.height = celo;
  const ctx = kanvaso.getContext("2d");
  if (!ctx) throw new BildaEraro("ne-legebla");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, celo, celo);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bitmapo,
    (bitmapo.width - flanko) / 2,
    (bitmapo.height - flanko) / 2,
    flanko,
    flanko,
    0,
    0,
    celo,
    celo,
  );
  bitmapo.close();

  for (const kvalito of KVALITOJ) {
    let blob = await alBlob(kanvaso, "image/webp", kvalito);
    // Safari redonas PNG anstataŭ WebP: tiam ni uzas JPEG.
    if (blob?.type !== "image/webp") blob = await alBlob(kanvaso, "image/jpeg", kvalito);
    if (blob && blob.size <= maksBajtoj) return blob;
  }
  throw new BildaEraro("tro-granda");
}

export default function BildoRedaktilo(props: Props) {
  const t = props.tekstoj;
  const id = useId();
  const enigo = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(props.bildo.url);
  const [videbleco, setVidebleco] = useState(props.bildo.videbleco);
  const [stato, setStato] = useState<Stato>({ tipo: "senago" });

  const eraroTeksto = (kodo: string) => t[`bildo.eraro.${kodo}`] ?? t["bildo.eraro.gxenerala"];

  /** Sendas al la servilo; neniam ĵetas escepton. */
  async function sendi(datumoj: FormData): Promise<ServilaRespondo> {
    try {
      const respondo = await fetch("/mia-profilo/bildo", { method: "POST", body: datumoj });
      return (await respondo.json()) as ServilaRespondo;
    } catch {
      return { eraro: "gxenerala" };
    }
  }

  async function elektiDosieron(dosiero: File | undefined) {
    if (!dosiero) return;
    setStato({ tipo: "laboranta" });
    try {
      const blob = await konverti(dosiero, props.maksBajtoj);
      const datumoj = new FormData();
      datumoj.set("ago", "alsxuti");
      datumoj.set("videbleco", videbleco);
      datumoj.set("bildo", blob, blob.type === "image/webp" ? "bildo.webp" : "bildo.jpg");
      const r = await sendi(datumoj);
      if (!r.bone) throw new BildaEraro(r.eraro ?? "gxenerala");
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
      setStato({ tipo: "sukceso", mesagxo: t["bildo.konservita"] });
    } catch (e) {
      setStato({
        tipo: "eraro",
        mesagxo: eraroTeksto(e instanceof BildaEraro ? e.message : "gxenerala"),
      });
    } finally {
      if (enigo.current) enigo.current.value = "";
    }
  }

  async function forigi() {
    setStato({ tipo: "laboranta" });
    const datumoj = new FormData();
    datumoj.set("ago", "forigi");
    const r = await sendi(datumoj);
    if (r.bone) {
      setUrl(null);
      setStato({ tipo: "sukceso", mesagxo: t["bildo.forigita"] });
    } else {
      setStato({ tipo: "eraro", mesagxo: eraroTeksto("gxenerala") });
    }
  }

  async function sxangxiVideblecon(nova: string) {
    const malnova = videbleco;
    setVidebleco(nova);
    if (!url) return;
    setStato({ tipo: "laboranta" });
    const datumoj = new FormData();
    datumoj.set("ago", "videbleco");
    datumoj.set("videbleco", nova);
    const r = await sendi(datumoj);
    if (r.bone) {
      setStato({ tipo: "sukceso", mesagxo: t["bildo.konservita"] });
    } else {
      setVidebleco(malnova);
      setStato({ tipo: "eraro", mesagxo: eraroTeksto("gxenerala") });
    }
  }

  const laboranta = stato.tipo === "laboranta";

  return (
    <fieldset className="bildo-redaktilo" aria-busy={laboranta}>
      <legend>{t["bildo.titolo"]}</legend>
      <div className="bildo-linio">
        <div className="bildo-antauxvido">
          {url ? (
            <img src={url} alt={t["bildo.via-bildo"]} width={96} height={96} />
          ) : (
            <span aria-hidden="true">{props.kromnomo.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="bildo-agoj">
          <input
            ref={enigo}
            id={`${id}-dosiero`}
            className="kasxita-etikedo"
            type="file"
            accept="image/*"
            disabled={laboranta}
            onChange={(e) => elektiDosieron(e.currentTarget.files?.[0])}
          />
          <label className="aldoni" htmlFor={`${id}-dosiero`}>
            {url ? t["bildo.sxangxi"] : t["bildo.elekti"]}
          </label>
          {url && (
            <button type="button" className="forigi" onClick={forigi} disabled={laboranta}>
              {t["bildo.forigi"]}
            </button>
          )}
        </div>
      </div>
      <p className="helpo">{t["bildo.helpo"]}</p>
      {props.bildo.kasxitaDeModeriganto && url && (
        <p className="avizo">{t["bildo.kasxita-de-moderiganto"]}</p>
      )}
      <div className="kampo">
        <label htmlFor={`${id}-videbleco`}>{t["redakti.kiu-vidas"]}</label>
        <select
          id={`${id}-videbleco`}
          value={videbleco}
          disabled={laboranta}
          onChange={(e) => sxangxiVideblecon(e.currentTarget.value)}
        >
          {props.videblecoj.map((o) => (
            <option key={o.valoro} value={o.valoro}>
              {o.nomo}
            </option>
          ))}
        </select>
      </div>
      <p className={stato.tipo === "eraro" ? "eraro" : "helpo"} role="status" aria-live="polite">
        {laboranta ? t["bildo.laboranta"] : stato.tipo === "senago" ? "" : stato.mesagxo}
      </p>
    </fieldset>
  );
}
