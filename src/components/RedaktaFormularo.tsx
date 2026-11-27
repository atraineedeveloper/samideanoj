/**
 * Redakta formularo de la profilo (React-insulo, ADR 0003).
 * Ĝi estas ordinara HTML-formularo (method="post"): React nur aldonas la
 * serĉilon de loko kaj la dinamikajn vicojn de kontaktiloj. La servilo
 * validigas ĉion denove (src/lib/profilaRedakto.ts).
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { TrovitaLoko } from "../lib/lokoj";
import type { ProfilaEraro } from "../lib/profilaRedakto";
import type { RedaktajValoroj } from "../lib/redaktaPagxo";

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
}

type Vico = { sxlosilo: number; tipo: string; valoro: string; videbleco: string };

function VideblecoElektilo(props: {
  nomo: string;
  valoro: string;
  opcioj: Opcio[];
  etikedo: string;
}) {
  const id = useId();
  return (
    <div className="videbleco">
      <label htmlFor={id}>{props.etikedo}</label>
      <select id={id} name={props.nomo} defaultValue={props.valoro || "publika"}>
        {props.opcioj.map((o) => (
          <option key={o.valoro} value={o.valoro}>
            {o.nomo}
          </option>
        ))}
      </select>
    </div>
  );
}

function LokoSercxilo(props: {
  lando: string;
  valoro: string;
  etikedo: string;
  tekstoj: Record<string, string>;
  eraras: boolean;
}) {
  const t = props.tekstoj;
  const [elektita, setElektita] = useState({ valoro: props.valoro, etikedo: props.etikedo });
  const [teksto, setTeksto] = useState(props.etikedo);
  const [rezultoj, setRezultoj] = useState<TrovitaLoko[]>([]);
  const [malfermita, setMalfermita] = useState(false);
  const [aktiva, setAktiva] = useState(-1);
  const [sercxis, setSercxis] = useState(false);
  const listoId = useId();
  const enigoId = useId();
  const unuaLando = useRef(props.lando);

  // Ŝanĝo de lando forigas la elektitan lokon.
  useEffect(() => {
    if (props.lando === unuaLando.current) return;
    unuaLando.current = props.lando;
    setElektita({ valoro: "", etikedo: "" });
    setTeksto("");
    setRezultoj([]);
  }, [props.lando]);

  useEffect(() => {
    if (!malfermita || teksto.trim().length < 2 || !props.lando) {
      setRezultoj([]);
      setSercxis(false);
      return;
    }
    const regilo = new AbortController();
    const tempo = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/lokoj?lando=${encodeURIComponent(props.lando)}&q=${encodeURIComponent(teksto)}`,
          { signal: regilo.signal },
        );
        if (r.ok) {
          setRezultoj((await r.json()) as TrovitaLoko[]);
          setAktiva(-1);
          setSercxis(true);
        }
      } catch {
        /* nuligita aŭ sen reto */
      }
    }, 250);
    return () => {
      clearTimeout(tempo);
      regilo.abort();
    };
  }, [teksto, props.lando, malfermita]);

  const etikedoDe = (l: TrovitaLoko) =>
    l.tipo === "urbo"
      ? [l.nomo, l.regiono].filter(Boolean).join(", ")
      : `${l.nomo} (${t["redakti.nur-regiono"]})`;

  const elekti = (l: TrovitaLoko) => {
    const etikedo = etikedoDe(l);
    setElektita({ valoro: `${l.tipo}:${l.id}`, etikedo });
    setTeksto(etikedo);
    setMalfermita(false);
  };

  const klavo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMalfermita(true);
      setAktiva((a) => Math.min(a + 1, rezultoj.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiva((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && malfermita && aktiva >= 0 && rezultoj[aktiva]) {
      e.preventDefault();
      elekti(rezultoj[aktiva]);
    } else if (e.key === "Escape") {
      setMalfermita(false);
      setTeksto(elektita.etikedo);
    }
  };

  const montriListon = malfermita && teksto.trim().length >= 2 && (rezultoj.length > 0 || sercxis);

  return (
    <div className="kampo">
      <label htmlFor={enigoId}>{t["redakti.urbo-aux-regiono"]}</label>
      <input type="hidden" name="loko" value={elektita.valoro} />
      <input type="hidden" name="loko_etikedo" value={elektita.etikedo} />
      <div className="sercxilo">
        <input
          id={enigoId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={montriListon}
          aria-controls={listoId}
          aria-activedescendant={aktiva >= 0 ? `${listoId}-${aktiva}` : undefined}
          aria-invalid={props.eraras || undefined}
          placeholder={t["redakti.urbo-ekzemplo"]}
          value={teksto}
          disabled={!props.lando}
          onChange={(e) => {
            setTeksto(e.target.value);
            setMalfermita(true);
          }}
          onFocus={() => setMalfermita(true)}
          onBlur={() =>
            setTimeout(() => {
              setMalfermita(false);
              setTeksto((nuna) => (nuna.trim() === "" ? "" : elektita.etikedo));
              if (teksto.trim() === "") setElektita({ valoro: "", etikedo: "" });
            }, 150)
          }
          onKeyDown={klavo}
        />
        {elektita.valoro && (
          <button
            type="button"
            className="forigi-lokon"
            aria-label={t["redakti.forigi-lokon"]}
            onClick={() => {
              setElektita({ valoro: "", etikedo: "" });
              setTeksto("");
            }}
          >
            ×
          </button>
        )}
        {montriListon && (
          <div id={listoId} role="listbox" className="rezultoj">
            {rezultoj.length === 0 ? (
              // biome-ignore lint/a11y/useFocusableInteractive: ŝablono combobox de WAI-ARIA; la fokuso restas en la enigo
              <div className="neniu" role="option" aria-selected={false} aria-disabled="true">
                {t["redakti.neniu-rezulto"]}
              </div>
            ) : (
              rezultoj.map((l, i) => (
                // biome-ignore lint/a11y/useFocusableInteractive: ŝablono combobox de WAI-ARIA (aria-activedescendant)
                <div
                  key={`${l.tipo}:${l.id}`}
                  id={`${listoId}-${i}`}
                  role="option"
                  aria-selected={i === aktiva}
                  className={i === aktiva ? "aktiva" : undefined}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    elekti(l);
                  }}
                >
                  {etikedoDe(l)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {props.eraras && <p className="eraro">{t["redakti.eraro.loko"]}</p>}
    </div>
  );
}

export default function RedaktaFormularo(props: RedaktaFormularoProps) {
  const { valoroj: v, opcioj: o, tekstoj: t } = props;
  const eraras = (kampo: ProfilaEraro["kampo"]) => props.eraroj.some((e) => e.kampo === kampo);
  const ligilaEraro = (i: number) =>
    props.eraroj.some((e) => e.kampo === "ligilo" && e.indekso === i);

  const [lando, setLando] = useState(v.lando);
  const [priskribo, setPriskribo] = useState(v.priskribo);
  const sekva = useRef(v.ligiloj.length);
  const [vicoj, setVicoj] = useState<Vico[]>(() =>
    v.ligiloj.map((l, i) => ({ sxlosilo: i, ...l })),
  );
  const lingvoj = useMemo(() => new Set(v.lingvoj), [v.lingvoj]);
  const interesoj = useMemo(() => new Set(v.interesoj), [v.interesoj]);
  const ids = { kromnomo: useId(), priskribo: useId(), lando: useId() };

  const aldoniVicon = () =>
    setVicoj((n) =>
      n.length >= props.maksLigiloj
        ? n
        : [
            ...n,
            { sxlosilo: sekva.current++, tipo: "telegramo", valoro: "", videbleco: "ensalutintoj" },
          ],
    );

  return (
    <form method="post" className="redakto" noValidate>
      {props.eraroj.length > 0 && (
        <p className="eraro-resumo" role="alert">
          {t["redakti.eraroj"]}
        </p>
      )}

      <fieldset>
        <legend>{t["redakti.pri-vi"]}</legend>
        <div className="kampo">
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
        </div>

        <fieldset className="kampo">
          <legend className="malgranda">{t["aligxi.nivelo"]}</legend>
          <div className="niveloj">
            {o.niveloj.map((n) => (
              <label key={n.valoro} className="elekto">
                <input
                  type="radio"
                  name="nivelo"
                  value={n.valoro}
                  defaultChecked={v.nivelo === n.valoro}
                />
                <span>{n.nomo}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="kampo">
          <label htmlFor={ids.priskribo}>{t["redakti.priskribo"]}</label>
          <textarea
            id={ids.priskribo}
            name="priskribo"
            rows={4}
            maxLength={500}
            value={priskribo}
            onChange={(e) => setPriskribo(e.target.value)}
            aria-invalid={eraras("priskribo") || undefined}
          />
          <p className="helpo">
            {t["redakti.priskribo-helpo"]} <span className="nombrilo">{priskribo.length}/500</span>
          </p>
          {eraras("priskribo") && <p className="eraro">{t["redakti.eraro.priskribo"]}</p>}
          <VideblecoElektilo
            nomo="vid_priskribo"
            valoro={v.vid_priskribo}
            opcioj={o.videblecoj}
            etikedo={t["redakti.kiu-vidas"]}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>{t["redakti.loko"]}</legend>
        <p className="helpo">{t["redakti.loko-helpo"]}</p>
        <div className="kampo">
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
        </div>
        <LokoSercxilo
          lando={lando}
          valoro={v.loko}
          etikedo={v.lokoEtikedo}
          tekstoj={t}
          eraras={eraras("loko")}
        />
        <div className="duopo">
          <VideblecoElektilo
            nomo="vid_regiono"
            valoro={v.vid_regiono}
            opcioj={o.videblecoj}
            etikedo={`${t["redakti.regiono"]}: ${t["redakti.kiu-vidas"]}`}
          />
          <VideblecoElektilo
            nomo="vid_urbo"
            valoro={v.vid_urbo}
            opcioj={o.videblecoj}
            etikedo={`${t["redakti.urbo"]}: ${t["redakti.kiu-vidas"]}`}
          />
        </div>
      </fieldset>

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
        {eraras("lingvoj") && <p className="eraro">{t["redakti.eraro.gxenerala"]}</p>}
        <VideblecoElektilo
          nomo="vid_lingvoj"
          valoro={v.vid_lingvoj}
          opcioj={o.videblecoj}
          etikedo={t["redakti.kiu-vidas"]}
        />
      </fieldset>

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
        {eraras("interesoj") && <p className="eraro">{t["redakti.eraro.gxenerala"]}</p>}
        <VideblecoElektilo
          nomo="vid_interesoj"
          valoro={v.vid_interesoj}
          opcioj={o.videblecoj}
          etikedo={t["redakti.kiu-vidas"]}
        />
      </fieldset>

      <fieldset>
        <legend>{t["redakti.kontaktiloj"]}</legend>
        <p className="helpo">{t["redakti.kontaktiloj-helpo"]}</p>
        <ul className="kontaktiloj">
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
                <select name="ligilo_videbleco" defaultValue={vico.videbleco}>
                  {o.videblecoj.map((vid) => (
                    <option key={vid.valoro} value={vid.valoro}>
                      {vid.nomo}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="forigi"
                onClick={() => setVicoj((n) => n.filter((x) => x.sxlosilo !== vico.sxlosilo))}
              >
                {t["redakti.forigi"]}
              </button>
              {ligilaEraro(i) && <p className="eraro">{t["redakti.eraro.ligilo"]}</p>}
            </li>
          ))}
        </ul>
        {eraras("ligiloj") && <p className="eraro">{t["redakti.eraro.ligiloj"]}</p>}
        {vicoj.length < props.maksLigiloj && (
          <button type="button" className="aldoni" onClick={aldoniVicon}>
            + {t["redakti.aldoni-kontaktilon"]}
          </button>
        )}
      </fieldset>

      <div className="agoj">
        <button type="submit" className="konservi">
          {t["redakti.konservi"]}
        </button>
      </div>
    </form>
  );
}
