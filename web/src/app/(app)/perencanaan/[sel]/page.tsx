import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CircleAlert, CircleCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui";
import { KEPUTUSAN_LOKASI, LOKASI, cariLokasi, rupiahRingkas, type CalonLokasi } from "@/lib/data";

const ANGKA = new Intl.NumberFormat("id-ID");
const SATU = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const DUA = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function generateStaticParams() {
  return LOKASI.permukiman.map(p => ({ sel: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/perencanaan/[sel]">) {
  const p = cariLokasi((await params).sel);
  return { title: p ? (p.nama ?? "Permukiman tanpa nama") : "Lokasi tidak ditemukan" };
}

export default async function RincianCalonLokasi({ params }: PageProps<"/perencanaan/[sel]">) {
  const p = cariLokasi((await params).sel);
  if (!p) notFound();
  const k = KEPUTUSAN_LOKASI[p.keputusan];
  const m = LOKASI.metode;

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>{p.nama ?? "Permukiman tanpa nama"}</h1>
        <p>{LOKASI.wilayah.nama}, {LOKASI.wilayah.provinsi} · <span className="mono">{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</span></p>
      </div>
      <div className="page-actions">
        <Link className="button secondary" href="/perencanaan">Kembali ke peta</Link>
      </div>
    </div>

    <div className="telusuri">
      <div className="telusuri-kiri">
        <article className="incident-card" aria-labelledby="keputusan-judul">
          <div className="incident-top">
            <span className="incident-status">{p.risiko === "rendah" ? <CircleCheck size={14} strokeWidth={1.75} aria-hidden /> : <CircleAlert size={14} strokeWidth={1.75} aria-hidden />}Risiko mangkrak {p.risiko}</span>
            <span>Estimasi</span>
          </div>
          <h2 id="keputusan-judul">{k.label}</h2>
          {p.alasan_risiko.length === 0
            ? <p>Akses ke kota relatif dekat, jumlah pelanggan cukup untuk iuran perawatan, dan tidak ada jaringan listrik tercatat di dekatnya.</p>
            : <ul className="daftar-alasan">{p.alasan_risiko.map(a => <li key={a}>{a}.</li>)}</ul>}
        </article>

        <section className="card" aria-labelledby="kebutuhan-judul">
          <h2 id="kebutuhan-judul">Kebutuhan dan ukuran sistem</h2>
          <dl className="profil">
            <div><dt>Penduduk</dt><dd>{ANGKA.format(p.penduduk)} jiwa (±{ANGKA.format(p.kk)} KK)</dd></div>
            <div><dt>Kebutuhan listrik</dt><dd>{ANGKA.format(p.kebutuhan_kwh_hari)} kWh/hari</dd></div>
            <div><dt>Radiasi matahari</dt><dd>{SATU.format(p.radiasi_kwh_m2_hari)} kWh/m²/hari</dd></div>
            <div><dt>Beban puncak</dt><dd>{SATU.format(p.beban_puncak_kw)} kW</dd></div>
            <div><dt>Panel surya</dt><dd>{SATU.format(p.panel_kwp)} kWp</dd></div>
            <div><dt>Baterai</dt><dd>{SATU.format(p.baterai_kwh)} kWh</dd></div>
          </dl>
          <p className="small muted catatan-bukti">Kebutuhan {SATU.format(m.kwh_per_kk_hari)} kWh per KK per hari (PLTS Parang), {DUA.format(m.art)} orang per KK (BPS Maluku 2023), rasio kinerja {DUA.format(m.pr)}, baterai menanggung satu hari tanpa matahari.</p>
        </section>

        <section className="card" aria-labelledby="akses-judul">
          <h2 id="akses-judul">Akses</h2>
          <dl className="profil">
            <div><dt>Waktu tempuh ke kota</dt><dd>{p.waktu_tempuh_jam === null ? "Tidak tersedia" : `${SATU.format(p.waktu_tempuh_jam)} jam`}</dd></div>
            <div><dt>Tambahan biaya logistik</dt><dd>+{Math.round((p.faktor_logistik - 1) * 100)}%</dd></div>
            <div className="penuh"><dt>Jaringan listrik terdekat (OpenStreetMap)</dt><dd>{p.jarak_jaringan_km === null ? "Tidak tercatat" : `${SATU.format(p.jarak_jaringan_km)} km`}<span className="table-sub">OSM hanya memuat {m.ruas_jaringan_osm} ruas jaringan di wilayah ini; status listrik desa perlu dicek ke PLN.</span></dd></div>
          </dl>
          <a className="text-link tautan-luar" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=15/${p.lat}/${p.lon}`} target="_blank" rel="noreferrer">
            <MapPin size={14} strokeWidth={1.75} aria-hidden />Lihat lokasi di OpenStreetMap<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
          </a>
        </section>
      </div>

      <div className="telusuri-kanan">
        <KartuAnggaran p={p} simulasi={m.simulasi} />
        <KartuEfektivitas p={p} genset={m.genset_rp_kwh} bunga={m.bunga} umur={m.umur_tahun} />
      </div>
    </div>
  </div>;
}

/** Posisi rentang p10-p90 dan nilai tengah pada skala 0 sampai batas atas. */
function Rentang({ nilai, atas, label }: { nilai: [number, number, number]; atas: number; label: string }) {
  const x = (v: number) => `${Math.min(100, (v / atas) * 100)}%`;
  return <div className="rentang" role="img" aria-label={label}>
    <span className="rentang-isi" style={{ left: x(nilai[0]), width: `calc(${x(nilai[2])} - ${x(nilai[0])})` }} />
    <span className="rentang-tengah" style={{ left: x(nilai[1]) }} />
  </div>;
}

function KartuAnggaran({ p, simulasi }: { p: CalonLokasi; simulasi: number }) {
  const [rendah, tengah, tinggi] = p.anggaran_rp;
  return <section className="card" aria-labelledby="anggaran-judul">
    <div className="section-heading">
      <div><h2 id="anggaran-judul">Perkiraan anggaran pembangunan</h2><p>Panel, baterai, inverter, jaringan desa, dan pemasangan.</p></div>
      <Badge>Estimasi</Badge>
    </div>
    <div className="prediksi-angka">
      <div>
        <span className="metric-label">Nilai tengah</span>
        <p className="metric-value">{rupiahRingkas(tengah)}</p>
        <span className="small muted">{rupiahRingkas(p.anggaran_per_kk_rp[1])} per KK</span>
      </div>
      <div>
        <span className="metric-label">Rentang 80% simulasi</span>
        <p className="metric-value rentang-teks">{rupiahRingkas(rendah)}<span>sampai {rupiahRingkas(tinggi)}</span></p>
      </div>
    </div>
    <Rentang nilai={p.anggaran_rp} atas={tinggi * 1.15} label={`Anggaran 80% kemungkinan antara ${rupiahRingkas(rendah)} dan ${rupiahRingkas(tinggi)}, nilai tengah ${rupiahRingkas(tengah)}`} />
    <p className="prediksi-arti">Rentangnya lebar karena biaya mini-grid di lapangan memang beragam. Angka ini untuk perencanaan awal, bukan pengganti RAB.</p>
    <p className="small muted catatan-bukti">{ANGKA.format(simulasi)} simulasi Monte Carlo: biaya per kW beban puncak diambil acak dari sebaran survei 53 mini-grid ESMAP (2022, median US$3.908), lalu dikali tambahan logistik dari waktu tempuh (asumsi 2% per jam, maksimum 50%).</p>
  </section>;
}

function KartuEfektivitas({ p, genset, bunga, umur }: { p: CalonLokasi; genset: number; bunga: number; umur: number }) {
  const atas = Math.max(p.biaya_rp_kwh[2], genset) * 1.1;
  const [, tengah] = p.biaya_rp_kwh;
  return <section className="card" aria-labelledby="efektif-judul">
    <div className="section-heading">
      <div><h2 id="efektif-judul">Efektivitas</h2><p>Biaya listrik selama {umur} tahun dibanding genset, serta bahan bakar dan emisi yang dihindari.</p></div>
    </div>
    <div className="banding">
      <div>
        <span className="metric-label">PLTS (nilai tengah dan rentang)</span>
        <strong>Rp{ANGKA.format(Math.round(tengah))}/kWh</strong>
        <Rentang nilai={p.biaya_rp_kwh} atas={atas} label={`Biaya listrik PLTS Rp${ANGKA.format(Math.round(p.biaya_rp_kwh[0]))} sampai Rp${ANGKA.format(Math.round(p.biaya_rp_kwh[2]))} per kWh`} />
      </div>
      <div>
        <span className="metric-label">Genset, bahan bakar saja</span>
        <strong>Rp{ANGKA.format(genset)}/kWh</strong>
        <div className="rentang" role="img" aria-label={`Bahan bakar genset Rp${ANGKA.format(genset)} per kWh`}><span className="rentang-isi netral" style={{ left: 0, width: `${(genset / atas) * 100}%` }} /></div>
      </div>
    </div>
    <p className="prediksi-arti">{p.rasio_genset <= 1
      ? "Listrik PLTS lebih murah daripada bahan bakar genset saja."
      : `Listrik PLTS sekitar ${SATU.format(p.rasio_genset)} kali biaya bahan bakar genset. Pembanding ini batas bawah: mesin genset, perawatannya, dan ongkos kirim solar ke pulau belum dihitung.`}</p>
    <dl className="fitur">
      <div><dt>Solar yang tidak perlu dibeli</dt><dd>{ANGKA.format(p.solar_dihemat_l_tahun)} liter per tahun</dd></div>
      <div><dt>Emisi CO2 yang dicegah</dt><dd>{SATU.format(p.co2_dicegah_t_tahun)} ton per tahun</dd></div>
    </dl>
    <p className="small muted catatan-bukti">Biaya listrik: cicilan modal (diskonto {Math.round(bunga * 100)}%, asumsi), satu kali ganti baterai di tahun ke-10, dan operasi US$80 per pelanggan per tahun (ESMAP, 2022). Genset: 0,29 liter per kWh dengan Dexlite Rp23.700 per liter.</p>
  </section>;
}
