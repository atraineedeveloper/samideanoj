/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** La ensalutinta uzanto, aŭ null. */
    uzanto: import("./lib/seancoj").SeancaUzanto | null;
    /** Kiu rigardas: uzata de la videbleca filtrilo. */
    rigardanto: import("./lib/tipoj").Rigardanto;
  }
}
