"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellRing, RotateCw } from "lucide-react";
import { Badge, Icon } from "@/components/ui";
import { KATEGORI_PERINGATAN, STATUS_PERINGATAN, daftarPeringatan, waktuWib, type Peringatan, type StatusPeringatan } from "@/lib/api";

type Filter = "semua" | StatusPeringatan;
type Keadaan = { tahap: "memuat" } | { tahap: "gagal" } | { tahap: "siap"; data: Peringatan[] };

/** P5: semua peringatan dari API, difilter per status. Dimuat ulang saat tab kembali aktif agar status operator ikut terbaru. */
export function DaftarPeringatan({ plts }: { plts: Record<string, { nama: string; lokasi: string }> }) {
  const [keadaan, setKeadaan] = useState<Keadaan>({ tahap: "memuat" });
  const [filter, setFilter] = useState<Filter>("semua");

  const muat = useCallback(() => {
    daftarPeringatan().then(data => setKeadaan({ tahap: "siap", data }), () => setKeadaan({ tahap: "gagal" }));
  }, []);

  useEffect(() => {
    muat();
    const saatTerlihat = () => { if (document.visibilityState === "visible") muat(); };
    document.addEventListener("visibilitychange", saatTerlihat);
    return () => document.removeEventListener("visibilitychange", saatTerlihat);
  }, [muat]);

  const tombolMuat = <button type="button" className="button secondary" onClick={() => { setKeadaan({ tahap: "memuat" }); muat(); }}>
    <Icon icon={RotateCw} size={16} />{keadaan.tahap === "gagal" ? "Coba lagi" : "Perbarui"}
  </button>;

  if (keadaan.tahap === "memuat") return <section className="card" aria-busy="true"><p className="muted" aria-live="polite">Memuat peringatan...</p></section>;
  if (keadaan.tahap === "gagal") return <section className="card kosong" role="alert">
    <h2>Layanan peringatan belum bisa dihubungi</h2>
    <p className="muted">Daftar peringatan disimpan di API SuryaJaga. Pastikan API berjalan, lalu coba lagi.</p>
    {tombolMuat}
  </section>;

  const { data } = keadaan;
  if (data.length === 0) return <section className="card kosong">
    <span className="placeholder-symbol"><Icon icon={BellRing} size={28} /></span>
    <h2>Belum ada peringatan</h2>
    <p className="muted">Peringatan dikirim dari halaman detail PLTS, lalu dilacak di sini sampai operator menandainya selesai.</p>
    <Link className="button primary" href="/pemantauan">Buka Peta Pemantauan</Link>
  </section>;

  const jumlah = (f: Filter) => f === "semua" ? data.length : data.filter(p => p.status === f).length;
  const tampil = filter === "semua" ? data : data.filter(p => p.status === filter);
  const pilihan: Filter[] = ["semua", ...(Object.keys(STATUS_PERINGATAN) as StatusPeringatan[])];

  return <section className="card">
    <div className="section-heading">
      <div><h2>Semua peringatan</h2><p>Terbaru di atas. Status berubah saat operator membaca, menangani, atau meneruskan ke teknisi.</p></div>
      {tombolMuat}
    </div>
    <div className="pilih-pill filter-status" role="group" aria-label="Filter status">
      {pilihan.map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
        {f === "semua" ? "Semua" : STATUS_PERINGATAN[f].label}<span className="pill-jumlah">{jumlah(f)}</span>
      </button>)}
    </div>
    {tampil.length === 0
      ? <p className="pesan-sistem">Tidak ada peringatan berstatus {filter === "semua" ? "apa pun" : STATUS_PERINGATAN[filter].label.toLowerCase()}.</p>
      : <div className="tabel-gulir">
        <table className="tabel-peringatan">
          <thead><tr><th scope="col">PLTS</th><th scope="col">Jenis masalah</th><th scope="col">Status</th><th scope="col">Dikirim</th><th scope="col">Pesan</th></tr></thead>
          <tbody>
            {tampil.map(p => {
              const info = plts[p.plts_id];
              const ubah = p.riwayat.at(-1);
              return <tr key={p.id}>
                <td className="sel-plts"><Link className="baris-tautan" href={`/pemantauan/${p.plts_id}`}>{info?.nama ?? p.plts_id}</Link>{info && <span className="table-sub">{info.lokasi}</span>}</td>
                <td className="sel-kategori">{KATEGORI_PERINGATAN[p.kategori]}</td>
                <td className="sel-status"><Badge tone={STATUS_PERINGATAN[p.status].tone}>{STATUS_PERINGATAN[p.status].label}</Badge>
                  {ubah && ubah.status !== "terkirim" && <span className="table-sub">Diperbarui {waktuWib(ubah.waktu)}</span>}</td>
                <td className="sel-waktu nowrap">{waktuWib(p.dibuat)}</td>
                <td className="sel-pesan">{p.pesan}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>}
  </section>;
}
