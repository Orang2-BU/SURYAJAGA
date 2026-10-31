import { describe, expect, it } from "vitest";
import { malamIni } from "./api";

describe("malamIni", () => {
  it("memakai tanggal WIB, bukan UTC", () => {
    expect(malamIni(new Date("2026-10-30T17:30:00Z"))).toBe("2026-10-31");
    expect(malamIni(new Date("2026-10-30T16:59:00Z"))).toBe("2026-10-30");
  });
});
