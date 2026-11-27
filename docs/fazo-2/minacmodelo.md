# Minacmodelo (STRIDE)

- **Stato:** Skizo por diskuto
- **Dato:** 2026-11-27

Adresaro de personoj estas alloga celo: por spamistoj, por ĉikanantoj kaj por tiuj, kiuj volas kolekti personajn datumojn. Ĉi tiu dokumento listigas la ĉefajn minacojn kaj kiel la [arkitekturo](arkitekturo.md) respondas al ili.

## Valoraĵoj

| Valoraĵo | Kial ĝi gravas |
| --- | --- |
| Kontaktiloj kun videbleco "ensalutintoj" aŭ "kaŝita" | Telefonnumeroj (WhatsApp, Signal) kaj retpoŝtoj |
| La urbo de ĉiu persono | Kune kun la nomo, ĝi povas helpi trovi iun fizike |
| La seancoj | Kiu havas seancon, regas la profilon |
| La reputacio de la projekto | Unu skandalo pri datumoj finus la fidon de la komunumo |

## Minacoj

| # | Kategorio | Minaco | Mildigo |
| --- | --- | --- | --- |
| S1 | Falsigo (*Spoofing*) | Iu ensalutas kiel alia persono | Ensaluto nur per OAuth aŭ subskribo de Telegramo; `state` kaj PKCE; malnovaj datumoj de Telegramo malakceptataj ([ADR 0004](../adr/0004-ensaluto-kaj-seancoj.md)) |
| S2 | Falsigo | Falsaj profiloj por spamo aŭ trompo | Raportoj kaj moderigado; ekstera konto necesa por aliĝi; rapidlimigo de kreado |
| T1 | Ŝanĝo (*Tampering*) | Iu redaktas alies profilon | Ĉiu skribo kontrolas, ke la seanco apartenas al la posedanto; kontrolo de `Origin` kontraŭ CSRF |
| T2 | Ŝanĝo | Malica enhavo en profilo (skriptoj, ligiloj `javascript:`) | Ĉiu teksto estas eskapita dum bildigo; ligiloj validigitaj laŭ tipo; nur `https://` |
| R1 | Neado (*Repudiation*) | Moderiganto kaŝas profilon sen spuro | Ĉiu moderiga ago estas registrita kun aŭtoro kaj dato |
| I1 | Informa liko (*Information disclosure*) | **Amasa elkopiado de ĉiuj profiloj** | Rapidlimigo laŭ IP kaj seanco; paĝigo; neniu API por elŝuti la tutan adresaron; kontaktiloj "ensalutintoj" nevideblaj por robotoj sen konto |
| I2 | Informa liko | Kaŝita kampo aperas per eraro | Unu sola **videbleca filtrilo** por ĉiuj eliroj; aŭtomataj testoj por ĉiu kombino de kampo kaj videbleco |
| I3 | Informa liko | La mapo malkaŝas, ke iu loĝas en malgranda urbo | Sojlo: urboj kun malpli ol 3 samideanoj aperas nur en la tuto de la lando |
| I4 | Informa liko | Ŝtelita datumbazo | Ni konservas nek retpoŝtojn de la ensaluto nek seancajn ĵetonojn (nur ilian SHA-256) |
| N1 | Nehavebligo (*Denial of service*) | Iu konsumas la tagan limon de la senpaga plano | Rapidlimigo; kaŝmemoro por la mapo; protekto de Cloudflare kontraŭ DDoS |
| E1 | Privilegia altigo (*Elevation of privilege*) | Uzanto akiras la rolon de moderiganto | La rolo ŝanĝeblas nur per administranto; ĉiu moderiga paĝo kontrolas la rolon en la servilo |

## Ekster la amplekso

- Ĉikanado **ekster** Samideanoj, per la sociaj retoj kiujn la uzanto mem montras: ni mildigas ĝin per la videbleco por ĉiu kampo kaj per klaraj klarigoj dum la redaktado, sed ne povas malhelpi ĝin tute.
- Atakoj kontraŭ Cloudflare, Google, GitHub aŭ Telegramo mem.

## Antaŭ la lanĉo (fazo 5)

- [ ] Revizio laŭ OWASP Top 10.
- [ ] Testoj de la videbleca filtrilo por ĉiuj kombinoj.
- [ ] Provo de elkopiado kontraŭ la rapidlimigo.
- [ ] Revizio de la ensaluta kodo de dua persono.
