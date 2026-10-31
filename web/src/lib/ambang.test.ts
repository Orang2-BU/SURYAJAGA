import { describe, expect, it } from "vitest";
import { tingkatBaterai } from "./ambang";

describe("tingkatBaterai", () => {
  it("memetakan peluang ke tingkat sesuai 03-ARCHITECTURE §5, batas bawah termasuk", () => {
    expect([0.49, 0.5, 0.69, 0.7, 0.89, 0.9, 1].map(tingkatBaterai))
      .toEqual(["normal", "perlu_dicek", "perlu_dicek", "waspada", "waspada", "kritis", "kritis"]);
  });
});
