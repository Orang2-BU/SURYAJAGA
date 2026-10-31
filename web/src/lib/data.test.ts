import { describe, expect, it } from "vitest";
import { CAHAYA, DAFTAR_PLTS, LOKASI, rupiahRingkas, validasiLokasi, cahayaUntuk, hitungStatus, PANEL, panelUntuk, validasiPanel, kalimatAlasan, labelData, prediksiUntuk, urutkanPrioritas, validasiCahaya, validasiPlts, validasiPrediksi, type Plts } from "./data";

const contoh = (ubah: Partial<Plts>): Plts => ({ ...DAFTAR_PLTS[0], ...ubah });

describe("validasiPlts", () => {
  it("menerima data hasil skrip analisis", () => {
    expect(DAFTAR_PLTS.length).toBeGreaterThan(0);
  });

  it("menolak status yang tidak dikenal", () => {
    expect(() => validasiPlts([{ ...DAFTAR_PLTS[0], status: "rusak" }])).toThrow("baris 0");
  });

  it("menolak jenis titik lokasi yang tidak dikenal", () => {
    expect(() => validasiPlts([{ ...DAFTAR_PLTS[0], titik: "kira-kira" }])).toThrow("baris 0");
  });

  it("menolak data yang bukan array", () => {
    expect(() => validasiPlts({})).toThrow("array");
  });
});

describe("urutkanPrioritas", () => {
  it("menaruh kritis paling atas dan laporan terbaru lebih dulu", () => {
    const hasil = urutkanPrioritas([
      contoh({ id: "a", status: "normal" }),
      contoh({ id: "b", status: "kritis", tanggal_laporan: "2020-01-01" }),
      contoh({ id: "c", status: "kritis", tanggal_laporan: "2025-01-01" }),
      contoh({ id: "d", status: "waspada" }),
    ]);

    expect(hasil.map(p => p.id)).toEqual(["c", "b", "d", "a"]);
  });
});

describe("hitungStatus", () => {
  it("menjumlah per status dan totalnya sama dengan jumlah PLTS", () => {
    const hasil = hitungStatus(DAFTAR_PLTS);

    expect(Object.values(hasil).reduce((a, b) => a + b, 0)).toBe(DAFTAR_PLTS.length);
  });
});

describe("labelData", () => {
  it("menulis bulan laporan dalam bahasa Indonesia", () => {
    expect(labelData(contoh({ label_data: "laporan", tanggal_laporan: "2022-03-12" }))).toBe("Laporan Mar 2022");
  });

  it("menandai data contoh", () => {
    expect(labelData(contoh({ label_data: "contoh", tanggal_laporan: null }))).toBe("Data contoh");
  });
});

describe("kalimatAlasan", () => {
  it("membuang awalan asal data dan menjadikannya kalimat", () => {
    expect(kalimatAlasan("Laporan: baterai rusak sejak 2019")).toBe("Baterai rusak sejak 2019.");
  });
});

describe("validasiPrediksi", () => {
  it("setiap PLTS punya prediksi atau alasan tidak tersedia", () => {
    for (const p of DAFTAR_PLTS) expect(prediksiUntuk(p.id)).toBeDefined();
  });

  it("menolak prediksi tersedia tanpa riwayat kapasitas", () => {
    expect(() => validasiPrediksi([{ plts_id: "x", tersedia: true, p_gagal_26_minggu: 0.4, minggu_tersisa: 30, riwayat_soh: [] }])).toThrow("baris 0");
  });
});

describe("validasiCahaya", () => {
  it("setiap desa uji punya deret cahaya malam", () => {
    for (const p of DAFTAR_PLTS.filter(x => x.grup_uji)) expect(cahayaUntuk(p.id)).toBeDefined();
  });

  it("menolak status deteksi yang tidak dikenal", () => {
    expect(() => validasiCahaya({ ...CAHAYA, desa: [{ ...CAHAYA.desa[0], status: "mungkin" }] })).toThrow("desa 0");
  });
});

describe("validasiPanel", () => {
  it("setiap PLTS bertitik OSM punya deret Sentinel-2", () => {
    for (const p of DAFTAR_PLTS.filter(x => x.titik === "plts")) expect(panelUntuk(p.id)).toBeDefined();
  });

  it("menolak status perubahan yang tidak dikenal", () => {
    expect(() => validasiPanel({ ...PANEL, plts: [{ ...PANEL.plts[0], status: "rusak" }] })).toThrow("baris 0");
  });
});

describe("validasiLokasi", () => {
  it("setiap calon lokasi punya rentang anggaran yang naik", () => {
    for (const p of LOKASI.permukiman) expect(p.anggaran_rp[0]).toBeLessThanOrEqual(p.anggaran_rp[2]);
  });

  it("menolak keputusan yang tidak dikenal", () => {
    expect(() => validasiLokasi({ ...LOKASI, permukiman: [{ ...LOKASI.permukiman[0], keputusan: "bagus" }] })).toThrow("baris 0");
  });
});

describe("rupiahRingkas", () => {
  it("menulis miliar dan juta dengan koma desimal", () => {
    expect(rupiahRingkas(1_250_000_000)).toBe("Rp1,3 miliar");
    expect(rupiahRingkas(640_400_000)).toBe("Rp640 juta");
  });
});
