import { describe, expect, it } from "vitest";
import { NAVIGATION, PAGES, isActive, matchPage } from "./nav";

describe("isActive", () => {
  it("menandai link aktif pada halamannya sendiri", () => {
    expect(isActive("/pemantauan", "/pemantauan")).toBe(true);
  });

  it("menandai link aktif pada sub-halaman", () => {
    expect(isActive("/pemantauan/parang", "/pemantauan")).toBe(true);
  });

  it("tidak menandai rute lain yang hanya berawalan sama", () => {
    expect(isActive("/peringatan-lama", "/peringatan")).toBe(false);
  });
});

describe("matchPage", () => {
  it("mencocokkan rute statis", () => {
    expect(matchPage("/bukti/baterai")?.id).toBe("P10");
  });

  it("mencocokkan rute dinamis", () => {
    expect(matchPage("/pemantauan/parang")?.id).toBe("P3");
  });

  it("mengembalikan undefined untuk rute yang tidak dikenal", () => {
    expect(matchPage("/tidak-ada")).toBeUndefined();
  });
});

describe("NAVIGATION", () => {
  it("hanya berisi rute yang terdaftar di PAGES", () => {
    for (const { routes } of NAVIGATION) {
      for (const route of routes) expect(PAGES[route]).toBeDefined();
    }
  });
});
