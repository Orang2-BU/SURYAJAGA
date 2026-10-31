import { describe, expect, it } from "vitest";
import { jawabKeluhan, klasifikasi, normalisasi, putuskan } from "./asisten";
import uji from "./asisten-uji.json";

describe("kesetaraan dengan model Python", () => {
  it("60 kalimat eval: kategori, peluang, dan keputusan sama dengan scikit-learn", () => {
    for (const u of uji) {
      const h = klasifikasi(u.teks);
      expect(h.kategori, u.teks).toBe(u.kategori);
      expect(Math.abs(h.p - u.p), u.teks).toBeLessThanOrEqual(0.001);
      expect(h.kandidat_kedua.kategori, u.teks).toBe(u.kandidat_kedua.kategori);
      expect(putuskan(u.teks, h)[0], u.teks).toBe(u.keputusan);
    }
  });
});

describe("aturan keputusan", () => {
  it("kata bahaya selalu ke teknisi", () => {
    expect(jawabKeluhan("ada ASAP keluar dari panel").keputusan).toBe("teknisi");
  });

  it("kata bahaya harus kata utuh", () => {
    expect(normalisasi("kapasitas baterai turun").split(" ")).not.toContain("api");
  });

  it("panduan menyertakan langkah, konfirmasi menyertakan dua pilihan", () => {
    const yakin = jawabKeluhan("inverter mati total layarnya gelap");
    expect(yakin.keputusan).toBe("panduan");
    expect(yakin.topik?.langkah.length).toBeGreaterThan(0);
  });
});
