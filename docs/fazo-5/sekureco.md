# Sekureca revizio laŭ OWASP Top 10 (2021)

- **Dato:** 2026-11-27
- **Amplekso:** la tuta kodo en `main` post ciklo 5, la agordo de Cloudflare kaj la laborfluoj de GitHub.
- **Metodo:** legado de la kodo laŭ ĉiu kategorio, aŭtomataj testoj (unuotestoj kaj E2E en Chrome) kaj `npm audit`.

## Resumo

| # | Kategorio | Stato | Ĉefaj protektoj |
| --- | --- | --- | --- |
| A01 | Rompita alirkontrolo | ✅ | Ĉiu protektita vojo kontrolas la seancon en la servilo; moderigado kontrolas la rolon el la datumbazo kaj respondas 404 al aliaj; `filtriProfilon` estas la sola loko por la videbleco, ankaŭ en la serĉado (en la SQL) kaj ĉe `/bildo`. |
| A02 | Kriptografiaj malsukcesoj | ✅ | Seancaj ĵetonoj de 32 hazardaj bajtoj; en D1 nur ilia SHA-256; kuketoj `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax`; HSTS; HMAC-kontrolo de Telegramo per konstanttempa komparo. |
| A03 | Injekto | ✅ | Ĉiu SQL uzas parametrojn; la nuraj interpoladoj estas lokokupiloj (`?`) aŭ konstantoj. Neniu `set:html` nek `dangerouslySetInnerHTML`. **CSP** kun haŝoj blokas ĉiun enmetitan skripton. Ligiloj validigitaj (nur `https:` kaj `mailto:`). |
| A04 | Nesekura dizajno | ✅ *korektita* | Minacmodelo (`docs/fazo-2/minacmodelo.md`). **Trovita:** ensalutinto povis elĉerpi la ĉiutagan limon de skriboj de D1 per ripetitaj konservoj. **Korektita:** `SKRIBA_LIMIGILO`, 20 skriboj minute por konto. |
| A05 | Misagordo | ✅ *korektita* | **Trovita:** neniuj sekurecaj kapoj. **Korektita:** CSP, `frame-ancestors 'none'`, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` en ĉiu respondo. La prova ensaluto havas tri serurojn kaj teston, ke produktado ne havas ĝin. |
| A06 | Vundeblaj komponantoj | ✅ | `npm audit`: 0 vundeblecoj. Dependabot monate por npm kaj GitHub Actions. |
| A07 | Identigaj malsukcesoj | ✅ | Neniuj pasvortoj (OAuth kaj Telegramo, ADR 0004); `state` kaj PKCE; Telegramaj datumoj validaj nur 5 minutojn; nova ĵetono ĉe ĉiu ensaluto; "Elsaluti el ĉiuj aparatoj". |
| A08 | Integreco de programaro kaj datumoj | ✅ | `package-lock.json` kaj `npm ci`; laborfluoj kun `permissions: contents: read`; produktado nur per mana aprobo; la sekretoj nur en GitHub kaj Cloudflare. |
| A09 | Registrado kaj monitorado | ✅ | Cloudflare Observability ŝaltita; neniu persona datumo en la protokoloj (neniu `console.log`); ĉiu moderiga ago registrita kun aŭtoro kaj dato; sankontrolo `/sano` post ĉiu deplojo. |
| A10 | SSRF | ✅ | La servilo vokas nur fiksajn adresojn de Google kaj GitHub; neniu adreso venas de la uzanto. |

## Korektoj en ĉi tiu fazo

1. **Sekurecaj kapoj kaj CSP** (`astro.config.mjs`, `src/middleware.ts`).
   - `script-src` permesas nur niajn skriptojn (per haŝoj, kalkulitaj de Astro) kaj `https://telegram.org` por la ensaluta fenestraĵo.
   - `style-src` havas `'unsafe-inline'`, ĉar la mapo pozicias la vezikojn per `style`-atributoj. La risko estas malgranda: CSS ne povas ruli kodon.
   - Pruvo: la E2E-testoj nun funkcias kun la vera CSP; eĉ la testa ilo estis blokita kiam ĝi provis `eval`.
2. **Tiparoj gastigitaj ĉe ni** (`@fontsource`). Antaŭe Google Fonts ricevis la IP-adreson de ĉiu vizitanto, kontraŭ la privateca postulo de la PRD. En Germanio, tribunalo jam monpunis retejon pro tio (LG München, 2022).
3. **Limo de skriboj**: 20 POST-petoj minute por konto (aŭ IP sen seanco). Respondo 429 post tio.

## Restantaj riskoj, akceptitaj

| Risko | Kial akceptita |
| --- | --- |
| La ensaluta paĝo ŝargas skripton de `telegram.org` | Necesa por la ensaluto per Telegramo; nur en `/ensaluti`, nur se Telegramo estas agordita. La uzanto elektas tiun provizanton. |
| Iu kun multaj kontoj povus ankoraŭ elĉerpi la skribojn | Ĉiu konto postulas veran konton de Google, GitHub aŭ Telegramo. Se D1 atingas la limon, la legado daŭre funkcias; la skriboj revenas je noktomezo UTC. |
| Neniu CAPTCHA | La aliĝo postulas eksteran konton; la rapidlimoj kovras la reston. |

## Kiel kontroli denove

- `npm audit` kaj `npm test` (inkluzive de `tests/origino.test.ts` por la kapoj kaj `tests/agordo.test.ts` por la rapidlimoj en ĉiu medio).
- `curl -sI https://<retejo>/` por vidi la kapojn.
