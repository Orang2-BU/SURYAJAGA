"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Download } from "lucide-react";
import { Badge, Icon } from "@/components/ui";
import { tingkatBaterai } from "@/lib/ambang";
import { STATUS_PERINGATAN, daftarPeringatan, terapkanPeringatan, type Peringatan } from "@/lib/api";
import { STATUS, labelData, type KondisiPanel, type Plts, type Status } from "@/lib/data";

export interface BarisAset extends Plts {
  peluang: number | null;
  minggu: number | null;
  panel: KondisiPanel["status"] | null;
}

type Kolom = "status" | "nama" | "peluang" | "kapasitas";
type Urut = { kolom: Kolom; naik: boolean };
const ANGKA = new Intl.NumberFormat("id-ID");
const PERSEN = new Intl.NumberFormat("id-ID", { style: "percent", maximumFractionDigits: 1 });
const PANEL: Record<KondisiPanel["status"], string> = { naik: "Vegetasi naik", turun: "Vegetasi turun", stabil: "Stabil", data_kurang: "Data kurang" };

/** P4: urut, filter status, dan ekspor CSV. Status mengikuti peringatan dengan aturan yang sama seperti P2. */
export function TabelAset({ baris }: { baris: BarisAset[] }) {
  const [peringatan, setPeringatan] = useState<Peringatan[]>([]);
  const [filter, setFilter] = useState<Status | "semua">("semua");
  const [urut, setUrut] = useState<Urut>({ kolom: "status", naik: true });

  useEffect(() => {
    let batal = false;
    // Bila API mati, status dari data tetap dipakai (P2 menampilkan catatannya).
    daftarPeringatan().then(d => { if (!batal) setPeringatan(d); }, () => {});
    return () => { batal = true; };
  }, []);

  const semua = useMemo(() => terapkanPeringatan(baris, peringatan), [baris, peringatan]);
  const tampil = useMemo(() => {
    const nilai = (p: BarisAset): number | string => ({
      status: STATUS[p.status].urutan, nama: p.nama, peluang: p.peluang ?? -1, kapasitas: p.kapasitas_kwp ?? -1,
    })[urut.kolom];
    return semua.filter(p => filter === "semua" || p.status === filter)
      .sort((a, b) => { const x = nilai(a), y = nilai(b); const c = x < y ? -1 : x > y ? 1 : 0; return urut.naik ? c : -c; });
  }, [semua, filter, urut]);

  function ekspor() {
    const kolom = ["id", "nama", "desa", "kabupaten", "provinsi", "status", "peringatan_terakhir", "peluang_aus_26_minggu", "minggu_tersisa", "panel_sentinel2", "kapasitas_kwp", "asal_data", "sumber"];
    const sel = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const isi = tampil.map(p => [p.id, p.nama, p.desa, p.kabupaten, p.provinsi, STATUS[p.status].label, p.peringatan ? STATUS_PERINGATAN[p.peringatan.status].label : "",
      p.peluang ?? "", p.minggu === null ? "" : Math.round(p.minggu), p.panel ? PANEL[p.panel] : "", p.kapasitas_kwp ?? "", labelData(p), p.sumber].map(sel).join(","));
    const url = URL.createObjectURL(new Blob(["﻿" + [kolom.join(","), ...isi].join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "suryajaga-kondisi-plts.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  const pilihan: (Status | "semua")[] = ["semua", "kritis", "waspada", "dalam_pemulihan", "normal"];

  return <section className="card">
    <div className="section-heading">
      <div><h2>Semua PLTS</h2><p>Klik judul kolom untuk mengurutkan. Prediksi baterai hanya untuk PLTS yang punya data BMS.</p></div>
      <button type="button" className="button secondary" onClick={ekspor} disabled={tampil.length === 0}><Icon icon={Download} size={16} />Ekspor CSV</button>
    </div>
    <div className="pilih-pill filter-status" role="group" aria-label="Filter status">
      {pilihan.map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
        {f === "semua" ? "Semua" : STATUS[f].label}<span className="pill-jumlah">{f === "semua" ? semua.length : semua.filter(p => p.status === f).length}</span>
      </button>)}
    </div>
    {tampil.length === 0 ? <p className="pesan-sistem">Tidak ada PLTS berstatus {filter === "semua" ? "apa pun" : STATUS[filter].label.toLowerCase()}.</p> : <div className="tabel-gulir">
      <table className="tabel-aset">
        <thead><tr>
          <Judul kolom="nama" urut={urut} onUrut={setUrut}>PLTS</Judul>
          <Judul kolom="status" urut={urut} onUrut={setUrut}>Status</Judul>
          <Judul kolom="peluang" urut={urut} onUrut={setUrut} angka>Baterai 26 minggu</Judul>
          <th scope="col">Panel (Sentinel-2)</th>
          <Judul kolom="kapasitas" urut={urut} onUrut={setUrut} angka>Kapasitas</Judul>
          <th scope="col">Asal data</th>
          <th scope="col"><span className="sr-only">Aksi</span></th>
        </tr></thead>
        <tbody>
          {tampil.map(p => <tr key={p.id}>
            <td><Link className="baris-tautan" href={`/pemantauan/${p.id}`}>{p.nama}</Link><span className="table-sub">{p.desa}, {p.kabupaten}</span></td>
            <td><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
              {p.peringatan && <span className="table-sub">Peringatan {STATUS_PERINGATAN[p.peringatan.status].label.toLowerCase()}</span>}</td>
            <td className="numeric">{p.peluang === null ? <span className="muted">Tanpa data BMS</span> : <>
              {PERSEN.format(p.peluang)}<span className="table-sub">{tingkatBaterai(p.peluang) === "normal" ? "normal" : tingkatBaterai(p.peluang).replace("_", " ")} · {p.minggu !== null && p.minggu >= 100 ? "lebih dari 2 tahun" : `±${Math.round(p.minggu ?? 0)} minggu`}</span>
            </>}</td>
            <td>{p.panel ? PANEL[p.panel] : <span className="muted">Belum dipetakan</span>}</td>
            <td className="numeric">{p.kapasitas_kwp ? `${ANGKA.format(p.kapasitas_kwp)} kWp` : "Tidak diketahui"}</td>
            <td className="muted">{labelData(p)}</td>
            <td className="table-action"><Link className="icon-button" href={`/pemantauan/${p.id}`} aria-label={`Buka detail ${p.nama}`}><Icon icon={ArrowRight} size={16} /></Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </section>;
}

function Judul({ kolom, urut, onUrut, angka, children }: { kolom: Kolom; urut: Urut; onUrut: (u: Urut) => void; angka?: boolean; children: string }) {
  const aktif = urut.kolom === kolom;
  return <th scope="col" className={angka ? "numeric" : undefined} aria-sort={aktif ? (urut.naik ? "ascending" : "descending") : "none"}>
    <button type="button" className="urut" onClick={() => onUrut({ kolom, naik: aktif ? !urut.naik : true })}>
      {children}{aktif && <Icon icon={urut.naik ? ArrowUp : ArrowDown} size={12} />}
    </button>
  </th>;
}
