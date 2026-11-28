# Alirebleco kaj rapideco

- **Dato:** 2026-11-27
- **Celoj de la PRD:** WCAG 2.2 AA; paĝo sub 1 MB; LCP sub 2,5 s en 4G.

## Alirebleco

**Ilo:** axe-core 4 (reguloj WCAG 2.0, 2.1 kaj 2.2, niveloj A kaj AA, kaj "best-practice"), en Chrome per Playwright.

**Amplekso:** 14 paĝoj × 2 grandecoj (labortablo 1280 px kaj poŝtelefono 390 px) = 28 kontroloj, kiel vizitanto kaj kiel moderiganto: hejmpaĝo, serĉado (malplena, kun filtriloj, sen rezultoj, hispane), profilo (fremda, propra, kaŝita), ensaluto, redaktado, agordoj, raporto, moderigado kaj 404.

**Trovitaj kaj korektitaj:**

| Problemo | Korekto |
| --- | --- |
| La emblemo havis la nomon "Hejmo", sed la videbla teksto estas "Samideanoj" (2.5.3) | La alirebla nomo nun estas la videbla teksto. |
| La vezikoj de Eŭropo en la monda mapo kovris unu la alian (2.5.8, celoj de 24 px) | `src/lib/mapaArangxo.ts` disigas la vezikojn, kun du aranĝoj: unu por labortablo kaj unu por poŝtelefono. Minimuma diametro 24 px. |

**Rezulto:** 0 malobservoj. Lighthouse: alirebleco 100 en ĉiuj paĝoj.

Jam antaŭe kontrolitaj per la E2E-testoj: la tuta serĉado kaj la mapo per klavaro; la serĉilo de urboj laŭ la ŝablono "combobox" de WAI-ARIA; formularoj kun etikedoj kaj erarmesaĝoj ligitaj al la kampoj; ĉio funkcias sen JavaScript krom la serĉilo de urboj kaj la profilbildo.

## Rapideco

**Ilo:** Lighthouse 12, poŝtelefona reĝimo kun simulita malrapida 4G (1,6 Mbit/s, 150 ms) kaj 4-oble malrapidigita procesoro. Mezurita tra prokurilo, kiu kunpremas per brotli kiel Cloudflare, ĉar la loka servilo ne kunpremas.

| Paĝo | Rendimento | LCP | Pezo |
| --- | --- | --- | --- |
| Hejmpaĝo (monda mapo) | 98–99 | 2,0 s | 192 KB |
| Serĉado en Meksiko | 98–99 | 2,0–2,1 s | 236 KB |
| Profilo | 99–100 | 0,7–1,7 s | 149 KB |

Ĉiuj: CLS 0, TBT 0 ms; plej bonaj praktikoj 100; SEO 100.

**Plibonigoj en ĉi tiu fazo:**

- La CSS (ĉ. 8 KB) estas enmetita en la paĝon: unu rondiro malpli antaŭ la unua bildo (FCP de 2,0 s al 0,8–1,9 s).
- La bazmapo havas `fetchpriority="high"`, ĉar ĝi estas la plej granda elemento (LCP).
- La tiparoj venas de nia domajno: neniu plia konekto al Google.
