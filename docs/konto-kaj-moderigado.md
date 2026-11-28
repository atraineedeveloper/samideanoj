# Konto kaj moderigado

## Agordoj de la konto (`/agordoj`)

Atingebla el la propra profilo ("Agordoj de la konto").

| Ago | Kion ĝi faras |
| --- | --- |
| **Elŝuti miajn datumojn** | `GET /agordoj/eksporti`: JSON-dosiero kun ĉio pri la uzanto: profilo kun videblecoj, ligitaj kontoj (provizanto kaj ekstera identigilo), kontaktiloj, lingvoj, interesoj, profilbildo (base64url), raportoj faritaj de ri kaj la nombro de aktivaj seancoj. |
| **Elsaluti el ĉiuj aparatoj** | Forigas ĉiujn seancojn de la uzanto. |
| **Forigi mian konton** | Post konfirmo (tajpi la kromnomon), forigas ĉion **tuj kaj por ĉiam**. |

### Kion la eksporto ne enhavas, kaj kial

- **Raportojn pri la uzanto:** ili enhavas datumojn de aliaj personoj (kiu raportis, kion ri skribis).
- **Seancajn ĵetonojn:** ni konservas nur ilian SHA-256; ili ne estas datumoj de la uzanto, kaj ili estus danĝeraj en dosiero.

### Kion la forigo forigas

`DELETE FROM uzantoj` kaj la skemo faras la reston per `ON DELETE CASCADE`: identecoj, seancoj, kontaktiloj, lingvoj, interesoj, profilbildo kaj la raportoj **pri** la uzanto. `tests/konto.test.ts` kontrolas ĉiun tabelon kontraŭ la veraj migradoj.

Kio restas, sen la persono:

- La raportoj **faritaj** de ri restas sen aŭtoro (`raportanto_id = NULL`), por ke la moderigado ne perdu ilin.
- La registro de moderigaj agoj restas sen la moderiganto, se moderiganto forigas sian konton.
- La nombroj de la mapo ĝisdatiĝas post maksimume 10 minutoj.

## Raportoj (`/raporti/<slug>`)

- Nur ensalutintoj. Vizitanto, kiu alklakas "Raporti", iras al la ensaluto kaj revenas.
- Kialoj: spamo, falsa profilo, ofenda enhavo, malkonvena profilbildo, alia (kun deviga klarigo).
- **La posedanto ne scias, kiu raportis.**
- Neniu duobligo: nova raporto de la sama persono pri la sama profilo ĝisdatigas la malfermitan.
- Limo: 10 raportoj por persono en 24 horoj. Oni ne povas raporti sin mem.

## Moderigado (`/moderigado`)

Nur por la roloj `moderiganto` kaj `administranto`, kontrolata en la servilo ĉe ĉiu peto. Por aliaj la paĝo respondas 404, por ne malkaŝi, ke ĝi ekzistas.

- **Novaj raportoj**, grupigitaj laŭ profilo, kun kialoj, komentoj kaj datoj.
- **Agoj:** kaŝi la profilon, kaŝi nur la bildon, malakcepti la raportojn. Por kaŝitaj: restarigi la profilon, montri la bildon denove.
- **Registro:** ĉiu ago estas registrita en `moderigaj_agoj` kun aŭtoro kaj dato, en la sama atoma operacio kiel la ago (minacmodelo R1).
- Moderiganto ne povas moderigi sin mem nek administranton.
- La posedanto de kaŝita profilo vidas averton sur sia profilo; neniu alia vidas la profilon, kaj ĝi ne aperas en la serĉado nek sur la mapo.

### Doni la rolon de moderiganto

Ankoraŭ ne ekzistas interfaco por tio (minacmodelo E1: nur administranto ŝanĝas rolojn). En la Cloudflare-panelo, *D1 → la datumbazo → Console*:

```sql
UPDATE uzantoj SET rolo = 'administranto' WHERE slug = 'via-slug';  -- la unua administranto
UPDATE uzantoj SET rolo = 'moderiganto' WHERE slug = 'iu-alia';
```

### Retpoŝtaj avertoj por moderigantoj (PRD C4): prokrastitaj

Cloudflare Email Sending sendas senpage nur el **propra domajno** kun Email Routing. La retejo nun uzas `workers.dev`, sen propra domajno, do tio ne eblas ankoraŭ. Ĝis tiam la moderigantoj kontrolas `/moderigado`; la ligilo en la kapo montras ĝin nur al ili.
