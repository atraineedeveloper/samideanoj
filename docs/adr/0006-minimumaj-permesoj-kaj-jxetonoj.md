# 0006. Minimumaj permesoj kaj neniu konservado de alirĵetonoj

- **Stato:** Akceptita
- **Dato:** 2026-11-27
- **Kompletigas:** [ADR 0004](0004-ensaluto-kaj-seancoj.md)

## Kunteksto

[ADR 0004](0004-ensaluto-kaj-seancoj.md) difinas la ensaluton per Google, GitHub kaj Telegramo. La uzantoj fidas al ni sian ekzistantan konton, do ni devas garantii, ke eĉ se iu atakas Samideanojn, li ne povas atingi tiujn kontojn.

Pasvortoj neniam estas risko ĉe ni: la uzanto tajpas sian pasvorton nur en la paĝo de la provizanto. Sed la provizantoj povas doni al ni **alirĵetonojn** kaj **permesojn** (ekz. legi retpoŝtojn, sendi mesaĝojn). Se ni petus aŭ konservus ilin, atakanto povus uzi ilin.

## Decido

Du devigaj reguloj por ĉiu ensaluta kodo:

### 1. Peti nur la minimumajn permesojn

| Provizanto | Kion ni petas | Kion ni **neniam** petas |
| --- | --- | --- |
| Google | `openid` (nur la identigilo) | Retpoŝton, kontaktojn, Drive aŭ ajnan alian permeson |
| GitHub | Neniun skopon (nur publika identeco) | `user:email`, `repo` aŭ ajnan alian skopon |
| Telegramo | Nur la ensalutilo | `request_access=write` (permeso, ke la roboto skribu al la uzanto) |

### 2. Neniam konservi alirĵetonojn

- La alirĵetonon de la provizanto ni uzas nur unufoje, por konfirmi la identecon dum la ensaluto, kaj tuj forĵetas ĝin.
- Neniu alirĵetono, refreŝiga ĵetono aŭ identiga ĵetono estas skribita en D1, en kuketoj aŭ en protokoloj.
- La sola persistanta datumo estas la identigilo de la ekstera konto (tabelo `identecoj`).

### Kontrolo

- La reviziisto de ĉiu kunfando-peto, kiu tuŝas la ensaluton, kontrolas ambaŭ regulojn.
- Aŭtomata testo kontrolas, ke la ensalutaj ligiloj al la provizantoj enhavas nur la permesitajn skopojn.

## Sekvoj

- **Pozitivaj:** se Samideanoj estus atakita, la atakanto ne povus aliri la kontojn de la uzantoj ĉe Google, GitHub aŭ Telegramo. La ensaluta ekrano de la provizanto montras al la uzanto, ke ni petas preskaŭ nenion, kio pliigas la fidon.
- **Negativaj:** ni ne povas antaŭplenigi la profilon per datumoj de la provizanto (nomo, bildo). La uzanto tajpas sian kromnomon mem, kio konformas al la principo de minimumaj datumoj.
- **Restanta risko:** atakanto kiu regus la retejon povus montri falsan ensalutan butonon (*phishing*). Mildigo: la ensaluta paĝo memorigas, ke la ensaluto okazas ĉe `accounts.google.com`, `github.com` aŭ `oauth.telegram.org`.
