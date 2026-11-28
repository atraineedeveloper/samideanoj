# Profilbildoj

Ĉiu uzanto povas aldoni unu profilbildon. La celo: malpezaj bildoj, sen personaj metadatenoj, sen kostoj, kaj sub la kontrolo de la uzanto.

## Kial en D1 kaj ne en R2 aŭ Cloudflare Images

| Elekto | Kosto | Problemo |
| --- | --- | --- |
| **D1 (elektita)** | 0 USD | Limo de 500 MB por datumbazo |
| R2 | Senpaga ĝis 10 GB | Postulas pagkarton kaj fakturas superon |
| Cloudflare Images | 5 000 transformoj monate senpage | Pagenda poste; nenecesa, ĉar la retumilo jam konvertas |

Bildo de 256 × 256 bilderoj pezas ĉirkaŭ 10–16 KB. Je 15 KB, ĉirkaŭ **30 000 bildoj** eniras en 500 MB, kun spaco por la ceteraj datumoj. Se iam ni proksimiĝos al la limo, ni povos movi la bildojn al R2 sen ŝanĝi la adresojn (`/bildo/<slug>`).

## La fluo

1. **En la retumilo** (`src/components/BildoRedaktilo.tsx`):
   - la uzanto elektas iun ajn bildon (JPEG, PNG, WebP, HEIC en Safari…);
   - la retumilo aplikas la orientiĝon de la foto, eltondas centran kvadraton kaj malgrandigas ĝin al 256 × 256;
   - ĝi kodas ĝin kiel **WebP**; se la retumilo ne povas (Safari), kiel **JPEG**;
   - la nova kodado **forigas ĉiujn metadatenojn**, inkluzive de la GPS-loko de la foto.
2. **En la servilo** (`POST /mia-profilo/bildo`), kiu neniam fidas al la kliento:
   - nur ensalutinto, nur de la sama origino (CSRF);
   - `src/lib/bildoj.ts` kontrolas la bajtojn mem: WebP aŭ JPEG laŭ la enhavo (ne laŭ la nomo), ≤ 64 KB, kvadrata, 64–512 bilderoj, sen EXIF, XMP, IPTC, MPF aŭ animacio. La kolorprofilo ICC estas permesita, ĉar la retumiloj aldonas ĝin kaj ĝi enhavas neniun personan datumon;
   - ĉio alia (PNG, SVG, HTML kaŝita kiel bildo, la originala foto kun GPS) estas malakceptita.
3. **Montrado** (`GET /bildo/<slug>?v=<versio>`):
   - la decido venas de `filtriProfilon`, la sama filtrilo kiel por la cetera profilo;
   - la bildo havas sian propran videblecon (`vid_bildo`), defaŭlte **nur ensalutintoj**;
   - kapoj: `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, `Cache-Control: private`;
   - `?v=` ŝanĝiĝas kun ĉiu nova bildo, do la kaŝmemoro neniam montras malnovan bildon.

## Moderigo

Laŭ la decido de la projekto, la moderigo okazas per **raportoj**: nova kialo `malkonvena_bildo` en la tabelo `raportoj`. Moderiganto povas kaŝi la bildon (`kasxita_de_moderiganto = 1`): tiam nur la posedanto kaj la moderigantoj vidas ĝin, kaj la posedanto vidas avizon. Nova alŝuto ne nuligas la kaŝon, por ke oni ne povu eviti la moderigon. La interfaco por raporti kaj moderigi venos en ciklo 5.

## Datumoj

`migrations/0004_profilbildoj.sql`:

| Kolumno | Noto |
| --- | --- |
| `profilbildoj.uzanto_id` | PK, `ON DELETE CASCADE`: forigi la konton forigas la bildon |
| `bildo` | BLOB, maksimume 65 536 bajtoj (kontrolita ankaŭ de la datumbazo) |
| `tipo` | `image/webp` aŭ `image/jpeg` |
| `kasxita_de_moderiganto` | 0 aŭ 1 |
| `gxisdatigita` | Versio por la adreso |
| `uzantoj.vid_bildo` | Videbleco, defaŭlte `ensalutintoj` |
