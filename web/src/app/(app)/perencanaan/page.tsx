import Link from "next/link";
import { ArrowRight, CircleCheck, Clock, Home, MapPin, ShieldAlert, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { PetaLokasi } from "@/components/peta/peta-lokasi";
import { Badge } from "@/components/ui";
import { KEPUTUSAN_LOKASI, LOKASI, rupiahRingkas, type KeputusanLokasi } from "@/lib/data";

export const metadata = { title: "Perencanaan Lokasi" };

const ANGKA = new Intl.NumberFormat("id-ID");
const SATU = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function KartuMetrik({ ikon: Ikon, label, nilai, keterangan }: { ikon: LucideIcon; label: string; nilai: string; keterangan: string }) {
  return <div className="card metric-card">
    <div className="metric-label"><span className="metric-icon"><Ikon size={16} strokeWidth={1.75} aria-hidden /></span>{label}</div>
    <div className="metric-bottom"><p className="metric-value">{nilai}<span>{keterangan}</span></p></div>
  </div>;
}

export default function PerencanaanLokasi() {
  const { wilayah, metode, permukiman } = LOKASI;
  const hitung = (k: KeputusanLokasi) => permukiman.filter(p => p.keputusan === k).length;
  const sorotan = permukiman.find(p => p.keputusan === "prioritas" && p.nama);
  const teratas = permukiman.slice(0, 12);

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Perencanaan Lokasi</h1>
        <p>{wilayah.nama}, {wilayah.provinsi}. Daerah tertinggal menurut Perpres 63/2020. Estimasi awal sebelum survei lapangan.</p>
      </div>
      <Badge>Estimasi</Badge>
    </div>

    {permukiman.length === 0 ? <section className="panel kosong">
      <h2>Belum ada calon lokasi</h2>
      <p className="muted">Jalankan <code>python -m lokasi.unduh</code> lalu <code>python -m lokasi.estimasi</code> di folder analisis.</p>
    </section> : <>
      <section className="metrics-grid" aria-label="Ringkasan calon lokasi">
        <KartuMetrik ikon={Home} label="Permukiman dianalisis" nilai={ANGKA.format(permukiman.length)} keterangan={`≥ ${metode.penduduk_min} jiwa`} />
        <KartuMetrik ikon={CircleCheck} label="Prioritas" nilai={ANGKA.format(hitung("prioritas"))} keterangan="risiko rendah" />
        <KartuMetrik ikon={TriangleAlert} label="Layak dengan pendampingan" nilai={ANGKA.format(hitung("layak_dengan_pendampingan"))} keterangan="risiko sedang" />
        <KartuMetrik ikon={ShieldAlert} label="Perlu skema perawatan" nilai={ANGKA.format(hitung("perlu_skema_perawatan"))} keterangan="risiko tinggi" />
      </section>

      <section className="monitor-peta">
        <div className="card">
          <div className="section-heading">
            <div><h2>Calon lokasi PLTS komunal</h2><p>Klik titik untuk estimasi singkat. Besar titik mengikuti jumlah KK.</p></div>
            <ul className="legenda" aria-label="Legenda keputusan">
              {(Object.keys(KEPUTUSAN_LOKASI) as KeputusanLokasi[]).map(k => <li key={k}><Badge tone={KEPUTUSAN_LOKASI[k].tone}>{KEPUTUSAN_LOKASI[k].label}</Badge></li>)}
            </ul>
          </div>
          <PetaLokasi daftar={permukiman} />
        </div>

        {sorotan && <article className="incident-card" aria-labelledby="sorotan-judul">
          <div className="incident-top">
            <span className="incident-status"><CircleCheck size={14} strokeWidth={1.75} aria-hidden />Prioritas terbesar</span>
            <span>Estimasi</span>
          </div>
          <h2 id="sorotan-judul">{sorotan.nama}</h2>
          <div className="incident-time">
            <span><MapPin size={14} strokeWidth={1.75} aria-hidden />Kab. Maluku Barat Daya</span>
            <strong>{SATU.format(sorotan.panel_kwp)}<span> kWp</span></strong>
          </div>
          <p>Perkiraan anggaran {rupiahRingkas(sorotan.anggaran_rp[1])} (rentang {rupiahRingkas(sorotan.anggaran_rp[0])} sampai {rupiahRingkas(sorotan.anggaran_rp[2])}) untuk sekitar {ANGKA.format(sorotan.kk)} KK.</p>
          <div className="incident-factors">
            <span><Users size={13} strokeWidth={1.75} aria-hidden />{ANGKA.format(sorotan.penduduk)} jiwa</span>
            {sorotan.waktu_tempuh_jam !== null && <span><Clock size={13} strokeWidth={1.75} aria-hidden />{SATU.format(sorotan.waktu_tempuh_jam)} jam ke kota</span>}
          </div>
          <Link className="button inverse" href={`/perencanaan/${sorotan.id}`}>
            Lihat estimasi lengkap<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
          </Link>
        </article>}
      </section>

      <section className="card">
        <div className="section-heading">
          <div><h2>Calon teratas</h2><p>Diurutkan dari risiko terendah, lalu jumlah KK terbanyak. Anggaran dan biaya listrik berupa nilai tengah dari {ANGKA.format(metode.simulasi)} simulasi.</p></div>
        </div>
        <div className="tabel-gulir">
          <table>
            <thead><tr><th scope="col">Permukiman</th><th scope="col">Keputusan</th><th scope="col" className="numeric">Anggaran</th><th scope="col" className="numeric">Biaya listrik</th><th scope="col" className="numeric">Ke kota</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody>
              {teratas.map(p => <tr key={p.id}>
                <td><Link className="baris-tautan" href={`/perencanaan/${p.id}`}>{p.nama ?? "Permukiman tanpa nama"}</Link><span className="table-sub">±{ANGKA.format(p.kk)} KK · {SATU.format(p.panel_kwp)} kWp</span></td>
                <td><Badge tone={KEPUTUSAN_LOKASI[p.keputusan].tone}>{KEPUTUSAN_LOKASI[p.keputusan].label}</Badge></td>
                <td className="numeric">{rupiahRingkas(p.anggaran_rp[1])}<span className="table-sub">{rupiahRingkas(p.anggaran_rp[0])}-{rupiahRingkas(p.anggaran_rp[2])}</span></td>
                <td className="numeric">Rp{ANGKA.format(Math.round(p.biaya_rp_kwh[1]))}/kWh<span className="table-sub">{SATU.format(p.rasio_genset)}x bahan bakar genset</span></td>
                <td className="numeric">{p.waktu_tempuh_jam === null ? "-" : `${SATU.format(p.waktu_tempuh_jam)} jam`}</td>
                <td className="table-action"><Link className="icon-button" href={`/perencanaan/${p.id}`} aria-label={`Buka estimasi ${p.nama ?? "permukiman tanpa nama"}`}><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="small muted catatan-bukti">Permukiman dari WorldPop 2020, waktu tempuh dari Weiss dkk. (2018), radiasi dari NASA POWER, biaya dari survei mini-grid ESMAP (2022). Status listrik eksisting tiap desa belum tercakup (OpenStreetMap hanya memuat {metode.ruas_jaringan_osm} ruas jaringan di wilayah ini) dan perlu dicek ke PLN.</p>
      </section>
    </>}
  </div>;
}
