import type { Tone } from "@/components/ui";
import type { Plts } from "@/lib/data";
import ATURAN from "./aturan.json";

// Purwarupa online: peringatan dan laporan malam disimpan di browser (aturannya sama dengan api/app/main.py,
// diekspor ke aturan.json); klasifikasi keluhan berjalan di server Next.js (src/app/api, src/server).

export type Jawaban = "ya" | "tidak";

export interface LaporanMalam {
  plts_id: string;
  tanggal: string;
  jawaban: Jawaban | null;
  /** Contoh peragaan, bukan jawaban operator sungguhan. */
  contoh?: boolean;
}

export interface RingkasanLaporanMalam {
  plts_id: string;
  dugaan_padam: boolean;
  malam_berturut: number;
  laporan: LaporanMalam[];
}

export type KategoriPeringatan = "baterai" | "padam" | "panel" | "lainnya";
export type StatusPeringatan = "terkirim" | "dibaca" | "ditangani" | "selesai" | "eskalasi";

export interface Peringatan {
  id: string;
  plts_id: string;
  kategori: KategoriPeringatan;
  pesan: string;
  status: StatusPeringatan;
  dibuat: string;
  riwayat: { status: StatusPeringatan; waktu: string }[];
}

export const KATEGORI_PERINGATAN: Record<KategoriPeringatan, string> = { baterai: "Baterai", padam: "Padam", panel: "Panel surya", lainnya: "Lainnya" };

// Urutan = urutan alur, dipakai filter P5.
export const STATUS_PERINGATAN: Record<StatusPeringatan, { label: string; tone: Tone }> = {
  terkirim: { label: "Terkirim", tone: "neutral" },
  dibaca: { label: "Dibaca", tone: "neutral" },
  ditangani: { label: "Ditangani", tone: "neutral" },
  eskalasi: { label: "Diteruskan ke teknisi", tone: "warn" },
  selesai: { label: "Selesai", tone: "ok" },
};

/** Bentuk galat yang sama dengan API: status HTTP di pesan. */
const galat = (status: number) => new Error(`API ${status}`);

function baca<T>(kunci: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(`suryajaga:${kunci}`) ?? "[]") as T[];
  } catch {
    throw galat(503); // penyimpanan browser diblokir: tampil sebagai layanan tidak tersedia
  }
}

function tulis<T>(kunci: string, isi: T[]) {
  localStorage.setItem(`suryajaga:${kunci}`, JSON.stringify(isi));
}

const sekarang = () => new Date().toISOString();

export const PESAN_MAKS = ATURAN.pesan_maks;

/** True bila N malam terakhir berturut dijawab "tidak" atau tidak dibalas (F15), sama dengan api/app/main.py. */
export function dugaanPadam(laporan: LaporanMalam[]): boolean {
  const n = ATURAN.malam_berturut_padam;
  const terakhir = [...laporan].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(-n);
  return terakhir.length === n && terakhir.every(x => x.jawaban !== "ya");
}

// Contoh peragaan 14 malam terakhir (sampai kemarin), selaras dengan status di plts.json:
// y = menyala, t = tidak menyala, - = tidak dijawab. Jawaban operator di browser menggantikan malam yang sama.
const POLA_CONTOH: Record<string, string> = {
  parang: "tt-ttttt-ttttt",
  lakarama: "ttt-tttttt-ttt",
  "burung-loe": "-ttttttttttttt",
  "karimunjawa-contoh": "yyyyytyyyytyyy",
  "genting-contoh": "yyyyyyyyyyyyyy",
  sembur: "yyyyyyyyyyyyyy",
  "batu-bingkung": "yyyyyyy-yyyyyy",
};

/** Tanggal WIB n hari sebelum `dari` (YYYY-MM-DD). */
function mundur(dari: string, n: number): string {
  const d = new Date(`${dari}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function laporanContoh(pltsId: string, hariIni = malamIni()): LaporanMalam[] {
  const pola = POLA_CONTOH[pltsId] ?? "";
  return [...pola].map((c, i) => ({
    plts_id: pltsId, tanggal: mundur(hariIni, pola.length - i), contoh: true,
    jawaban: c === "y" ? "ya" : c === "t" ? "tidak" : null,
  }));
}

export async function ambilLaporanMalam(pltsId: string): Promise<RingkasanLaporanMalam> {
  const asli = baca<LaporanMalam>("laporan_malam").filter(x => x.plts_id === pltsId);
  const tanggalAsli = new Set(asli.map(x => x.tanggal));
  const milik = [...laporanContoh(pltsId).filter(x => !tanggalAsli.has(x.tanggal)), ...asli].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  return { plts_id: pltsId, dugaan_padam: dugaanPadam(milik), malam_berturut: ATURAN.malam_berturut_padam, laporan: milik.slice(-30) };
}

/** Satu laporan per PLTS per malam: jawaban baru menggantikan yang lama. */
export async function kirimLaporanMalam(laporan: LaporanMalam): Promise<LaporanMalam> {
  const lain = baca<LaporanMalam>("laporan_malam").filter(x => x.plts_id !== laporan.plts_id || x.tanggal !== laporan.tanggal);
  tulis("laporan_malam", [...lain, laporan]);
  return laporan;
}

export async function daftarPeringatan(pltsId?: string): Promise<Peringatan[]> {
  return baca<Peringatan>("peringatan").filter(p => !pltsId || p.plts_id === pltsId).sort((a, b) => b.dibuat.localeCompare(a.dibuat));
}

export async function kirimPeringatan(data: Pick<Peringatan, "plts_id" | "kategori" | "pesan">): Promise<Peringatan> {
  if (!data.pesan.trim() || data.pesan.length > ATURAN.pesan_maks) throw galat(422);
  const dibuat = sekarang();
  const baru: Peringatan = { id: crypto.randomUUID().slice(0, 12), ...data, status: "terkirim", dibuat, riwayat: [{ status: "terkirim", waktu: dibuat }] };
  tulis("peringatan", [...baca<Peringatan>("peringatan"), baru]);
  return baru;
}

/** Transisi dibatasi seperti di API (aturan.json); "selesai" final. */
export async function ubahStatusPeringatan(id: string, status: StatusPeringatan): Promise<Peringatan> {
  const semua = baca<Peringatan>("peringatan");
  const p = semua.find(x => x.id === id);
  if (!p) throw galat(404);
  if (!(ATURAN.transisi[p.status] as string[]).includes(status)) throw galat(409);
  p.status = status;
  p.riwayat.push({ status, waktu: sekarang() });
  tulis("peringatan", semua);
  return p;
}

const WAKTU = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

/** "31 Okt 19.05" dalam WIB. */
export const waktuWib = (iso: string) => WAKTU.format(new Date(iso));

/** Tanggal "malam ini" menurut WIB, format YYYY-MM-DD. */
export function malamIni(sekarang = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(sekarang);
}

// Asisten keluhan (F5). Keputusan dibuat di server dari ambang api/app/config.py; web hanya menampilkan.

export interface TopikPanduan {
  kategori: string;
  label: string;
  judul: string;
  tingkat_bahaya: "rendah" | "sedang" | "tinggi";
  wajib_teknisi: boolean;
  langkah: string[];
}

export interface HasilKeluhan {
  kategori: string;
  p: number;
  keputusan: "panduan" | "konfirmasi" | "teknisi";
  alasan: "yakin" | "ragu" | "tidak_yakin" | "bahaya" | "wajib_teknisi";
  topik?: TopikPanduan;
  pilihan?: { kategori: string; label: string }[];
}

async function server<T>(jalur: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api${jalur}`, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!r.ok) throw galat(r.status);
  return r.json() as Promise<T>;
}

export const kirimKeluhan = (teks: string) => server<HasilKeluhan>("/keluhan", { method: "POST", body: JSON.stringify({ teks }) });

export const ambilPanduan = (kategori: string) => server<TopikPanduan>(`/panduan/${encodeURIComponent(kategori)}`);

export interface PltsTerpantau extends Plts {
  peringatan: Peringatan | null;
}

/**
 * Status di peta setelah memperhitungkan peringatan (alur inti langkah 6). Peringatan terakhir yang selesai
 * mengubah PLTS kritis/waspada menjadi "dalam_pemulihan", bukan "normal": perbaikan belum dikonfirmasi data.
 */
export function terapkanPeringatan<T extends Plts>(daftar: T[], semua: Peringatan[]): (T & { peringatan: Peringatan | null })[] {
  return daftar.map(p => {
    const terakhir = semua.filter(x => x.plts_id === p.id).sort((a, b) => b.dibuat.localeCompare(a.dibuat))[0] ?? null;
    const pulih = terakhir?.status === "selesai" && (p.status === "kritis" || p.status === "waspada");
    return { ...p, status: pulih ? "dalam_pemulihan" : p.status, peringatan: terakhir };
  });
}
