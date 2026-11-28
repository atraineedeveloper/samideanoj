// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Vidu ADR 0002 (Cloudflare) kaj ADR 0003 (Astro kun React-insuloj).
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react()],
  // Niaj seancoj vivas en D1 (ADR 0004); ne uzu la KV-seancojn de Astro.
  session: false,
  // La CSS estas malgranda (ĉ. 8 KB): enmeti ĝin en la paĝon ŝparas rondiron
  // en malrapida konekto (docs/fazo-5/rapideco.md).
  build: { inlineStylesheets: "always" },
  // Content Security Policy (docs/fazo-5/sekureco.md). Astro aldonas la haŝojn de
  // siaj propraj skriptoj; ĉiu alia enmetita skripto estas blokita.
  // La kapoj, kiujn <meta> ne subtenas (frame-ancestors ktp.), venas el src/middleware.ts.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' blob: data:",
        "font-src 'self'",
        "connect-src 'self'",
        // La ensaluta fenestraĵo de Telegramo.
        "frame-src https://oauth.telegram.org",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", "https://telegram.org"] },
      // 'unsafe-inline' nur por stiloj: la mapo pozicias la vezikojn per style-atributoj.
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  i18n: {
    locales: ["eo", "es", "en"],
    defaultLocale: "eo",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
