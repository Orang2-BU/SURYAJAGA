import type { Tone } from "@/components/ui";
import type { Plts } from "@/lib/data";

// Klien API SuryaJaga (FastAPI). Alamat dari NEXT_PUBLIC_API_URL; bawaan untuk pengembangan lokal.
const DASAR = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Jawaban = "ya" | "tidak";

export interface LaporanMalam {
  plts_id: string;
  tanggal: string;
  jawaban: Jawaban | null;
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

async function minta<T>(jalur: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${DASAR}${jalur}`, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json() as Promise<T>;
}

export const ambilLaporanMalam = (pltsId: string) => minta<RingkasanLaporanMalam>(`/laporan-malam/${encodeURIComponent(pltsId)}`);

export const kirimLaporanMalam = (laporan: LaporanMalam) =>
  minta<LaporanMalam>("/laporan-malam", { method: "POST", body: JSON.stringify(laporan) });

export const daftarPeringatan = (pltsId?: string) =>
  minta<Peringatan[]>(pltsId ? `/peringatan?plts_id=${encodeURIComponent(pltsId)}` : "/peringatan");

export const kirimPeringatan = (data: Pick<Peringatan, "plts_id" | "kategori" | "pesan">) =>
  minta<Peringatan>("/peringatan", { method: "POST", body: JSON.stringify(data) });

const WAKTU = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

/** "31 Okt 19.05" dalam WIB. */
export const waktuWib = (iso: string) => WAKTU.format(new Date(iso));

/** Tanggal "malam ini" menurut WIB, format YYYY-MM-DD. */
export function malamIni(sekarang = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(sekarang);
}

export const ubahStatusPeringatan = (id: string, status: StatusPeringatan) =>
  minta<Peringatan>(`/peringatan/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });

// Asisten keluhan (F5). Keputusan dibuat API dari ambang di api/app/config.py; web hanya menampilkan.

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

export const kirimKeluhan = (teks: string) => minta<HasilKeluhan>("/keluhan", { method: "POST", body: JSON.stringify({ teks }) });

export const ambilPanduan = (kategori: string) => minta<TopikPanduan>(`/panduan/${encodeURIComponent(kategori)}`);

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
