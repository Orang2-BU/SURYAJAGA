"use client";

import { useEffect, useState } from "react";
import { MoonStar } from "lucide-react";
import { Badge } from "@/components/ui";
import { ambilLaporanMalam, type RingkasanLaporanMalam } from "@/lib/api";

const TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

/** Kartu P3: jawaban laporan malam operator (F15), sinyal padam harian pengganti satelit (Q12). */
export function KartuLaporanMalam({ pltsId }: { pltsId: string }) {
  const [data, setData] = useState<RingkasanLaporanMalam | null | "gagal">(null);

  useEffect(() => {
    let batal = false;
    ambilLaporanMalam(pltsId).then(d => { if (!batal) setData(d); }, () => { if (!batal) setData("gagal"); });
    return () => { batal = true; };
  }, [pltsId]);

  const terakhir = data && data !== "gagal" ? data.laporan.at(-1)?.jawaban : undefined;
  const lencana = data === null ? <Badge>Memuat</Badge>
    : data === "gagal" ? <Badge>Tidak terhubung</Badge>
    : data.laporan.length === 0 ? <Badge>Belum ada laporan</Badge>
    : data.dugaan_padam ? <Badge tone="crit">Dugaan padam</Badge>
    : terakhir === "ya" ? <Badge tone="ok">Menyala</Badge>
    : <Badge tone="warn">Perlu dipantau</Badge>;

  return <section className="card" aria-labelledby="laporan-judul" aria-busy={data === null}>
    <div className="section-heading">
      <div><h2 id="laporan-judul">Laporan malam operator</h2><p>Jawaban harian &ldquo;lampu desa menyala malam ini?&rdquo; dari operator koperasi.</p></div>
      {lencana}
    </div>
    {data === null && <p className="muted" aria-live="polite">Memuat laporan malam...</p>}
    {data === "gagal" && <div className="bukti-kosong" role="alert">
      <MoonStar size={20} strokeWidth={1.75} aria-hidden />
      <p>Laporan malam tidak bisa dibaca dari penyimpanan browser. Bukti lain di halaman ini tetap berlaku.</p>
    </div>}
    {data !== null && data !== "gagal" && (data.laporan.length === 0
      ? <div className="bukti-kosong">
        <MoonStar size={20} strokeWidth={1.75} aria-hidden />
        <p>Operator belum menjawab laporan malam. Pertanyaan muncul setiap malam di kotak masuk operator.</p>
      </div>
      : <>
        <p className="prediksi-arti">{data.dugaan_padam
          ? `${data.malam_berturut} malam terakhir berturut dijawab tidak menyala atau tidak dijawab.`
          : terakhir === "ya" ? "Malam terakhir dilaporkan menyala."
          : `Malam terakhir ${terakhir === "tidak" ? "dilaporkan tidak menyala" : "belum dijawab"}. Dugaan padam bila berlanjut ${data.malam_berturut} malam berturut.`}</p>
        <ol className="riwayat-malam baris">{data.laporan.slice(-14).map(l => <li key={l.tanggal}>
          <span className={`malam-titik ${l.jawaban ?? "tanpa-jawaban"}`} aria-hidden />
          <span>{TANGGAL.format(new Date(`${l.tanggal}T00:00:00Z`))}</span>
          <span className="sr-only">{l.jawaban === "ya" ? "menyala" : l.jawaban === "tidak" ? "tidak menyala" : "tidak dijawab"}</span>
        </li>)}</ol>
      </>)}
  </section>;
}
