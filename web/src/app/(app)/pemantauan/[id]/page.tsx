import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BatteryWarning, MoonStar, Satellite, Users } from "lucide-react";
import { GrafikCahaya } from "@/components/detail/grafik-cahaya";
import { KartuLaporanMalam } from "@/components/detail/laporan-malam";
import { KartuPanel } from "@/components/detail/kartu-panel";
import { KartuStatus } from "@/components/detail/kartu-status";
import { KirimPeringatan } from "@/components/detail/kirim-peringatan";
import { MenuAksi } from "@/components/detail/menu-aksi";
import { Badge, type Tone } from "@/components/ui";
import { AMBANG_BATERAI, tingkatBaterai, type TingkatBaterai } from "@/lib/ambang";
import { CAHAYA, DAFTAR_PLTS, METRIK_BATERAI, PANEL, STATUS, cahayaUntuk, cariPlts, panelUntuk, kalimatAlasan, prediksiUntuk, type Plts, type PrediksiBaterai, type StatusCahaya } from "@/lib/data";

const ANGKA = new Intl.NumberFormat("id-ID");
const DESIMAL = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const TREN = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const persen = (x: number) => `${DESIMAL.format(x * 100)}%`;

export function generateStaticParams() {
  return DAFTAR_PLTS.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/pemantauan/[id]">) {
  const plts = cariPlts((await params).id);
  return { title: plts?.nama ?? "PLTS tidak ditemukan" };
}

const TINGKAT: Record<TingkatBaterai, { label: string; tone: Tone; arti: string }> = {
  kritis: { label: "Kritis", tone: "crit", arti: "Model sangat yakin baterai mencapai akhir umur dalam 26 minggu. Pengadaan pengganti perlu dimulai sekarang." },
  waspada: { label: "Waspada", tone: "warn", arti: "Baterai kemungkinan besar mencapai akhir umur dalam 26 minggu. Waktu yang cukup untuk menganggarkan pengganti." },
  perlu_dicek: { label: "Perlu dicek", tone: "neutral", arti: "Model ragu. Kapasitas sebaiknya diperiksa langsung oleh operator; peringatan tidak dikirim otomatis." },
  normal: { label: "Normal", tone: "ok", arti: "Tidak ada tanda baterai mencapai akhir umur dalam 26 minggu." },
};

export default async function DetailPlts({ params }: PageProps<"/pemantauan/[id]">) {
  const plts = cariPlts((await params).id);
  if (!plts) notFound();
  const status = STATUS[plts.status];
  const prediksi = prediksiUntuk(plts.id);
  const panel = panelUntuk(plts.id);

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>{plts.nama}</h1>
        <p>{plts.desa}, Kab. {plts.kabupaten}, {plts.provinsi}</p>
      </div>
      <div className="page-actions">
        <Link className="button secondary" href="/pemantauan">Kembali ke peta</Link>
        <MenuAksi />
      </div>
    </div>

    <div className="telusuri">
      <div className="telusuri-kiri">
        <KartuStatus plts={plts} />

        <section className="card" aria-labelledby="profil-judul">
          <h2 id="profil-judul">Profil PLTS</h2>
          <ProfilPlts plts={plts} />
        </section>

        <KirimPeringatan pltsId={plts.id} penerima={plts.koperasi ? `operator ${plts.koperasi}` : "operator koperasi desa"}
          kategoriAwal={prediksi?.tersedia && tingkatBaterai(prediksi.p_gagal_26_minggu) !== "normal" ? "baterai" : plts.status === "kritis" ? "padam" : "lainnya"}
          pesanAwal={`${status.label}: ${kalimatAlasan(plts.alasan_status)} Mohon periksa ${plts.nama} dan balas lewat asisten SuryaJaga.`} />
      </div>

      <div className="telusuri-kanan">
        <KartuLaporanMalam pltsId={plts.id} />
        <KartuBaterai prediksi={prediksi} />
        {panel ? <KartuPanel panel={panel} metode={PANEL.metode} /> : <section className="card" aria-labelledby="panel-judul">
          <div className="section-heading">
            <div><h2 id="panel-judul">Kondisi panel dari foto satelit</h2><p>Indeks vegetasi Sentinel-2 di area panel.</p></div>
            <Badge>Belum tersedia</Badge>
          </div>
          <div className="bukti-kosong">
            <Satellite size={20} strokeWidth={1.75} aria-hidden />
            <p>Lokasi panel PLTS ini belum dipetakan sebagai poligon di OpenStreetMap, jadi area panel belum bisa dibaca dari foto satelit.</p>
          </div>
        </section>}
        <KartuCahayaMalam plts={plts} />
      </div>
    </div>
  </div>;
}

function ProfilPlts({ plts }: { plts: Plts }) {
  const tidakTahu = <span className="muted">Tidak diketahui</span>;
  const pelanggan = plts.jumlah_kk ? `${ANGKA.format(plts.jumlah_kk)} KK` : plts.jumlah_jiwa ? `${ANGKA.format(plts.jumlah_jiwa)} jiwa` : null;
  return <dl className="profil">
    <div><dt>Kapasitas panel</dt><dd>{plts.kapasitas_kwp ? `${ANGKA.format(plts.kapasitas_kwp)} kWp` : tidakTahu}</dd></div>
    <div><dt>Kapasitas baterai</dt><dd>{plts.baterai_kwh ? `${ANGKA.format(plts.baterai_kwh)} kWh` : tidakTahu}</dd></div>
    <div><dt>Pelanggan</dt><dd>{pelanggan ? <span className="ikon-teks"><Users size={14} strokeWidth={1.75} aria-hidden />{pelanggan}</span> : tidakTahu}</dd></div>
    <div><dt>Koperasi pengelola</dt><dd>{plts.koperasi ?? tidakTahu}</dd></div>
    <div className="penuh">
      <dt>Titik lokasi</dt>
      <dd><span className="mono">{plts.lat.toFixed(4)}, {plts.lon.toFixed(4)}</span><span className="table-sub">{plts.titik === "plts" ? "Lokasi PLTS" : "Titik pusat desa/pulau, bukan titik PLTS persis"}. Sumber: {plts.sumber_lokasi}.</span>
        {/* Copernicus Browser (ESA) menampilkan citra Sentinel-2 beberapa hari terakhir, gratis tanpa kunci API. */}
        <a className="text-link tautan-luar" href={`https://browser.dataspace.copernicus.eu/?zoom=15&lat=${plts.lat}&lng=${plts.lon}`} target="_blank" rel="noreferrer">
          Lihat citra satelit terbaru di Copernicus<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
        </a></dd>
    </div>
  </dl>;
}

function KartuBaterai({ prediksi }: { prediksi: PrediksiBaterai | undefined }) {
  if (!prediksi?.tersedia) return <section className="card" aria-labelledby="baterai-judul">
    <div className="section-heading">
      <div><h2 id="baterai-judul">Prediksi baterai</h2><p>Peluang baterai mencapai akhir umur dalam {METRIK_BATERAI.horizon_minggu} minggu.</p></div>
      <Badge>Belum tersedia</Badge>
    </div>
    <div className="bukti-kosong">
      <BatteryWarning size={20} strokeWidth={1.75} aria-hidden />
      <p>{prediksi ? `${prediksi.alasan}.` : "Belum ada hasil model untuk PLTS ini."} Prediksi butuh riwayat kapasitas dari BMS baterai.</p>
      <Link className="text-link" href="/bukti/baterai">Cara kerja model baterai</Link>
    </div>
  </section>;

  const tingkat = TINGKAT[tingkatBaterai(prediksi.p_gagal_26_minggu)];
  const mae = Math.round(METRIK_BATERAI.mae_minggu);
  const minggu = Math.round(prediksi.minggu_tersisa);
  // Model membatasi minggu tersisa di 104; nilai di atas 100 berarti "jauh" (08-DESIGN, Prediksi baterai).
  const lama = prediksi.minggu_tersisa >= 100;
  const f = prediksi.fitur;

  return <section className="card" aria-labelledby="baterai-judul">
    <div className="section-heading">
      <div><h2 id="baterai-judul">Prediksi baterai</h2><p>Peluang baterai mencapai akhir umur (kapasitas 80%) dalam {METRIK_BATERAI.horizon_minggu} minggu.</p></div>
      <Badge>Simulasi</Badge>
    </div>
    {prediksi.catatan && <p className="catatan-simulasi" role="note">{prediksi.catatan}</p>}

    <div className="prediksi-angka">
      <div>
        <span className="metric-label">Peluang dalam {METRIK_BATERAI.horizon_minggu} minggu</span>
        <p className="metric-value">{persen(prediksi.p_gagal_26_minggu)}</p>
        <Badge tone={tingkat.tone}>{tingkat.label}</Badge>
      </div>
      <div>
        <span className="metric-label">Perkiraan sisa umur</span>
        <p className="metric-value">{lama ? <>Lebih dari 2<span>tahun</span></> : <>{minggu}<span>minggu</span></>}</p>
        {!lama && <span className="small muted">Rentang {Math.max(0, minggu - mae)}-{minggu + mae} minggu (galat rata-rata ±{mae})</span>}
      </div>
    </div>
    <p className="prediksi-arti">{tingkat.arti}</p>

    <GrafikKapasitas riwayat={prediksi.riwayat_soh} />

    <dl className="fitur">
      <div><dt>Kapasitas terbaca BMS (rata-rata 26 minggu)</dt><dd>{persen(f.soh_bms)}</dd></div>
      <div><dt>Laju penurunan kapasitas (52 minggu)</dt><dd>{TREN.format(f.tren_soh * 100)} poin per minggu</dd></div>
      <div><dt>Proyeksi sampai kapasitas 80%</dt><dd>{f.proyeksi_minggu >= 104 ? "Lebih dari 2 tahun" : `${Math.round(f.proyeksi_minggu)} minggu`}</dd></div>
    </dl>

    <p className="small muted catatan-bukti">
      Data BMS simulasi, bukan pengukuran lapangan. Status memakai ambang {DESIMAL.format(AMBANG_BATERAI.waspada)} (waspada) dan {DESIMAL.format(AMBANG_BATERAI.kritis)} (kritis), ambang awal yang wajib dikalibrasi saat pilot.{" "}
      <Link className="chip-sumber" href="/bukti/baterai">{METRIK_BATERAI.model.split(" ")[0]}<ArrowRight size={12} strokeWidth={1.75} aria-hidden /></Link>
    </p>
  </section>;
}

const umur = (hari: number) => hari < 365 ? `${Math.max(1, Math.round(hari / 30.4))} bulan` : `${DESIMAL.format(hari / 365)} tahun`;

/** Garis kapasitas terhadap umur baterai. SVG hanya menggambar garis; label di HTML agar tetap terbaca di layar sempit. */
function GrafikKapasitas({ riwayat }: { riwayat: { hari: number; soh_bms: number }[] }) {
  const soh = riwayat.map(r => r.soh_bms);
  const awal = riwayat[0].hari, akhir = riwayat[riwayat.length - 1].hari;
  const atas = Math.min(1, Math.max(...soh) + 0.01), bawah = Math.min(0.8, Math.min(...soh)) - 0.02;
  const x = (hari: number) => (hari - awal) / (akhir - awal) * 100;
  const y = (s: number) => (atas - s) / (atas - bawah) * 100;
  const terakhir = riwayat[riwayat.length - 1];

  return <figure className="grafik">
    <figcaption className="metric-label">Riwayat kapasitas baterai</figcaption>
    <div className="grafik-badan">
      <div className="grafik-sumbu-y" aria-hidden><span>{persen(atas)}</span><span>{persen(bawah)}</span></div>
      <div className="grafik-area">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img"
          aria-label={`Kapasitas turun dari ${persen(riwayat[0].soh_bms)} pada umur ${umur(awal)} menjadi ${persen(terakhir.soh_bms)} pada umur ${umur(akhir)}. Batas akhir umur 80%.`}>
          <line className="garis-batas" x1="0" x2="100" y1={y(0.8)} y2={y(0.8)} />
          <polyline className="garis-data" points={riwayat.map(r => `${x(r.hari).toFixed(2)},${y(r.soh_bms).toFixed(2)}`).join(" ")} />
        </svg>
        <span className="grafik-label-batas" style={{ top: `${y(0.8)}%` }} aria-hidden>Akhir umur 80%</span>
        <span className="grafik-titik" style={{ left: `${x(terakhir.hari)}%`, top: `${y(terakhir.soh_bms)}%` }} aria-hidden />
      </div>
    </div>
    <div className="grafik-sumbu-x" aria-hidden><span>Umur {umur(awal)}</span><span>Umur {umur(akhir)}</span></div>
  </figure>;
}

const BULAN_TAHUN = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

const HASIL_CAHAYA: Record<StatusCahaya, { label: string; tone: Tone }> = {
  terdeteksi: { label: "Terdeteksi padam", tone: "crit" },
  tidak_terdeteksi: { label: "Tidak terdeteksi", tone: "neutral" },
  sinyal_lemah: { label: "Sinyal lemah", tone: "neutral" },
};

function KartuCahayaMalam({ plts }: { plts: Plts }) {
  const deret = cahayaUntuk(plts.id);
  const m = CAHAYA.metode;
  const persenDasar = `${Math.round(m.rasio_anomali * 100)}% garis dasar`;
  if (!deret) return <section className="card" aria-labelledby="cahaya-judul">
    <div className="section-heading">
      <div><h2 id="cahaya-judul">Cahaya malam dari satelit</h2><p>Radiansi malam NASA Black Marble dibanding garis dasar desa.</p></div>
      <Badge>Belum tersedia</Badge>
    </div>
    <div className="bukti-kosong">
      <MoonStar size={20} strokeWidth={1.75} aria-hidden />
      <p>Desa ini tidak termasuk desa uji satelit, sehingga belum ada deret cahaya malam.</p>
      <Link className="text-link" href="/bukti/cahaya-malam">Lihat analisis cahaya malam</Link>
    </div>
  </section>;

  const hasil = HASIL_CAHAYA[deret.status];
  const kalimat = {
    terdeteksi: `${deret.bulan_anomali_berturut} bulan berturut-turut di bawah ${persenDasar}, mulai ${deret.anomali_mulai ? BULAN_TAHUN.format(new Date(`${deret.anomali_mulai}-01`)) : "-"}.`,
    tidak_terdeteksi: `Tidak ada penurunan ${m.bulan_berturut} bulan berturut-turut di bawah ${persenDasar}. Deret terpanjang ${deret.bulan_anomali_berturut} bulan.`,
    sinyal_lemah: `Garis dasar ${deret.garis_dasar === null ? "tidak ada" : TREN.format(deret.garis_dasar)}, di bawah ambang ${TREN.format(m.dasar_minimum)} ${m.satuan}: lampu desa tidak terbedakan dari derau sensor, jadi desa ini tidak dinilai.`,
  }[deret.status];

  return <section className="card" aria-labelledby="cahaya-judul">
    <div className="section-heading">
      <div><h2 id="cahaya-judul">Cahaya malam dari satelit</h2><p>Radiansi bulanan NASA Black Marble dibanding garis dasar {m.periode_dasar}.</p></div>
      <Badge tone={hasil.tone}>{hasil.label}</Badge>
    </div>
    {deret.grup === "contoh" && <p className="catatan-simulasi" role="note">Data contoh untuk PLTS fiktif, bukan citra satelit. Hasil uji satelit asli ada di Analisis Cahaya Malam.</p>}
    <p className="prediksi-arti">{kalimat}</p>
    <div className="prediksi-angka">
      <div>
        <span className="metric-label">Garis dasar {m.periode_dasar}</span>
        <p className="metric-value">{deret.garis_dasar === null ? "-" : TREN.format(deret.garis_dasar)}<span>{m.satuan}</span></p>
      </div>
      <div>
        <span className="metric-label">Malam gelap, data harian terbaru</span>
        <p className="metric-value">{deret.malam_gelap ?? "-"}<span>dari {deret.malam_cerah} malam cerah ({deret.malam_total} malam berdata)</span></p>
      </div>
    </div>
    <GrafikCahaya desa={deret} rasio={m.rasio_anomali} />
    <p className="small muted catatan-bukti">
      {deret.grup === "contoh" ? "Deret contoh untuk peragaan, " : "Data satelit asli, "}{deret.bulan_berdata} dari {deret.bulan_total} bulan berdata (sisanya tertutup awan atau berkualitas buruk). Nilai rata-rata {m.jendela}. Aturan deteksi ditetapkan sebelum data dilihat.{" "}
      <Link className="chip-sumber" href="/bukti/cahaya-malam">VNP46A3<ArrowRight size={12} strokeWidth={1.75} aria-hidden /></Link>
    </p>
  </section>;
}
