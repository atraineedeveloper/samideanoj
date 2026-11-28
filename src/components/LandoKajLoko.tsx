/**
 * Lando kaj, laŭvole, urbo aŭ regiono en tiu lando. Parto de la serĉa
 * formularo (ordinara GET-formularo): sen JavaScript la lando funkcias sola.
 */
import { useState } from "react";
import LokoSercxilo from "./LokoSercxilo";

interface Props {
  landoj: { valoro: string; nomo: string }[];
  lando: string;
  loko: string;
  lokoEtikedo: string;
  tekstoj: Record<string, string>;
}

export default function LandoKajLoko(props: Props) {
  const t = props.tekstoj;
  const [lando, setLando] = useState(props.lando);
  return (
    <>
      <div className="kampo">
        <label htmlFor="sercxo-lando">{t["sercxi.lando"]}</label>
        <select
          id="sercxo-lando"
          name="lando"
          value={lando}
          onChange={(e) => setLando(e.target.value)}
        >
          <option value="">{t["sercxi.cxiuj-landoj"]}</option>
          {props.landoj.map((l) => (
            <option key={l.valoro} value={l.valoro}>
              {l.nomo}
            </option>
          ))}
        </select>
      </div>
      <LokoSercxilo
        lando={lando}
        valoro={props.loko}
        etikedo={props.lokoEtikedo}
        tekstoj={t}
        eraras={false}
        kunEtikedo={false}
      />
    </>
  );
}
