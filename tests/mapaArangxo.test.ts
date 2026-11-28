import { describe, expect, it } from "vitest";
import { disigiVezikojn } from "../src/lib/mapaArangxo";
import type { ViewBox } from "../src/lib/projekcio";

const VIDO: ViewBox = [0, 0, 960, 468];
const k = 640 / 960;

describe("disigiVezikojn", () => {
  it("disigas vezikojn, kiuj kovras unu la alian (ekz. Eŭropo)", () => {
    const v = [
      { x: 480, y: 120, r: 15 },
      { x: 486, y: 118, r: 14 },
      { x: 490, y: 125, r: 12 },
      { x: 478, y: 128, r: 12 },
    ];
    disigiVezikojn(v, VIDO);
    for (let i = 0; i < v.length; i++) {
      for (let j = i + 1; j < v.length; j++) {
        const d = Math.hypot(v[i].x - v[j].x, v[i].y - v[j].y) * k;
        expect(d).toBeGreaterThanOrEqual(v[i].r + v[j].r);
      }
    }
  });

  it("ne movas vezikojn, kiuj jam havas spacon", () => {
    const v = [
      { x: 100, y: 100, r: 12 },
      { x: 600, y: 300, r: 12 },
    ];
    disigiVezikojn(v, VIDO);
    expect(v).toEqual([
      { x: 100, y: 100, r: 12 },
      { x: 600, y: 300, r: 12 },
    ]);
  });

  it("samlokaj vezikoj ankaŭ disiĝas", () => {
    const v = [
      { x: 300, y: 200, r: 12 },
      { x: 300, y: 200, r: 12 },
    ];
    disigiVezikojn(v, VIDO);
    expect(Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) * k).toBeGreaterThanOrEqual(24);
  });
});
