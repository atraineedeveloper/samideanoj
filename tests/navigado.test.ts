import { describe, expect, it } from "vitest";
import { aktivaSekcio, vojoSenLingvo } from "../src/lib/navigado";

describe("navigado", () => {
  it.each([
    ["/", "/"],
    ["/es/", "/"],
    ["/en", "/"],
    ["/es/sercxi/", "/sercxi"],
    ["/s/marisol/", "/s/marisol"],
    ["/estonio", "/estonio"],
  ])("vojoSenLingvo(%s) = %s", (a, b) => expect(vojoSenLingvo(a)).toBe(b));

  it.each([
    ["/", null, "mapo"],
    ["/es/sercxi/", null, "sercxi"],
    ["/mia-profilo/", "marisol", "profilo"],
    ["/en/agordoj", "marisol", "profilo"],
    ["/s/marisol/", "marisol", "profilo"],
    ["/s/tomaso/", "marisol", "alia"],
    ["/ensaluti", null, "profilo"],
  ])("aktivaSekcio(%s, %s) = %s", (v, slug, s) => expect(aktivaSekcio(v, slug)).toBe(s));
});
