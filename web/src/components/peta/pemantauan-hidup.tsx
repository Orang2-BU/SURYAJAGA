"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BellRing, CircleAlert, CircleCheck, MapPin, SunMedium, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui";
import { STATUS_PERINGATAN, daftarPeringatan, terapkanPeringatan, waktuWib, type Peringatan } from "@/lib/api";
import { STATUS, hitungStatus, kalimatAlasan, labelData, urutkanPrioritas, type Plts } from "@/lib/data";
import { PetaPlts } from "./peta-plts";

const ANGKA = new Intl.NumberFormat("id-ID");

function KartuMetrik({ ikon: Ikon, label, nilai, total }: { ikon: LucideIcon; label: string; nilai: number; total: number }) {
  return <div className="card metric-card">
    <div className="metric-label"><span className="metric-icon"><Ikon size={16} strokeWidth={1.75} aria-hidden /></span>{label}</div>
    <div className="metric-bottom"><p className="metric-value">{nilai}<span>dari {total} PLTS</span></p></div>
  </div>;
}

/**
 * Isi P2. Status awal dari plts.json; peringatan tersimpan diterapkan di atasnya (alur inti langkah 6),
 * dimuat ulang saat tab kembali aktif. Bila penyimpanan tidak bisa dibaca, status dari data tetap tampil.
 */
export function PemantauanHidup({ awal }: { awal: Plts[] }) {
  const [peringatan, setPeringatan] = useState<Peringatan[] | "gagal" | null>(null);

  useEffect(() => {
    let batal = false;
    const muat = () => daftarPeringatan().then(d => { if (!batal) setPeringatan(d); }, () => { if (!batal) setPeringatan("gagal"); });
    muat();
    const saatTerlihat = () => { if (document.visibilityState === "visible") muat(); };
    document.addEventListener("visibilitychange", saatTerlihat);
    return () => { batal = true; document.removeEventListener("visibilitychange", saatTerlihat); };
  }, []);

  // Dimemo agar peta tidak dibuat ulang setiap render; hanya saat data peringatan berubah.
  const daftar = useMemo(() => urutkanPrioritas(terapkanPeringatan(awal, Array.isArray(peringatan) ? peringatan : [])), [awal, peringatan]);
  const jumlah = hitungStatus(daftar);
  const sorotan = daftar.find(p => p.status === "kritis" && p.label_data === "laporan");
  const terdampak = sorotan?.jumlah_jiwa ? `${ANGKA.format(sorotan.jumlah_jiwa)} jiwa` : sorotan?.jumlah_kk ? `${ANGKA.format(sorotan.jumlah_kk)} KK` : null;

  return <>
    {peringatan === "gagal" && <p className="small muted catatan-api" role="status">Peringatan tersimpan tidak bisa dibaca: status di bawah dari data terakhir, tanpa perubahan dari peringatan.</p>}
    <section className="metrics-grid" aria-label="Ringkasan status">
      <KartuMetrik ikon={CircleAlert} label="Kritis" nilai={jumlah.kritis} total={daftar.length} />
      <KartuMetrik ikon={TriangleAlert} label="Waspada" nilai={jumlah.waspada} total={daftar.length} />
      <KartuMetrik ikon={CircleCheck} label="Normal" nilai={jumlah.normal} total={daftar.length} />
      <KartuMetrik ikon={SunMedium} label="Dalam pemulihan" nilai={jumlah.dalam_pemulihan} total={daftar.length} />
    </section>

    <section className="monitor-peta">
      <div className="card">
        <div className="section-heading">
          <div><h2>Sebaran PLTS</h2><p>Klik titik untuk melihat ringkasan. Warna titik mengikuti status.</p></div>
          <ul className="legenda" aria-label="Legenda status">
            {(["kritis", "waspada", "normal", "dalam_pemulihan"] as const).map(s => <li key={s}><Badge tone={STATUS[s].tone}>{STATUS[s].label}</Badge></li>)}
          </ul>
        </div>
        <PetaPlts daftar={daftar} />
      </div>

      {sorotan && <article className="incident-card" aria-labelledby="sorotan-judul">
        <div className="incident-top">
          <span className="incident-status"><CircleAlert size={14} strokeWidth={1.75} aria-hidden />Paling butuh tindakan</span>
          <span>{labelData(sorotan)}</span>
        </div>
        <h2 id="sorotan-judul">{sorotan.nama}</h2>
        <div className="incident-time">
          <span><MapPin size={14} strokeWidth={1.75} aria-hidden />{sorotan.desa}, Kab. {sorotan.kabupaten}</span>
          {sorotan.kapasitas_kwp && <strong>{sorotan.kapasitas_kwp}<span> kWp</span></strong>}
        </div>
        <p>{kalimatAlasan(sorotan.alasan_status)}</p>
        <div className="incident-factors">
          {terdampak && <span><Users size={13} strokeWidth={1.75} aria-hidden />{terdampak} terdampak</span>}
          {sorotan.peringatan && <span><BellRing size={13} strokeWidth={1.75} aria-hidden />Peringatan {STATUS_PERINGATAN[sorotan.peringatan.status].label.toLowerCase()}</span>}
          <a href={sorotan.sumber} target="_blank" rel="noreferrer">Baca sumber laporan<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden /></a>
        </div>
        <Link className="button inverse" href={`/pemantauan/${sorotan.id}`}>
          Telusuri penyebab<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
        </Link>
      </article>}
    </section>

    <section className="card">
      <div className="section-heading">
        <div><h2>Semua PLTS</h2><p>Status dari laporan berita bertanggal dan peringatan yang sudah ditangani; data contoh ditandai.</p></div>
      </div>
      <div className="tabel-gulir">
        <table>
          <thead><tr><th scope="col">PLTS</th><th scope="col">Status</th><th scope="col" className="numeric">Kapasitas</th><th scope="col">Asal data</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead>
          <tbody>
            {daftar.map(p => <tr key={p.id}>
              <td><Link className="baris-tautan" href={`/pemantauan/${p.id}`}>{p.nama}</Link><span className="table-sub">{p.desa}, {p.kabupaten}, {p.provinsi}</span></td>
              <td><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                {p.peringatan && <span className="table-sub">Peringatan {STATUS_PERINGATAN[p.peringatan.status].label.toLowerCase()} · {waktuWib(p.peringatan.riwayat.at(-1)?.waktu ?? p.peringatan.dibuat)}</span>}</td>
              <td className="numeric">{p.kapasitas_kwp ? `${ANGKA.format(p.kapasitas_kwp)} kWp` : "Tidak diketahui"}</td>
              <td className="muted">{labelData(p)}</td>
              <td className="table-action"><Link className="icon-button" href={`/pemantauan/${p.id}`} aria-label={`Buka detail ${p.nama}`}><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </>;
}
