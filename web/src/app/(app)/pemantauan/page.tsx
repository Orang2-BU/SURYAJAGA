import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleAlert, CircleCheck, MapPin, SunMedium, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { PetaPlts } from "@/components/peta/peta-plts";
import { Badge } from "@/components/ui";
import { DAFTAR_PLTS, STATUS, hitungStatus, kalimatAlasan, labelData, urutkanPrioritas } from "@/lib/data";

export const metadata = { title: "Peta Pemantauan" };

const ANGKA = new Intl.NumberFormat("id-ID");

function KartuMetrik({ ikon: Ikon, label, nilai, total }: { ikon: LucideIcon; label: string; nilai: number; total: number }) {
  return <div className="card metric-card">
    <div className="metric-label"><span className="metric-icon"><Ikon size={16} strokeWidth={1.75} aria-hidden /></span>{label}</div>
    <div className="metric-bottom"><p className="metric-value">{nilai}<span>dari {total} PLTS</span></p></div>
  </div>;
}

export default function PetaPemantauan() {
  const daftar = urutkanPrioritas(DAFTAR_PLTS);
  const jumlah = hitungStatus(daftar);
  const sorotan = daftar.find(p => p.status === "kritis" && p.label_data === "laporan");
  const terdampak = sorotan?.jumlah_jiwa ? `${ANGKA.format(sorotan.jumlah_jiwa)} jiwa` : sorotan?.jumlah_kk ? `${ANGKA.format(sorotan.jumlah_kk)} KK` : null;

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Peta Pemantauan</h1>
        <p>Kondisi {daftar.length} PLTS desa, diurutkan dari yang paling butuh tindakan.</p>
      </div>
      <Link className="button secondary" href="/aset">Bandingkan di tabel<ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link>
    </div>

    {daftar.length === 0 ? <section className="panel kosong">
      <h2>Belum ada PLTS yang dipantau</h2>
      <p className="muted">Jalankan <code>python -m plts</code> di folder analisis untuk memuat data PLTS.</p>
    </section> : <>
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
              {(["kritis", "waspada", "normal"] as const).map(s => <li key={s}><Badge tone={STATUS[s].tone}>{STATUS[s].label}</Badge></li>)}
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
            <a href={sorotan.sumber} target="_blank" rel="noreferrer">Baca sumber laporan<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden /></a>
          </div>
          <Link className="button inverse" href={`/pemantauan/${sorotan.id}`}>
            Telusuri penyebab<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
          </Link>
        </article>}
      </section>

      <section className="card">
        <div className="section-heading">
          <div><h2>Semua PLTS</h2><p>Status dari laporan berita bertanggal; data contoh ditandai.</p></div>
        </div>
        <div className="tabel-gulir">
          <table>
            <thead><tr><th scope="col">PLTS</th><th scope="col">Status</th><th scope="col" className="numeric">Kapasitas</th><th scope="col">Asal data</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody>
              {daftar.map(p => <tr key={p.id}>
                <td><Link className="baris-tautan" href={`/pemantauan/${p.id}`}>{p.nama}</Link><span className="table-sub">{p.desa}, {p.kabupaten}, {p.provinsi}</span></td>
                <td><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge></td>
                <td className="numeric">{p.kapasitas_kwp ? `${ANGKA.format(p.kapasitas_kwp)} kWp` : "Tidak diketahui"}</td>
                <td className="muted">{labelData(p)}</td>
                <td className="table-action"><Link className="icon-button" href={`/pemantauan/${p.id}`} aria-label={`Buka detail ${p.nama}`}><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </>}
  </div>;
}
