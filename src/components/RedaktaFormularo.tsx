/**
 * Redakta formularo de la profilo (React-insulo, ADR 0003), laŭ la prototipo
 * (docs/fazo-2/prototipo/labortablo/redakti.html):
 * - tabelo "Kampo | Kiu povas vidi?";
 * - tabelo de kontaktiloj;
 * - antaŭvido "Tiel aliaj vidas vin" (vizitanto / ensalutinto), ĝisdatigita
 *   dum oni tajpas.
 * Ĝi restas ordinara HTML-formularo (method="post"); la servilo validigas ĉion
 * denove (src/lib/profilaRedakto.ts). La nomoj de la kampoj ne ŝanĝiĝis.
 */

import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProfilaEraro } from "../lib/profilaRedakto";
import type { RedaktajValoroj } from "../lib/redaktaPagxo";
import LokoSercxilo from "./LokoSercxilo";

interface Opcio {
  valoro: string;
  nomo: string;
}

export interface RedaktaFormularoProps {
  valoroj: RedaktajValoroj;
  eraroj: ProfilaEraro[];
  opcioj: {
    landoj: Opcio[];
    lingvoj: Opcio[];
    interesoj: Opcio[];
    niveloj: Opcio[];
    ligilajTipoj: Opcio[];
    videblecoj: Opcio[];
  };
  tekstoj: Record<string, string>;
  maksLigiloj: number;
  /** La nuna profilbildo, por la antaŭvido. */
  bildo: { url: string | null; videbleco: string };
  /** La profilbilda insulo (BildoRedaktilo), montrata super la tabelo. */
  children?: ReactNode;
}

type Vico = { sxlosilo: number; tipo: string; valoro: string; videbleco: string };

type Vivaj = {
  kromnomo: string;
  nivelo: string;
  lando: string;
  loko: string;
  lokoEtikedo: string;
  priskribo: string;
  vid: Record<string, string>;
  lingvoj: string[];
  interesoj: string[];
  ligiloj: { tipo: string; valoro: string; videbleco: string }[];
};

function legi(f: HTMLFormElement): Vivaj {
  const d = new FormData(f);
  const s = (k: string) => (d.get(k) ?? "").toString();
  const cxiuj = (k: string) => d.getAll(k).map(String);
  const tipoj = cxiuj("ligilo_tipo");
  const valoroj = cxiuj("ligilo_valoro");
  const vidoj = cxiuj("ligilo_videbleco");
  return {
    kromnomo: s("kromnomo"),
    nivelo: s("nivelo"),
    lando: s("lando"),
    loko: s("loko"),
    lokoEtikedo: s("loko_etikedo"),
    priskribo: s("priskribo"),
    vid: {
      vid_regiono: s("vid_regiono"),
      vid_urbo: s("vid_urbo"),
      vid_priskribo: s("vid_priskribo"),
      vid_lingvoj: s("vid_lingvoj"),
      vid_interesoj: s("vid_interesoj"),
    },
    lingvoj: cxiuj("lingvoj"),
    interesoj: cxiuj("interesoj"),
    ligiloj: tipoj.map((tipo, i) => ({
      tipo,
      valoro: valoroj[i] ?? "",
      videbleco: vidoj[i] ?? "",
    })),
  };
}

function el(v: RedaktajValoroj): Vivaj {
  return {
    kromnomo: v.kromnomo,
    nivelo: v.nivelo,
    lando: v.lando,
    loko: v.loko,
    lokoEtikedo: v.lokoEtikedo,
    priskribo: v.priskribo,
    vid: {
      vid_regiono: v.vid_regiono || "publika",
      vid_urbo: v.vid_urbo || "publika",
      vid_priskribo: v.vid_priskribo || "publika",
      vid_lingvoj: v.vid_lingvoj || "publika",
      vid_interesoj: v.vid_interesoj || "publika",
    },
    lingvoj: v.lingvoj,
    interesoj: v.interesoj,
    ligiloj: v.ligiloj,
  };
}

function VideblecoElektilo(props: {
  nomo: string;
  valoro: string;
  nuna: string;
  opcioj: Opcio[];
  etikedo: string;
}) {
  const id = useId();
  return (
    <div className="videbleco">
      <label htmlFor={id} className="kasxita-etikedo">
        {props.etikedo}
      </label>
      <select
        id={id}
        name={props.nomo}
        defaultValue={props.valoro || "publika"}
        data-v={props.nuna}
      >
        {props.opcioj.map((o) => (
          <option key={o.valoro} value={o.valoro}>
            {o.nomo}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Unu vico de la tabelo "Kampo | Kiu povas vidi?". */
function Vico(props: { children: ReactNode; videbleco: ReactNode; supre?: boolean }) {
  return (
    <div className={props.supre ? "vico supre" : "vico"}>
      <div className="kampo">{props.children}</div>
      <div className="vid-kolumno">{props.videbleco}</div>
    </div>
  );
}

function Antauxvido(props: { v: Vivaj; p: RedaktaFormularoProps }) {
  const { v, p } = props;
  const t = p.tekstoj;
  const [ensalutinto, setEnsalutinto] = useState(false);
  const vidas = (vid: string) => vid === "publika" || (ensalutinto && vid === "ensalutintoj");
  const sxlosita = (vid: string) => !ensalutinto && vid === "ensalutintoj";
  const nomoDe = (o: Opcio[], valoro: string) => o.find((x) => x.valoro === valoro)?.nomo ?? valoro;

  const [urboParto, regionoParto] = v.lokoEtikedo.split(", ");
  const estasUrbo = v.loko.startsWith("urbo:");
  const loko = [
    estasUrbo && vidas(v.vid.vid_urbo) ? urboParto : null,
    vidas(v.vid.vid_regiono)
      ? estasUrbo
        ? regionoParto
        : v.lokoEtikedo.replace(/ \(.*\)$/, "")
      : null,
    v.lando ? nomoDe(p.opcioj.landoj, v.lando) : null,
  ]
    .filter(Boolean)
    .join(", ");
  const ligiloj = v.ligiloj.filter((l) => l.valoro.trim() && l.videbleco !== "kasxita");
  const kasxitaj =
    v.ligiloj.some((l) => l.valoro.trim() && l.videbleco === "kasxita") ||
    Object.values(v.vid).includes("kasxita");
  const bildo = p.bildo.url && vidas(p.bildo.videbleco) ? p.bildo.url : null;

  return (
    <aside className="antauxvido" id="antauxvido" aria-labelledby="antauxvido-titolo">
      <h2 id="antauxvido-titolo">{t["redakti.tiel-aliaj"]}</h2>
      <div className="vidpunkto" role="group" aria-label={t["redakti.vidpunkto"]}>
        <button type="button" aria-pressed={!ensalutinto} onClick={() => setEnsalutinto(false)}>
          {t["redakti.vizitanto"]}
        </button>
        <button type="button" aria-pressed={ensalutinto} onClick={() => setEnsalutinto(true)}>
          {t["redakti.ensalutinto"]}
        </button>
      </div>
      <div className="antauxvida-karto" aria-live="polite">
        <div className="identeco">
          <div className="avataro" aria-hidden="true">
            {bildo ? (
              <img src={bildo} alt="" width={52} height={52} />
            ) : (
              (v.kromnomo || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <strong>{v.kromnomo || "—"}</strong>
            <span>{[nomoDe(p.opcioj.niveloj, v.nivelo), loko].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
        {v.priskribo.trim() && vidas(v.vid.vid_priskribo) && (
          <p className="priskribo">{v.priskribo}</p>
        )}
        {v.interesoj.length > 0 && vidas(v.vid.vid_interesoj) && (
          <p className="detalo">
            {v.interesoj.map((i) => nomoDe(p.opcioj.interesoj, i)).join(" · ")}
          </p>
        )}
        {v.lingvoj.length > 0 && vidas(v.vid.vid_lingvoj) && (
          <p className="detalo">{v.lingvoj.map((l) => nomoDe(p.opcioj.lingvoj, l)).join(", ")}</p>
        )}
        {ligiloj.length > 0 && (
          <ul>
            {ligiloj.map((l, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: la vicoj ne havas stabilan identigilon
              <li key={i} className={sxlosita(l.videbleco) ? "sxlosita" : undefined}>
                <span>{nomoDe(p.opcioj.ligilajTipoj, l.tipo)}</span>
                <span>{sxlosita(l.videbleco) ? t["redakti.nur-ensalutintoj"] : l.valoro}</span>
              </li>
            ))}
          </ul>
        )}
        {kasxitaj && <p className="noto">{t["redakti.kasxitaj-avizo"]}</p>}
      </div>
    </aside>
  );
}

export default function RedaktaFormularo(props: RedaktaFormularoProps) {
  const { valoroj: v, opcioj: o, tekstoj: t } = props;
  const eraras = (kampo: ProfilaEraro["kampo"]) => props.eraroj.some((e) => e.kampo === kampo);
  const ligilaEraro = (i: number) =>
    props.eraroj.some((e) => e.kampo === "ligilo" && e.indekso === i);

  const formularo = useRef<HTMLFormElement>(null);
  const [vivaj, setVivaj] = useState<Vivaj>(() => el(v));
  const [lando, setLando] = useState(v.lando);
  const [priskribo, setPriskribo] = useState(v.priskribo);
  const sekva = useRef(v.ligiloj.length);
  const [vicoj, setVicoj] = useState<Vico[]>(() =>
    v.ligiloj.map((l, i) => ({ sxlosilo: i, ...l })),
  );
  const lingvoj = useMemo(() => new Set(v.lingvoj), [v.lingvoj]);
  const interesoj = useMemo(() => new Set(v.interesoj), [v.interesoj]);
  const ids = {
    kromnomo: useId(),
    nivelo: useId(),
    priskribo: useId(),
    lando: useId(),
  };

  const gxisdatigi = useCallback(() => {
    if (formularo.current) setVivaj(legi(formularo.current));
  }, []);
  // Post aldono aŭ forigo de vico, kaj post elekto de loko (kaŝitaj kampoj sen input-evento).
  // biome-ignore lint/correctness/useExhaustiveDependencies: ni volas reagi al ĉi tiuj ŝanĝoj
  useEffect(() => {
    gxisdatigi();
  }, [vicoj, lando, gxisdatigi]);

  const aldoniVicon = () =>
    setVicoj((n) =>
      n.length >= props.maksLigiloj
        ? n
        : [
            ...n,
            { sxlosilo: sekva.current++, tipo: "telegramo", valoro: "", videbleco: "ensalutintoj" },
          ],
    );

  const vid = (nomo: string, etikedo: string, valoro: string) => (
    <VideblecoElektilo
      nomo={nomo}
      valoro={valoro}
      nuna={vivaj.vid[nomo] ?? valoro}
      opcioj={o.videblecoj}
      etikedo={`${etikedo}: ${t["redakti.kiu-vidas"]}`}
    />
  );
  const cxiamPublika = <span className="cxiam">{t["redakti.cxiam-publika"]}</span>;

  return (
    <div className="redakta-krado">
      <div className="formulara-kolumno">
        {props.children}
        <form
          method="post"
          className="redakto"
          id="redakta-formularo"
          noValidate
          ref={formularo}
          onInput={gxisdatigi}
          onChange={gxisdatigi}
        >
          {props.eraroj.length > 0 && (
            <p className="eraro-resumo" role="alert">
              {t["redakti.eraroj"]}
            </p>
          )}

          <section className="tabelo" aria-label={t["redakti.pri-vi"]}>
            <div className="tabelkapo" aria-hidden="true">
              <span>{t["redakti.kampo"]}</span>
              <span>{t["redakti.kiu-vidas"]}</span>
            </div>

            <Vico videbleco={cxiamPublika}>
              <label htmlFor={ids.kromnomo}>{t["aligxi.kromnomo"]}</label>
              <input
                id={ids.kromnomo}
                name="kromnomo"
                type="text"
                required
                maxLength={60}
                defaultValue={v.kromnomo}
                aria-invalid={eraras("kromnomo") || undefined}
              />
              {eraras("kromnomo") && <p className="eraro">{t["redakti.eraro.kromnomo"]}</p>}
            </Vico>

            <Vico videbleco={cxiamPublika}>
              <label htmlFor={ids.nivelo}>{t["aligxi.nivelo"]}</label>
              <select id={ids.nivelo} name="nivelo" defaultValue={v.nivelo}>
                {o.niveloj.map((n) => (
                  <option key={n.valoro} value={n.valoro}>
                    {n.nomo}
                  </option>
                ))}
              </select>
            </Vico>

            <Vico videbleco={cxiamPublika}>
              <label htmlFor={ids.lando}>{t["aligxi.lando"]}</label>
              <select
                id={ids.lando}
                name="lando"
                value={lando}
                onChange={(e) => setLando(e.target.value)}
                aria-invalid={eraras("lando") || undefined}
              >
                <option value="">{t["aligxi.lando-elektu"]}</option>
                {o.landoj.map((l) => (
                  <option key={l.valoro} value={l.valoro}>
                    {l.nomo}
                  </option>
                ))}
              </select>
              {eraras("lando") && <p className="eraro">{t["redakti.eraro.lando"]}</p>}
            </Vico>

            <Vico videbleco={vid("vid_urbo", t["redakti.urbo"], v.vid_urbo)}>
              <LokoSercxilo
                lando={lando}
                valoro={v.loko}
                etikedo={v.lokoEtikedo}
                tekstoj={t}
                eraras={eraras("loko")}
                onSxangxo={() => setTimeout(gxisdatigi, 0)}
              />
              <p className="helpo">{t["redakti.loko-helpo"]}</p>
            </Vico>

            <Vico videbleco={vid("vid_regiono", t["redakti.regiono"], v.vid_regiono)}>
              <span className="etikedo">{t["redakti.regiono"]}</span>
              <span className="valoro">
                {vivaj.loko.startsWith("urbo:")
                  ? (vivaj.lokoEtikedo.split(", ")[1] ?? "—")
                  : vivaj.loko
                    ? vivaj.lokoEtikedo.replace(/ \(.*\)$/, "")
                    : "—"}
              </span>
            </Vico>

            <Vico supre videbleco={vid("vid_priskribo", t["redakti.priskribo"], v.vid_priskribo)}>
              <label htmlFor={ids.priskribo}>{t["redakti.priskribo"]}</label>
              <textarea
                id={ids.priskribo}
                name="priskribo"
                rows={3}
                maxLength={500}
                value={priskribo}
                onChange={(e) => setPriskribo(e.target.value)}
                aria-invalid={eraras("priskribo") || undefined}
              />
              <p className="helpo">
                {t["redakti.priskribo-helpo"]}{" "}
                <span className="nombrilo">{priskribo.length}/500</span>
              </p>
              {eraras("priskribo") && <p className="eraro">{t["redakti.eraro.priskribo"]}</p>}
            </Vico>

            <Vico supre videbleco={vid("vid_lingvoj", t["redakti.lingvoj"], v.vid_lingvoj)}>
              <fieldset>
                <legend>{t["redakti.lingvoj"]}</legend>
                <div className="blatoj">
                  {o.lingvoj.map((l) => (
                    <label key={l.valoro} className="blato">
                      <input
                        type="checkbox"
                        name="lingvoj"
                        value={l.valoro}
                        defaultChecked={lingvoj.has(l.valoro)}
                      />
                      <span>{l.nomo}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {eraras("lingvoj") && <p className="eraro">{t["redakti.eraro.gxenerala"]}</p>}
            </Vico>

            <Vico supre videbleco={vid("vid_interesoj", t["redakti.interesoj"], v.vid_interesoj)}>
              <fieldset>
                <legend>{t["redakti.interesoj"]}</legend>
                <div className="blatoj">
                  {o.interesoj.map((i) => (
                    <label key={i.valoro} className="blato">
                      <input
                        type="checkbox"
                        name="interesoj"
                        value={i.valoro}
                        defaultChecked={interesoj.has(i.valoro)}
                      />
                      <span>{i.nomo}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {eraras("interesoj") && <p className="eraro">{t["redakti.eraro.gxenerala"]}</p>}
            </Vico>
          </section>

          <h2 className="sekcio-titolo">{t["redakti.kontaktiloj"]}</h2>
          <p className="helpo">{t["redakti.kontaktiloj-helpo"]}</p>
          {vicoj.length > 0 && (
            <ul className="tabelo kontaktiloj">
              {vicoj.map((vico, i) => (
                <li key={vico.sxlosilo} className={ligilaEraro(i) ? "eraras" : undefined}>
                  <label>
                    <span className="kasxita-etikedo">{t["redakti.tipo"]}</span>
                    <select name="ligilo_tipo" defaultValue={vico.tipo}>
                      {o.ligilajTipoj.map((tipo) => (
                        <option key={tipo.valoro} value={tipo.valoro}>
                          {tipo.nomo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="valoro">
                    <span className="kasxita-etikedo">{t["redakti.valoro"]}</span>
                    <input
                      type="text"
                      name="ligilo_valoro"
                      defaultValue={vico.valoro}
                      placeholder={t["redakti.valoro"]}
                      maxLength={300}
                      aria-invalid={ligilaEraro(i) || undefined}
                    />
                  </label>
                  <label>
                    <span className="kasxita-etikedo">{t["redakti.kiu-vidas"]}</span>
                    <select
                      name="ligilo_videbleco"
                      defaultValue={vico.videbleco}
                      data-v={vivaj.ligiloj[i]?.videbleco ?? vico.videbleco}
                    >
                      {o.videblecoj.map((vd) => (
                        <option key={vd.valoro} value={vd.valoro}>
                          {vd.nomo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="forigi"
                    aria-label={`${t["redakti.forigi"]}: ${o.ligilajTipoj.find((x) => x.valoro === (vivaj.ligiloj[i]?.tipo ?? vico.tipo))?.nomo ?? ""}`}
                    onClick={() => setVicoj((n) => n.filter((x) => x.sxlosilo !== vico.sxlosilo))}
                  >
                    ×
                  </button>
                  {ligilaEraro(i) && <p className="eraro">{t["redakti.eraro.ligilo"]}</p>}
                </li>
              ))}
            </ul>
          )}
          {eraras("ligiloj") && <p className="eraro">{t["redakti.eraro.ligiloj"]}</p>}
          {vicoj.length < props.maksLigiloj && (
            <button type="button" className="aldoni" onClick={aldoniVicon}>
              + {t["redakti.aldoni-kontaktilon"]}
            </button>
          )}

          <div className="agoj">
            <button type="submit" className="konservi">
              {t["redakti.konservi"]}
            </button>
          </div>
        </form>
      </div>
      <Antauxvido v={vivaj} p={props} />
    </div>
  );
}
