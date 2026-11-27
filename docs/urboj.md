# Lokoj: landoj, regionoj kaj urboj

La loko de samideano havas tri nivelojn, kiel en sociaj retoj:

| Nivelo | Deviga? | Videbleco | Fonto |
| --- | --- | --- | --- |
| Lando | Jes | Ĉiam publika | GeoNames `countryInfo.txt` |
| Regiono (ŝtato, provinco) | Ne | Propra elektilo | GeoNames `admin1CodesASCII.txt` |
| Urbo | Ne | Propra elektilo | GeoNames `cities15000.txt` |

La uzanto elektas la landon, poste serĉas sian urbon aŭ regionon en unu kampo kun aŭtomata kompletigo ("Villahermosa, Tabasco"). Kiu ne volas doni sian urbon, elektas nur la regionon, aŭ nenion.

## Kial urboj kun pli ol 15 000 loĝantoj

- Ili ekzistas en ĉiuj landoj, kun la sama signifo.
- Ili kongruas kun la limo de D1: ĉiu vico kaj ĉiu indekso kostas skribon, kaj la senpaga plano permesas 100 000 skribojn tage.
- **Privateco:** kiu loĝas en malgranda vilaĝo elektas la proksiman urbon aŭ nur la regionon, kaj ne estas identigebla per sia loko.

## Importi la lokojn

*Actions → Importi lokojn → Run workflow*, elektu la medion.

La laborfluo elŝutas la dosierojn de GeoNames, konvertas ilin per `scripts/importi-lokojn.mjs` kaj enmetas ilin per `INSERT OR IGNORE`, ordigitajn laŭ loĝantaro. Se D1 atingas sian tagan limon de skriboj, la importo haltas; **rulu ĝin denove la sekvan tagon** kaj ĝi daŭrigos de kie ĝi haltis. Dum tiu tago, aliaj skriboj en la sama medio ankaŭ malsukcesos, do importu antaŭ la lanĉo.

## Serĉado

`GET /api/lokoj?lando=MX&q=villa` redonas ĝis 8 urbojn (laŭ loĝantaro) kaj 3 regionojn, kies normigita nomo komenciĝas per la serĉo. La normigo (`src/lib/sercxo.ts`) forigas majusklojn, diakritajn signojn kaj interpunkcion: "São Paulo" → "sao paulo". La indeksoj `(lando_kodo, sercxnomo)` certigas, ke ĉiu serĉo legas nur la trovitajn vicojn.

## Permesilo

La geografiaj datumoj venas de [GeoNames](https://www.geonames.org/), sub la permesilo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), kiu postulas atribuon en la retejo.

## Estontaj plibonigoj

- Esperantaj nomoj de urboj kaj regionoj el `alternateNamesV2` de GeoNames.
- Kompletigi la esperantajn nomojn de landoj (`src/i18n/esperantaj-nomoj.ts`).
