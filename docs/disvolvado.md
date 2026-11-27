# Disvolvado

Gvidilo por labori pri la kodo de Samideanoj.

## Teknologioj

| Parto | Teknologio | Decido |
| --- | --- | --- |
| Gastigado | Cloudflare Workers | [ADR 0002](adr/0002-gastigado-kaj-datumbazo.md) |
| Datumbazo | Cloudflare D1 (SQLite) | [ADR 0002](adr/0002-gastigado-kaj-datumbazo.md) |
| Kadro | Astro + React-insuloj, TypeScript | [ADR 0003](adr/0003-kadro.md) |
| Ensaluto | OAuth 2.0 kaj Telegramo | [ADR 0004](adr/0004-ensaluto-kaj-seancoj.md) |
| Kvalito | Biome, Vitest, astro check | [ADR 0005](adr/0005-kvalitaj-iloj.md) |

## Unuafoje

Postulas Node.js 22 (vidu `.nvmrc`).

```bash
npm install
npm run db:migrate:local   # kreas la lokan datumbazon
npm run dev                # http://localhost:4321
```

La loka disvolvado uzas la saman rultempon kiel Cloudflare (`workerd`) kaj lokan kopion de D1 en `.wrangler/`. Neniu Cloudflare-konto necesas por labori loke.

## Komandoj

| Komando | Kion ĝi faras |
| --- | --- |
| `npm run dev` | Loka servilo kun aŭtomata reŝargo |
| `npm run build` | Konstruas por Cloudflare |
| `npm run preview` | Rulas la konstruitan version loke |
| `npm run check` | Kontrolas la tipojn (TypeScript kaj Astro) |
| `npm run lint` | Lintilo kaj formato (Biome) |
| `npm run format` | Korektas la formaton aŭtomate |
| `npm test` | Unuotestoj (Vitest) |
| `npm run db:migrate:local` | Aplikas la migradojn al la loka datumbazo |

## Strukturo

```
migrations/       Versiigitaj SQL-migradoj de D1
public/           Statikaj dosieroj
src/
  components/     Astro- kaj React-komponantoj
  i18n/           Tradukoj (eo, es, en)
  layouts/        Paĝaj ŝablonoj
  pages/          Vojoj: / (eo), /es/, /en/, /sano
  styles/         Bazaj stiloj kaj koloroj
tests/            Unuotestoj
```

## Datumbazaj migradoj

- Ĉiu ŝanĝo de la skemo estas nova dosiero en `migrations/`, ekz. `0002_aldoni_kampon.sql`.
- Neniam redaktu migradon, kiu jam estas en `main`.
- La CI aplikas ĉiujn migradojn al malplena datumbazo en ĉiu kunfando-peto.

## Medioj

| Medio | Kiam ĝi deplojiĝas | Datumbazo |
| --- | --- | --- |
| Loka | `npm run dev` | `.wrangler/` (loka) |
| Provmedio | Aŭtomate post ĉiu kunfando en `main` | `samideanoj-provmedio` |
| Produktado | Mane, per *Actions → Deplojo → Run workflow* | `samideanoj-produktado` |

Antaŭ la unua deplojo, iu kun aliro al la Cloudflare-konto devas krei la du datumbazojn kaj meti iliajn identigilojn en `wrangler.jsonc`, kaj aldoni la sekretojn `CLOUDFLARE_API_TOKEN` kaj `CLOUDFLARE_ACCOUNT_ID` en GitHub.

La sankontrolo troviĝas ĉe `/sano`: ĝi respondas `{"stato":"bone"}` kiam la Worker kaj la datumbazo funkcias.

## Difino de Finita

Ŝanĝo estas finita nur kiam:

- [ ] La CI pasas: lintilo, tipoj, testoj, konstruo kaj migradoj.
- [ ] Nova logiko havas unuotestojn; ĉio, kio tuŝas videblecon aŭ ensaluton, havas testojn por ĉiu kazo.
- [ ] Ĉiu teksto por uzantoj troviĝas en `src/i18n/tradukoj.ts`, almenaŭ en Esperanto.
- [ ] La interfaco estas uzebla per klavaro kaj havas sufiĉan kontraston (WCAG 2.2 AA).
- [ ] Neniuj personaj datumoj aŭ sekretoj estas en la kodo aŭ en la protokoloj.
- [ ] Grava decido havas sian ADR.
- [ ] Alia persono reviziis la kunfando-peton.
- [ ] La ŝanĝo funkcias en la provmedio.
