import Link from "next/link";
import { ArrowRight, Download, MoonStar } from "lucide-react";
import { GrafikCahaya } from "@/components/detail/grafik-cahaya";
import { Badge, type Tone } from "@/components/ui";
import { CAHAYA, cariPlts, type StatusCahaya } from "@/lib/data";

export const metadata = { title: "Analisis Cahaya Malam" };

const DUA = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const HASIL: Record<StatusCahaya, { label: string; tone: Tone }> = {
  terdeteksi: { label: "Terdeteksi padam", tone: "crit" },
  tidak_terdeteksi: { label: "Tidak terdeteksi", tone: "neutral" },
  sinyal_lemah: { label: "Sinyal lemah", tone: "neutral" },
};

export default function AnalisisCahayaMalam() {
  const { metode: m, desa } = CAHAYA;
  const lemah = desa.filter(d => d.status === "sinyal_lemah").length;
  const urut = [...desa].sort((a, b) => a.grup.localeCompare(b.grup));

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Analisis Cahaya Malam</h1>
        <p>Uji apakah satelit cahaya malam bisa membedakan PLTS desa yang padam dan yang menyala. Desa dan aturan ditetapkan sebelum data dilihat.</p>
      </div>
      <div className="page-actions">
        <a className="button secondary" href="/data/cahaya.json" download><Download size={16} strokeWidth={1.75} aria-hidden />Unduh data</a>
      </div>
    </div>

    <section className="monitor-peta">
      <div className="card">
        <div className="section-heading">
          <div><h2>Hasil semua desa uji</h2><p>Tiga desa dengan PLTS mangkrak dan dua desa pembanding yang PLTS-nya menyala.</p></div>
          <Badge>Data satelit asli</Badge>
        </div>
        <div className="tabel-gulir">
          <table>
            <thead><tr><th scope="col">Desa</th><th scope="col">Kelompok</th><th scope="col" className="numeric">Garis dasar</th><th scope="col" className="numeric">Bulan berdata</th><th scope="col">Hasil</th></tr></thead>
            <tbody>
              {urut.map(d => <tr key={d.desa_id}>
                <td>{cariPlts(d.desa_id) ? <Link className="baris-tautan" href={`/pemantauan/${d.desa_id}`}>{d.nama}</Link> : d.nama}</td>
                <td>{d.grup === "mangkrak" ? "Mangkrak" : "Pembanding, menyala"}</td>
                <td className="numeric">{d.garis_dasar === null ? "-" : DUA.format(d.garis_dasar)}</td>
                <td className="numeric">{d.bulan_berdata} dari {d.bulan_total}</td>
                <td><Badge tone={HASIL[d.status].tone}>{HASIL[d.status].label}</Badge></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="small muted catatan-bukti">Garis dasar dalam {m.satuan}, rata-rata {m.periode_dasar}. Desa dengan garis dasar di bawah {DUA.format(m.dasar_minimum)} tidak dinilai karena lampunya tidak terbedakan dari derau sensor.</p>
      </div>

      <article className="incident-card" aria-labelledby="kesimpulan-judul">
        <div className="incident-top">
          <span className="incident-status"><MoonStar size={14} strokeWidth={1.75} aria-hidden />Kesimpulan uji</span>
          <span>{m.produk.split(" ")[0]}</span>
        </div>
        <h2 id="kesimpulan-judul">Hasil negatif: {lemah} dari {desa.length} desa terlalu redup</h2>
        <p>Desa pembanding yang PLTS-nya menyala sama redupnya dengan desa yang mangkrak. Untuk desa 200-400 KK, satelit beresolusi sekitar 500 m tidak bisa dipakai sebagai pendeteksi padam.</p>
        <div className="incident-factors">
          <span>Pengganti: laporan malam operator dan foto Sentinel-2</span>
        </div>
        <Link className="button inverse" href="/pemantauan/parang">
          Lihat bukti pengganti di Parang<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
        </Link>
      </article>
    </section>

    <section className="card">
      <h2>Aturan yang dikunci sebelum data dilihat</h2>
      <dl className="fitur bungkus">
        <div><dt>Produk satelit</dt><dd>{m.produk}</dd></div>
        <div><dt>Nilai per desa</dt><dd>Rata-rata {m.jendela}</dd></div>
        <div><dt>Garis dasar</dt><dd>{m.periode_dasar}</dd></div>
        <div><dt>Ditandai padam bila</dt><dd>di bawah {Math.round(m.rasio_anomali * 100)}% garis dasar {m.bulan_berturut} bulan berturut-turut</dd></div>
        <div><dt>Batas sinyal minimum</dt><dd>{DUA.format(m.dasar_minimum)} {m.satuan}</dd></div>
      </dl>
    </section>

    <div className="grafik-desa">
      {urut.map(d => <section key={d.desa_id} className="card" aria-labelledby={`grafik-${d.desa_id}`}>
        <div className="section-heading">
          <div><h2 id={`grafik-${d.desa_id}`}>{d.nama}</h2><p>{d.grup === "mangkrak" ? "PLTS mangkrak" : "Pembanding, PLTS menyala"} · {d.malam_gelap === null ? `${d.malam_cerah} malam cerah, tidak dinilai` : `malam gelap ${d.malam_gelap} dari ${d.malam_cerah} malam cerah`}</p></div>
          <Badge tone={HASIL[d.status].tone}>{HASIL[d.status].label}</Badge>
        </div>
        <GrafikCahaya desa={d} rasio={m.rasio_anomali} />
      </section>)}
    </div>
  </div>;
}
