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
npm run db:seed:local      # ŝarĝas ekzemplajn profilojn (nur loke)
cp .dev.vars.example .dev.vars   # agordoj de ensaluto, vidu docs/ensaluto.md
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
| `npm run db:seed:local` | Ŝarĝas ekzemplajn profilojn en la lokan datumbazon (vidu `/s/marisol`, `/s/tomaso`, `/s/lupe`) |

## Strukturo

```
migrations/       Versiigitaj SQL-migradoj de D1
public/           Statikaj dosieroj
src/
  components/     Astro- kaj React-komponantoj
  i18n/           Tradukoj (eo, es, en)
  layouts/        Paĝaj ŝablonoj
  lib/            Logiko: videbleca filtrilo, ligiloj, legado de profiloj
  middleware.ts   Kontrolo de Origin (CSRF) kaj identigo de la rigardanto
  pages/          Vojoj: / (eo), /es/, /en/, /s/[slug], /ensaluti, /aligxi, /auth/*, /elsaluti, /sano
  styles/         Bazaj stiloj kaj koloroj
seed/             Ekzemplaj datumoj por loka disvolvado
tests/            Unuotestoj
```

## La videbleca filtrilo

`src/lib/videbleco.ts` estas la sola loko, kiu decidas, kion rigardanto rajtas vidi. Ĉiu paĝo kiu montras profilon devas:

1. legi la profilon per `src/lib/profiloj.ts` (redonas `PlenaProfilo`);
2. pasigi ĝin tra `filtriProfilon` (redonas `VideblaProfilo`);
3. doni al la komponantoj **nur** la `VideblaProfilo`.

Komponantoj akceptas nur `VideblaProfilo`, do TypeScript malhelpas eraran uzon. Ĉiu ŝanĝo de la filtrilo bezonas testojn en `tests/videbleco.test.ts`.

## Ekzemplaj uzantoj kaj prova ensaluto

Loke kaj en la provmedio, la ensaluta paĝo havas sekcion **"Prova medio"** por ensaluti kiel ekzempla uzanto (Marisol, Tomaso, Lupe, la moderiganto…) sen Telegramo, Google aŭ GitHub. Tiel oni vidas la sistemon el ĉiu rolo.

- Ĝi funkcias nur kun `PROVA_ENSALUTO=jes` kaj `MEDIO` = `loka` aŭ `provmedio` (`wrangler.jsonc`). La produkta agordo ne havas ĝin, kaj `tests/agordo.test.ts` malsukcesas se iu aldonus ĝin.
- Nur uzantoj kun identigilo `01EKZEMPLO…` estas atingeblaj tiel; veraj uzantoj neniam.
- **Ŝarĝi aŭ forigi la ekzemplojn en la provmedio:** *Actions → Ekzemplaj datumoj → Run workflow*, elektu `sxargi` aŭ `forigi`. Forigo tuŝas nur la ekzemplajn uzantojn.

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

**Grave:** la Cloudflare-adaptilo elektas la medion **dum la konstruo**, per la variablo `CLOUDFLARE_ENV` (ekz. `CLOUDFLARE_ENV=provmedio npm run build`), kaj generas `dist/server/wrangler.json` por tiu medio. La opcio `--env` de `wrangler deploy` ne havas efikon. La deploja laborfluo kontrolas la generitan agordon antaŭ ol deploji, kaj post la deplojo kontrolas `/sano`.

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
