"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { DeretCahaya } from "@/lib/data";

const BULAN = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" });
const ANGKA = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const namaBulan = (b: string) => BULAN.format(new Date(`${b}-01`));

/**
 * Deret radiansi bulanan terhadap garis dasar (08-DESIGN: garis accent-fill, garis dasar neutral putus-putus,
 * titik anomali status-crit, bulan tanpa data diarsir). Nilai terbaca saat hover, sentuh, atau panah kiri/kanan.
 */
export function GrafikCahaya({ desa, rasio }: { desa: DeretCahaya; rasio: number }) {
  const deret = desa.bulanan;
  const dasar = desa.garis_dasar;
  const [pilih, setPilih] = useState(deret.length - 1);
  // Skala dipotong di persentil 98 agar satu lonjakan (kapal, kebakaran) tidak meratakan deret; nilai di atasnya ditandai.
  const urut = deret.flatMap(b => b.radiansi ?? []).sort((a, b) => a - b);
  const atas = Math.max(dasar ?? 0, urut[Math.floor((urut.length - 1) * 0.98)] ?? 0) * 1.15 || 1;
  const lewat = deret.filter(b => (b.radiansi ?? 0) > atas);
  const x = (i: number) => i / Math.max(deret.length - 1, 1) * 100;
  const y = (v: number) => (1 - Math.min(v, atas) / atas) * 100;
  const anomali = (v: number | null) => dasar !== null && v !== null && desa.status !== "sinyal_lemah" && v < rasio * dasar;

  // Garis putus di bulan tanpa data; tiap potongan jadi satu polyline.
  const potongan: string[] = [];
  let kini: string[] = [];
  deret.forEach((b, i) => {
    if (b.radiansi === null) { if (kini.length) potongan.push(kini.join(" ")); kini = []; return; }
    kini.push(`${x(i).toFixed(2)},${y(b.radiansi).toFixed(2)}`);
  });
  if (kini.length) potongan.push(kini.join(" "));

  const kosong: { awal: number; akhir: number }[] = [];
  deret.forEach((b, i) => {
    if (b.radiansi !== null) return;
    const akhir = kosong[kosong.length - 1];
    if (akhir && akhir.akhir === i - 1) akhir.akhir = i; else kosong.push({ awal: i, akhir: i });
  });

  const tahun = deret.flatMap((b, i) => b.bulan.endsWith("-01") && Number(b.bulan.slice(0, 4)) % 2 === 1 ? [{ i, label: b.bulan.slice(0, 4) }] : []);
  const dipilih = deret[pilih];

  function geser(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setPilih(Math.round(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * (deret.length - 1)));
  }
  function tombol(e: KeyboardEvent<HTMLDivElement>) {
    const ke = { ArrowLeft: pilih - 1, ArrowRight: pilih + 1, Home: 0, End: deret.length - 1 }[e.key];
    if (ke === undefined) return;
    e.preventDefault();
    setPilih(Math.min(Math.max(ke, 0), deret.length - 1));
  }

  return <figure className="grafik">
    <figcaption className="grafik-baca" aria-live="polite">
      <span className="metric-label">{namaBulan(dipilih.bulan)}</span>
      <strong>{dipilih.radiansi === null ? "Tidak ada data (awan atau kualitas buruk)" : `${ANGKA.format(dipilih.radiansi)} nW/cm²/sr`}</strong>
      {anomali(dipilih.radiansi) && <span className="grafik-anomali">Di bawah {Math.round(rasio * 100)}% garis dasar</span>}
    </figcaption>
    <div className="grafik-badan">
      <div className="grafik-sumbu-y" aria-hidden><span>{ANGKA.format(atas)}</span><span>0</span></div>
      <div className="grafik-area grafik-interaktif" tabIndex={0} role="slider" aria-label="Pilih bulan pada grafik cahaya malam"
        aria-valuemin={0} aria-valuemax={deret.length - 1} aria-valuenow={pilih} aria-valuetext={namaBulan(dipilih.bulan)}
        onPointerMove={geser} onPointerDown={geser} onKeyDown={tombol}>
        {kosong.map(k => <span key={k.awal} className="grafik-kosong" style={{ left: `${x(k.awal)}%`, width: `${Math.max(x(k.akhir) - x(k.awal), 0.6)}%` }} />)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {dasar !== null && <line className="garis-dasar" x1="0" x2="100" y1={y(dasar)} y2={y(dasar)} />}
          {potongan.map(p => <polyline key={p} className="garis-data" points={p} />)}
        </svg>
        {deret.map((b, i) => anomali(b.radiansi) && <span key={b.bulan} className="grafik-titik anomali" style={{ left: `${x(i)}%`, top: `${y(b.radiansi!)}%` }} />)}
        {deret.map((b, i) => (b.radiansi ?? 0) > atas && <span key={`lewat-${b.bulan}`} className="grafik-lewat" style={{ left: `${x(i)}%` }} />)}
        <span className="grafik-kursor" style={{ left: `${x(pilih)}%` }} aria-hidden />
      </div>
    </div>
    <div className="grafik-sumbu-x tahun" aria-hidden>{tahun.map(t => <span key={t.i} style={{ left: `${x(t.i)}%` }}>{t.label}</span>)}</div>
    <ul className="grafik-legenda" aria-label="Keterangan grafik">
      <li><span className="kunci garis" />Radiansi bulanan</li>
      {dasar !== null && <li><span className="kunci dasar" />Garis dasar 2015-2016</li>}
      <li><span className="kunci anomali" />Bulan anomali</li>
      <li><span className="kunci tanpa-data" />Tanpa data</li>
      {lewat.length > 0 && <li><span className="kunci lewat" />{lewat.length} bulan di atas skala (tertinggi {ANGKA.format(Math.max(...lewat.map(b => b.radiansi!)))})</li>}
    </ul>
  </figure>;
}
