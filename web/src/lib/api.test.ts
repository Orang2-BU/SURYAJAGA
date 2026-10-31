import { describe, expect, it } from "vitest";
import { malamIni, terapkanPeringatan, type Peringatan } from "./api";
import { DAFTAR_PLTS } from "./data";

describe("malamIni", () => {
  it("memakai tanggal WIB, bukan UTC", () => {
    expect(malamIni(new Date("2026-10-30T17:30:00Z"))).toBe("2026-10-31");
    expect(malamIni(new Date("2026-10-30T16:59:00Z"))).toBe("2026-10-30");
  });
});

describe("terapkanPeringatan", () => {
  const parang = DAFTAR_PLTS.find(p => p.id === "parang")!;
  const peringatan = (status: Peringatan["status"], dibuat: string): Peringatan =>
    ({ id: dibuat, plts_id: "parang", kategori: "padam", pesan: "x", status, dibuat, riwayat: [] });

  it("peringatan terakhir selesai membuat PLTS kritis dalam pemulihan", () => {
    const [hasil] = terapkanPeringatan([parang], [peringatan("selesai", "2026-10-31T01:00:00+00:00")]);
    expect(hasil.status).toBe("dalam_pemulihan");
  });

  it("yang menentukan hanya peringatan terbaru", () => {
    const [hasil] = terapkanPeringatan([parang], [
      peringatan("selesai", "2026-10-30T01:00:00+00:00"),
      peringatan("dibaca", "2026-10-31T01:00:00+00:00"),
    ]);
    expect(hasil.status).toBe("kritis");
    expect(hasil.peringatan?.status).toBe("dibaca");
  });

  it("tanpa peringatan status tetap dari data", () => {
    const [hasil] = terapkanPeringatan([parang], []);
    expect(hasil.status).toBe(parang.status);
    expect(hasil.peringatan).toBeNull();
  });
});
