# Serĉado kaj mapo

## Serĉado (`/` kaj `/sercxi`)

Kiel en la [prototipo](fazo-2/prototipo/): en labortablo la hejmpaĝo jam estas la serĉado (serĉkampo, filtriloj kaj rezultoj maldekstre, la mapo dekstre). En poŝtelefono `/` montras la mapon kaj la inviton, kaj `/sercxi` la kompaktan liston; la navigado estas en malsupra breto.

### La serĉkampo "Urbo, lando aŭ intereso…"

Parametro `q`. La servilo interpretas la tekston (`src/lib/demando.ts`), en ĉi tiu ordo: **lando** (en Esperanto, la hispana aŭ la angla) → **urbo** (la plej loĝata kun tiu nomo, ankaŭ laŭ la esperanta nomo) → **regiono** → **intereso** → **lingvo** → alie **kromnomo**. La rezulto fariĝas ordinaraj filtriloj, do la privatecaj reguloj sube validas egale. La filtriloj aperas kiel forigeblaj "piloloj".

Filtriloj, ĉiuj nedevigaj kaj kombineblaj (ĉiuj devas kongrui):

| Filtrilo | Parametro | Noto |
| --- | --- | --- |
| Serĉkampo | `q` | Interpretita, vidu supre |
| Kromnomo | `nomo` | Parto de la kromnomo, sen distingi majusklojn |
| Lando | `lando` | ISO-kodo, ekz. `MX` |
| Urbo aŭ regiono | `loko` | `urbo:3530597` aŭ `regiono:MX.27` |
| Nivelo | `nivelo` (ripetebla) | Almenaŭ unu el la elektitaj |
| Interesoj | `intereso` (ripetebla) | Almenaŭ unu el la elektitaj |
| Lingvoj | `lingvo` (ripetebla) | Almenaŭ unu el la elektitaj |
| Paĝo | `pagxo` | 20 rezultoj por paĝo, maksimume 25 paĝoj |

La rezultoj aperas laŭ la dato de la lasta ĝisdatigo de la profilo: la plej freŝaj unue.

### Privateco

**Oni povas trovi personon per kampo nur se la rigardanto rajtas vidi tiun kampon.** Se Lupe montras sian urbon nur al ensalutintoj, vizitanto serĉanta "Toluca" ne trovas ŝin, ĉar la rezulto mem malkaŝus, kie ŝi loĝas. Ensalutinto ja trovas ŝin.

- La kondiĉoj de videbleco estas en la SQL (`src/lib/sercxado.ts`), do ankaŭ la **nombro** de rezultoj ne likigas ion.
- Ĉiu karto pasas tra `filtriProfilon`, kiel la profila paĝo: ĝi montras nur la videblajn kampojn.
- Kromnomo, nivelo kaj lando estas ĉiam publikaj, do ili ĉiam estas serĉeblaj.
- Nur aktivaj profiloj aperas.
- La testoj (`tests/sercxado.test.ts`) uzas veran SQLite kun la veraj migradoj, ne imitaĵon.

### Protekto kontraŭ amasa elkopiado

- **Rapidlimo:** 60 petoj minute por IP-adreso al la hejmpaĝo, la serĉado kaj la profiloj (`src/middleware.ts`, Workers Rate Limiting, senpaga). Poste: respondo 429 dum unu minuto.
- **Maksimume 25 paĝoj** da rezultoj por serĉo.
- **Indeksoj** (`migrations/0005_sercxado.sql`), por ke ĉiu serĉo legu malmultajn vicojn. Ekde septembro 2026 la senpaga D1 **haltas** post 5 milionoj da legitaj vicoj tage, do roboto ne devas povi elĉerpi ilin.

## Mapo

Vidu [ADR 0007](adr/0007-propra-mapo.md).

- **Landoj:** ĉiuj aktivaj profiloj.
- **Urboj:** nur se almenaŭ **3** samideanoj montras sian urbon publike. La aliaj kalkuliĝas nur en la tuto de la lando.
- La nombroj restas 10 minutojn en la kaŝmemoro, do nova profilo aperas sur la mapo post maksimume 10 minutoj.
- `npm run mapo` regeneras la bazajn mapojn (`npm run dev` kaj `npm run build` faras tion aŭtomate).
