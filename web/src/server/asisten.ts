// Asisten keluhan (F5) yang berjalan di server Next.js. Model dilatih di Python (api/app/keluhan.py) dan
// diekspor lewat `python api/ekspor_web.py`; berkas ini hanya inferensi dan aturan keputusan dari config.py.
// Hanya diimpor route handler, jadi bobot model tidak ikut ke browser.
import data from "./asisten.json";

export interface Topik {
  kategori: string;
  label: string;
  judul: string;
  tingkat_bahaya: "rendah" | "sedang" | "tinggi";
  wajib_teknisi: boolean;
  langkah: string[];
}

const MODEL = data as Omit<typeof data, "panduan"> & { panduan: Topik[] };
const INDEKS = new Map(MODEL.kosakata.map((k, i) => [k, i]));
const BAHAYA = new Set(MODEL.kata_bahaya);

/** Sama dengan keluhan.normalisasi: huruf kecil, selain huruf/angka jadi spasi. */
export function normalisasi(teks: string): string {
  return teks.toLowerCase().replace(/[^0-9a-z]+/g, " ").trim().split(/\s+/).filter(Boolean).join(" ");
}

/** N-gram huruf per kata dengan spasi di kedua sisi, sama dengan analyzer "char_wb" scikit-learn. */
function ngram(teks: string): string[] {
  const [min, max] = MODEL.ngram;
  const hasil: string[] = [];
  for (const kata of teks.split(" ").filter(Boolean)) {
    const w = ` ${kata} `;
    for (let n = min; n <= max; n++) {
      let i = 0;
      hasil.push(w.slice(i, i + n));
      while (i + n < w.length) { i++; hasil.push(w.slice(i, i + n)); }
      if (i === 0) break; // kata lebih pendek dari n: hanya dihitung sekali
    }
  }
  return hasil;
}

/** Peluang tiap kelas: TF-IDF (tf sublinear, normalisasi L2) lalu softmax regresi logistik multinomial. */
function peluang(teks: string): number[] {
  const hitung = new Map<number, number>();
  for (const g of ngram(normalisasi(teks))) {
    const j = INDEKS.get(g);
    if (j !== undefined) hitung.set(j, (hitung.get(j) ?? 0) + 1);
  }
  const fitur = [...hitung].map(([j, tf]) => [j, (1 + Math.log(tf)) * MODEL.idf[j]] as const);
  const panjang = Math.hypot(...fitur.map(([, v]) => v)) || 1;
  const skor = MODEL.bobot.map((baris, k) => fitur.reduce((s, [j, v]) => s + baris[j] * v / panjang, MODEL.intersep[k]));
  const puncak = Math.max(...skor);
  const eks = skor.map(s => Math.exp(s - puncak));
  const total = eks.reduce((a, b) => a + b, 0);
  return eks.map(e => e / total);
}

const bulat = (x: number) => Math.round(x * 1000) / 1000;

export function klasifikasi(teks: string) {
  const p = peluang(teks);
  const urut = p.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]);
  return {
    kategori: MODEL.kelas[urut[0][1]], p: bulat(urut[0][0]),
    kandidat_kedua: { kategori: MODEL.kelas[urut[1][1]], p: bulat(urut[1][0]) },
  };
}

export function topik(kategori: string): Topik | undefined {
  return MODEL.panduan.find(t => t.kategori === kategori);
}

/** Sama dengan keluhan.putuskan: kode yang memutuskan dari p, bukan model. */
export function putuskan(teks: string, hasil: ReturnType<typeof klasifikasi>): ["panduan" | "konfirmasi" | "teknisi", string] {
  if (normalisasi(teks).split(" ").some(k => BAHAYA.has(k))) return ["teknisi", "bahaya"];
  if (topik(hasil.kategori)?.wajib_teknisi) return ["teknisi", "wajib_teknisi"];
  if (hasil.p >= MODEL.ambang.panduan) return ["panduan", "yakin"];
  if (hasil.p >= MODEL.ambang.konfirmasi) return ["konfirmasi", "ragu"];
  return ["teknisi", "tidak_yakin"];
}

/** Jawaban lengkap, bentuknya sama dengan POST /keluhan di api/app/main.py. */
export function jawabKeluhan(teks: string) {
  const hasil = klasifikasi(teks);
  const [keputusan, alasan] = putuskan(teks, hasil);
  return {
    ...hasil, keputusan, alasan,
    ...(keputusan === "panduan" || alasan === "wajib_teknisi" ? { topik: topik(hasil.kategori) } : {}),
    ...(keputusan === "konfirmasi" ? { pilihan: [hasil.kategori, hasil.kandidat_kedua.kategori].map(k => ({ kategori: k, label: topik(k)?.label ?? k })) } : {}),
  };
}

export const PESAN_MAKS = MODEL.pesan_maks;
