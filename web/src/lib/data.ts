import mentah from "../../public/data/plts.json";
import prediksiMentah from "../../public/data/baterai/prediksi.json";
import metrikMentah from "../../public/data/baterai/metrik.json";
import cahayaMentah from "../../public/data/cahaya.json";
import panelMentah from "../../public/data/panel.json";
import lokasiMentah from "../../public/data/lokasi.json";
import type { Tone } from "@/components/ui";

// Satu-satunya pintu web ke public/data/*.json (ditulis skrip analisis, 02-AGENT §3).

export type Status = "normal" | "waspada" | "kritis" | "dalam_pemulihan";

export interface Plts {
  id: string;
  nama: string;
  desa: string;
  kabupaten: string;
  provinsi: string;
  /** Titik peta: lokasi PLTS dari OSM bila ada (titik "plts"), selain itu pusat desa/pulau. */
  lat: number;
  lon: number;
  titik: "plts" | "desa";
  kapasitas_kwp: number | null;
  baterai_kwh: number | null;
  jumlah_kk: number | null;
  jumlah_jiwa: number | null;
  koperasi: string | null;
  status: Status;
  alasan_status: string;
  tanggal_laporan: string | null;
  label_data: "laporan" | "contoh";
  sumber: string;
  sumber_lokasi: string;
  grup_uji: "mangkrak" | "pembanding" | null;
}

export const STATUS: Record<Status, { label: string; tone: Tone; urutan: number }> = {
  kritis: { label: "Kritis", tone: "crit", urutan: 0 },
  waspada: { label: "Waspada", tone: "warn", urutan: 1 },
  dalam_pemulihan: { label: "Dalam pemulihan", tone: "neutral", urutan: 2 },
  normal: { label: "Normal", tone: "ok", urutan: 3 },
};

/** Validasi bentuk data saat dimuat agar perubahan skrip analisis yang merusak format langsung ketahuan. */
export function validasiPlts(data: unknown): Plts[] {
  if (!Array.isArray(data)) throw new Error("plts.json harus berupa array");
  return data.map((p, i) => {
    const ok = p && typeof p.id === "string" && typeof p.lat === "number" && typeof p.lon === "number"
      && (p.titik === "plts" || p.titik === "desa") && p.status in STATUS && (p.label_data === "laporan" || p.label_data === "contoh");
    if (!ok) throw new Error(`plts.json baris ${i} tidak valid`);
    return p as Plts;
  });
}

export const DAFTAR_PLTS: Plts[] = validasiPlts(mentah);

export function cariPlts(id: string): Plts | undefined {
  return DAFTAR_PLTS.find(p => p.id === id);
}

/** "Laporan: sekitar 5 tahun ..." menjadi "Sekitar 5 tahun ...." untuk teks alasan status. */
export function kalimatAlasan(alasan: string): string {
  const isi = alasan.replace(/^(Laporan|Contoh): /, "");
  return `${isi.charAt(0).toUpperCase()}${isi.slice(1)}.`;
}

/** Urut dari yang paling butuh tindakan; laporan terbaru lebih dulu bila statusnya sama. */
export function urutkanPrioritas<T extends Plts>(daftar: T[]): T[] {
  return [...daftar].sort((a, b) =>
    STATUS[a.status].urutan - STATUS[b.status].urutan
    || (b.tanggal_laporan ?? "").localeCompare(a.tanggal_laporan ?? ""));
}

export function hitungStatus(daftar: Plts[]): Record<Status, number> {
  const hasil: Record<Status, number> = { kritis: 0, waspada: 0, dalam_pemulihan: 0, normal: 0 };
  for (const p of daftar) hasil[p.status] += 1;
  return hasil;
}

const BULAN = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" });

/** Keterangan asal data untuk chip: "Laporan Mar 2022" atau "Data contoh". */
export function labelData(p: Plts): string {
  if (p.label_data === "contoh" || !p.tanggal_laporan) return "Data contoh";
  return `Laporan ${BULAN.format(new Date(p.tanggal_laporan))}`;
}

// Prediksi baterai (ditulis analisis/baterai/latih.py).

export type PrediksiBaterai =
  | { plts_id: string; tersedia: false; alasan: string }
  | {
    plts_id: string;
    tersedia: true;
    label_data: "simulasi";
    /** Ada untuk PLTS kasus nyata: lintasan simulasi untuk peragaan, bukan pengukuran BMS PLTS itu. */
    catatan?: string;
    p_gagal_26_minggu: number;
    minggu_tersisa: number;
    fitur: { soh_bms: number; tren_soh: number; proyeksi_minggu: number };
    riwayat_soh: { hari: number; soh_bms: number }[];
  };

export function validasiPrediksi(data: unknown): PrediksiBaterai[] {
  if (!Array.isArray(data)) throw new Error("prediksi.json harus berupa array");
  return data.map((p, i) => {
    const ok = p && typeof p.plts_id === "string" && (p.tersedia === false
      ? typeof p.alasan === "string"
      : p.tersedia === true && typeof p.p_gagal_26_minggu === "number" && typeof p.minggu_tersisa === "number"
        && Array.isArray(p.riwayat_soh) && p.riwayat_soh.length > 1);
    if (!ok) throw new Error(`prediksi.json baris ${i} tidak valid`);
    return p as PrediksiBaterai;
  });
}

const DAFTAR_PREDIKSI = validasiPrediksi(prediksiMentah);

export function prediksiUntuk(id: string): PrediksiBaterai | undefined {
  return DAFTAR_PREDIKSI.find(p => p.plts_id === id);
}

/** Bagian metrik.json yang dipakai tampilan prediksi. */
export const METRIK_BATERAI: { model: string; horizon_minggu: number; mae_minggu: number } = {
  model: metrikMentah.model,
  horizon_minggu: metrikMentah.horizon_minggu,
  mae_minggu: metrikMentah.mae_minggu_tersisa.nilai,
};

export interface KinerjaAmbang { ambang: number; recall: number; presisi: number; recall_aus: number; recall_mendadak: number | null }

/** Metrik lengkap untuk P10. Diambil dari metrik.json apa adanya (ditulis analisis/baterai/latih.py). */
export const EVALUASI_BATERAI: {
  data: string; catatan_metode: string; hash_data: string; pr_auc: number; jumlah_baterai: { latih: number; uji: number };
  jumlah_catatan_uji: number; positif_uji: number; per_ambang: KinerjaAmbang[];
  pembanding_tanpa_ml: { aturan: string; recall: number; presisi: number };
  fitur_penting: { fitur: string; nama: string; kontribusi: number }[];
  uji_silang: { dataset: string; pemetaan: string; jumlah_sel: number; jumlah_catatan: number; positif: number; pr_auc: number;
    per_ambang: KinerjaAmbang[]; median_p_pada_positif: number };
} = metrikMentah;

// Cahaya malam desa uji (ditulis analisis/cahaya_malam/analisis.py, aturan 03-ARCHITECTURE Q11).

export type StatusCahaya = "terdeteksi" | "tidak_terdeteksi" | "sinyal_lemah";

export interface DeretCahaya {
  desa_id: string;
  nama: string;
  grup: "mangkrak" | "pembanding" | "contoh";
  garis_dasar: number | null;
  status: StatusCahaya;
  bulan_anomali_berturut: number;
  anomali_mulai: string | null;
  bulan_berdata: number;
  bulan_total: number;
  malam_cerah: number;
  malam_total: number;
  malam_gelap: number | null;
  bulanan: { bulan: string; radiansi: number | null; piksel_valid: number }[];
  harian: { tanggal: string; radiansi: number | null; piksel_valid: number }[];
}

export interface MetodeCahaya {
  produk: string;
  jendela: string;
  periode_dasar: string;
  rasio_anomali: number;
  bulan_berturut: number;
  dasar_minimum: number;
  satuan: string;
}

const STATUS_CAHAYA: StatusCahaya[] = ["terdeteksi", "tidak_terdeteksi", "sinyal_lemah"];

/** desa = hasil uji asli (P9); contoh = deret contoh berlabel untuk PLTS fiktif, tidak termasuk hasil uji. */
export function validasiCahaya(data: unknown): { metode: MetodeCahaya; desa: DeretCahaya[]; contoh: DeretCahaya[] } {
  const d = data as { metode?: MetodeCahaya; desa?: unknown; contoh?: unknown };
  if (!d || typeof d.metode?.rasio_anomali !== "number" || !Array.isArray(d.desa)) throw new Error("cahaya.json tidak valid");
  d.desa.forEach((x: DeretCahaya, i) => {
    if (!x || typeof x.desa_id !== "string" || !STATUS_CAHAYA.includes(x.status) || !Array.isArray(x.bulanan) || x.bulanan.length < 2)
      throw new Error(`cahaya.json desa ${i} tidak valid`);
  });
  if (!Array.isArray(d.contoh) || d.contoh.some((x: DeretCahaya) => x?.grup !== "contoh")) throw new Error("cahaya.json bagian contoh tidak valid");
  return d as { metode: MetodeCahaya; desa: DeretCahaya[]; contoh: DeretCahaya[] };
}

export const CAHAYA = validasiCahaya(cahayaMentah);

export function cahayaUntuk(id: string): DeretCahaya | undefined {
  return CAHAYA.desa.find(d => d.desa_id === id) ?? CAHAYA.contoh.find(d => d.desa_id === id);
}

// Kondisi panel dari Sentinel-2 (ditulis analisis/panel/analisis.py, 03-ARCHITECTURE Q12).

export interface KondisiPanel {
  plts_id: string;
  /** null bila poligon bukan dari OSM (penafsiran citra) atau PLTS contoh. */
  osm_way: string | null;
  sumber_poligon: string;
  label_data: "asli" | "contoh";
  status: "naik" | "turun" | "stabil" | "data_kurang";
  beda_ndvi: number | null;
  tahunan: { tahun: number; adegan: number; ndvi_dalam: number | null; ndvi_sekitar: number | null }[];
}

export interface MetodePanel {
  produk: string;
  musim: string;
  cincin_m: number;
  ambang_ubah: number;
  poligon: string;
}

export function validasiPanel(data: unknown): { metode: MetodePanel; plts: KondisiPanel[] } {
  const d = data as { metode?: MetodePanel; plts?: unknown };
  if (!d || typeof d.metode?.ambang_ubah !== "number" || !Array.isArray(d.plts)) throw new Error("panel.json tidak valid");
  d.plts.forEach((x: KondisiPanel, i) => {
    if (!x || typeof x.plts_id !== "string" || !["naik", "turun", "stabil", "data_kurang"].includes(x.status) || !Array.isArray(x.tahunan))
      throw new Error(`panel.json baris ${i} tidak valid`);
  });
  return d as { metode: MetodePanel; plts: KondisiPanel[] };
}

export const PANEL = validasiPanel(panelMentah);

export function panelUntuk(id: string): KondisiPanel | undefined {
  return PANEL.plts.find(p => p.plts_id === id);
}

// Estimasi calon lokasi PLTS (ditulis analisis/lokasi/estimasi.py, 03-ARCHITECTURE Q13).

export type KeputusanLokasi = "prioritas" | "layak_dengan_pendampingan" | "perlu_skema_perawatan";
type Rentang = [number, number, number]; // persentil 10, 50, 90

export interface CalonLokasi {
  id: string;
  nama: string | null;
  lat: number;
  lon: number;
  penduduk: number;
  kk: number;
  radiasi_kwh_m2_hari: number;
  kebutuhan_kwh_hari: number;
  panel_kwp: number;
  baterai_kwh: number;
  beban_puncak_kw: number;
  waktu_tempuh_jam: number | null;
  faktor_logistik: number;
  jarak_jaringan_km: number | null;
  anggaran_rp: Rentang;
  anggaran_per_kk_rp: Rentang;
  biaya_rp_kwh: Rentang;
  rasio_genset: number;
  solar_dihemat_l_tahun: number;
  co2_dicegah_t_tahun: number;
  risiko: "rendah" | "sedang" | "tinggi";
  alasan_risiko: string[];
  keputusan: KeputusanLokasi;
}

export interface EstimasiLokasi {
  wilayah: { id: string; nama: string; provinsi: string; sumber_3t: string };
  metode: { genset_rp_kwh: number; simulasi: number; kwh_per_kk_hari: number; art: number; pr: number; faktor_beban: number;
    capex_median_usd_kw: number; bunga: number; umur_tahun: number; penduduk_min: number; ruas_jaringan_osm: number };
  permukiman: CalonLokasi[];
}

export const KEPUTUSAN_LOKASI: Record<KeputusanLokasi, { label: string; tone: Tone }> = {
  prioritas: { label: "Prioritas", tone: "ok" },
  layak_dengan_pendampingan: { label: "Layak dengan pendampingan", tone: "warn" },
  perlu_skema_perawatan: { label: "Perlu skema perawatan", tone: "crit" },
};

const rentang = (x: unknown) => Array.isArray(x) && x.length === 3 && x.every(v => typeof v === "number");

export function validasiLokasi(data: unknown): EstimasiLokasi {
  const d = data as { metode?: { genset_rp_kwh?: unknown }; permukiman?: unknown };
  if (!d || typeof d.metode?.genset_rp_kwh !== "number" || !Array.isArray(d.permukiman)) throw new Error("lokasi.json tidak valid");
  d.permukiman.forEach((x: CalonLokasi, i) => {
    if (!x || typeof x.id !== "string" || typeof x.lat !== "number" || !(x.keputusan in KEPUTUSAN_LOKASI)
      || !rentang(x.anggaran_rp) || !rentang(x.biaya_rp_kwh)) throw new Error(`lokasi.json baris ${i} tidak valid`);
  });
  return d as EstimasiLokasi;
}

export const LOKASI = validasiLokasi(lokasiMentah);

export function cariLokasi(id: string): CalonLokasi | undefined {
  return LOKASI.permukiman.find(p => p.id === id);
}

const MILIAR = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** "Rp1,2 miliar" atau "Rp640 juta". */
export function rupiahRingkas(n: number): string {
  return n >= 1e9 ? `Rp${MILIAR.format(n / 1e9)} miliar` : `Rp${MILIAR.format(Math.round(n / 1e6))} juta`;
}
