# 0004. Ensaluto kaj seancoj

- **Stato:** Proponita
- **Dato:** 2026-11-27

## Kunteksto

La [PRD](../fazo-1/prd.md) decidis ensaluton per Telegramo, Google kaj GitHub, sen pasvortoj kaj sen pagataj servoj. [ADR 0002](0002-gastigado-kaj-datumbazo.md) elektis Cloudflare, kiu ne havas enkonstruitan ensaluton, do ni realigas ĝin mem.

## Decido

### Provizantoj

| Provizanto | Protokolo | Kion ni konservas |
| --- | --- | --- |
| Google | OAuth 2.0 / OpenID Connect kun PKCE | Nur la identigilon `sub` |
| GitHub | OAuth 2.0 | Nur la nombran identigilon de la uzanto |
| Telegramo | Ensalutilo de Telegramo; ni kontrolas la HMAC-SHA-256-subskribon per la ĵetono de nia roboto | Nur la nombran identigilon de la uzanto |

- Ni **ne konservas** retpoŝton, nomon nek bildon de la provizanto.
- Por Google kaj GitHub ni uzas etan, bone prizorgatan OAuth-bibliotekon (ekz. Arctic), elektota en fazo 3.
- Por Telegramo ni malakceptas datumojn kun `auth_date` pli malnova ol 5 minutoj, por eviti reludadon.

### Seancoj

- Post sukcesa ensaluto ni kreas hazardan ĵetonon de 32 bajtoj.
- La ĵetono iras al la retumilo en kuketo `HttpOnly`, `Secure`, `SameSite=Lax`.
- En D1 ni konservas nur la **SHA-256 de la ĵetono** (tabelo `seancoj`), do ŝtelita datumbazo ne permesas ensaluti.
- Daŭro: 30 tagoj, renovigata ĉe uzo.
- Elsaluto forigas la vicon en D1 kaj la kuketon.

### Protekto

- Ŝtato (`state`) kaj PKCE en ĉiu OAuth-fluo kontraŭ CSRF.
- Ĉiuj formularoj kiuj ŝanĝas datumojn kontrolas la `Origin`-kapon.
- Rapidlimigo por ensalutaj provoj.

## Sekvoj

- **Pozitivaj:** neniu pasvorto por ŝteli; minimumaj personaj datumoj; neniu kosto.
- **Negativaj:** ni respondecas pri la sekureco de la ensaluta kodo; ĝi bezonas testojn kaj revizion.
- **Riskoj:** se provizanto ŝanĝas sian API-on, ensaluto per ĝi rompiĝas. Mildigo: ĉiu uzanto povas ligi plurajn provizantojn, do neniu restas ekster sia konto.
