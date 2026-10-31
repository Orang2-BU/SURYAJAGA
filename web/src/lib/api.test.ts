import { beforeEach, describe, expect, it } from "vitest";
import { ambilLaporanMalam, daftarPeringatan, dugaanPadam, kirimLaporanMalam, kirimPeringatan, malamIni, terapkanPeringatan, ubahStatusPeringatan, type Peringatan } from "./api";
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

// Penyimpanan browser tiruan; aturan harus sama dengan api/tests/test_api.py.
beforeEach(() => {
  const isi = new Map<string, string>();
  globalThis.localStorage = { getItem: k => isi.get(k) ?? null, setItem: (k, v) => void isi.set(k, v) } as Storage;
});

describe("penyimpanan peringatan", () => {
  it("peringatan baru berstatus terkirim dan bisa dibaca per PLTS", async () => {
    const p = await kirimPeringatan({ plts_id: "parang", kategori: "padam", pesan: "Lampu desa padam" });
    expect(p.status).toBe("terkirim");
    expect((await daftarPeringatan("parang")).map(x => x.id)).toEqual([p.id]);
    expect(await daftarPeringatan("lakarama")).toEqual([]);
  });

  it("transisi status mengikuti alur dan selesai bersifat final", async () => {
    const { id } = await kirimPeringatan({ plts_id: "parang", kategori: "padam", pesan: "x" });
    await expect(ubahStatusPeringatan(id, "selesai")).rejects.toThrow("409");
    await ubahStatusPeringatan(id, "dibaca");
    const akhir = await ubahStatusPeringatan(id, "selesai");
    expect(akhir.riwayat.map(r => r.status)).toEqual(["terkirim", "dibaca", "selesai"]);
    await expect(ubahStatusPeringatan(id, "dibaca")).rejects.toThrow("409");
    await expect(ubahStatusPeringatan("tidak-ada", "dibaca")).rejects.toThrow("404");
  });

  it("pesan kosong atau lebih dari 500 karakter ditolak", async () => {
    await expect(kirimPeringatan({ plts_id: "parang", kategori: "padam", pesan: " " })).rejects.toThrow("422");
    await expect(kirimPeringatan({ plts_id: "parang", kategori: "padam", pesan: "x".repeat(501) })).rejects.toThrow("422");
  });
});

describe("laporan malam", () => {
  it.each([
    [["tidak", "tidak"], true], [[null, "tidak"], true], [["tidak", "ya"], false], [["ya", "tidak"], false], [["tidak"], false],
  ] as const)("jawaban %j → dugaan padam %s", (jawaban, padam) => {
    expect(dugaanPadam(jawaban.map((j, i) => ({ plts_id: "parang", tanggal: `2026-10-0${i + 1}`, jawaban: j })))).toBe(padam);
  });

  it("jawaban baru untuk malam yang sama menggantikan yang lama", async () => {
    await kirimLaporanMalam({ plts_id: "parang", tanggal: "2026-10-30", jawaban: null });
    await kirimLaporanMalam({ plts_id: "parang", tanggal: "2026-10-30", jawaban: "tidak" });
    await kirimLaporanMalam({ plts_id: "parang", tanggal: "2026-10-31", jawaban: "tidak" });
    const r = await ambilLaporanMalam("parang");
    expect(r.laporan.map(x => x.jawaban)).toEqual(["tidak", "tidak"]);
    expect(r.dugaan_padam).toBe(true);
  });
});
