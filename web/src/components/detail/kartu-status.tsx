"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BellRing, CalendarDays, CircleAlert } from "lucide-react";
import { STATUS_PERINGATAN, daftarPeringatan, terapkanPeringatan, waktuWib, type PltsTerpantau } from "@/lib/api";
import { STATUS, kalimatAlasan, labelData, type Plts } from "@/lib/data";

const awalKecil = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Kartu status P3, aturan sama dengan peta P2 (terapkanPeringatan). Bila API mati, status dari data. */
export function KartuStatus({ plts }: { plts: Plts }) {
  const [kini, setKini] = useState<PltsTerpantau>({ ...plts, peringatan: null });

  useEffect(() => {
    let batal = false;
    daftarPeringatan(plts.id).then(d => { if (!batal) setKini(terapkanPeringatan([plts], d)[0]); }, () => {});
    return () => { batal = true; };
  }, [plts]);

  const pulih = kini.status === "dalam_pemulihan" && plts.status !== "dalam_pemulihan";
  const selesai = kini.peringatan?.riwayat.at(-1)?.waktu ?? kini.peringatan?.dibuat;

  return <article className="incident-card" aria-labelledby="status-judul" aria-live="polite">
    <div className="incident-top">
      <span className="incident-status"><CircleAlert size={14} strokeWidth={1.75} aria-hidden />Status saat ini</span>
      <span>{labelData(plts)}</span>
    </div>
    <h2 id="status-judul">{STATUS[kini.status].label}</h2>
    {pulih && selesai
      ? <p>Operator menandai peringatan selesai pada {waktuWib(selesai)}. Perbaikan belum dikonfirmasi data; pantau kartu laporan malam operator. Sebelumnya: {awalKecil(kalimatAlasan(plts.alasan_status))}</p>
      : <p>{kalimatAlasan(plts.alasan_status)}</p>}
    <div className="incident-factors">
      {plts.tanggal_laporan && <span><CalendarDays size={13} strokeWidth={1.75} aria-hidden />Dilaporkan {TANGGAL.format(new Date(plts.tanggal_laporan))}</span>}
      {kini.peringatan && <span><BellRing size={13} strokeWidth={1.75} aria-hidden />Peringatan {STATUS_PERINGATAN[kini.peringatan.status].label.toLowerCase()}</span>}
      {plts.label_data === "laporan" && <a href={plts.sumber} target="_blank" rel="noreferrer">Baca sumber laporan<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden /></a>}
    </div>
  </article>;
}
