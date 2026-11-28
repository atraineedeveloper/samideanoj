/**
 * Serĉilo de urbo aŭ regiono (ŝablono "combobox" de WAI-ARIA).
 * Uzata en la redakta formularo kaj en la serĉado. Ĝi sendas la kampon
 * `loko` ("urbo:123" aŭ "regiono:MX.27") kun la ĉirkaŭa formularo.
 */

import { useEffect, useId, useRef, useState } from "react";
import type { TrovitaLoko } from "../lib/lokoj";

export default function LokoSercxilo(props: {
  lando: string;
  /** Etikedo de la kampo; defaŭlte "Urbo aŭ regiono". */
  etikedoKampo?: string;
  /** Ĉu ankaŭ sendi la etikedon (por remontri ĝin post eraro). */
  kunEtikedo?: boolean;
  /** Vokita post ĉiu ŝanĝo de la elektita loko (la kaŝitaj kampoj ne sendas eventojn). */
  onSxangxo?: () => void;
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
  const unuaElekto = useRef(true);
  const sxangxo = useRef(props.onSxangxo);
  sxangxo.current = props.onSxangxo;
  // biome-ignore lint/correctness/useExhaustiveDependencies: reagi nur al ŝanĝo de la elektita loko
  useEffect(() => {
    if (unuaElekto.current) {
      unuaElekto.current = false;
      return;
    }
    sxangxo.current?.();
  }, [elektita]);

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
      <label htmlFor={enigoId}>{props.etikedoKampo ?? t["redakti.urbo-aux-regiono"]}</label>
      <input type="hidden" name="loko" value={elektita.valoro} />
      {props.kunEtikedo !== false && (
        <input type="hidden" name="loko_etikedo" value={elektita.etikedo} />
      )}
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
