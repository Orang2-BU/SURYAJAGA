import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { CAHAYA, DAFTAR_PLTS, EVALUASI_BATERAI, LOKASI, METRIK_BATERAI, PANEL } from "@/lib/data";

export const metadata = { title: "Metodologi & Sumber" };

type Sumber = { data: string; penyedia: string; tautan: string; dipakai: string; label: "asli" | "simulasi" | "estimasi" };

const SUMBER: Sumber[] = [
  { data: "Kasus PLTS desa (status dan alasan)", penyedia: "Laporan media bertanggal, satu per PLTS", tautan: "#kasus", dipakai: "Status awal di peta dan detail PLTS", label: "asli" },
  { data: "Lokasi dan poligon PLTS", penyedia: "OpenStreetMap", tautan: "https://www.openstreetmap.org/", dipakai: "Titik peta dan area panel", label: "asli" },
  { data: "Cahaya malam bulanan dan harian", penyedia: "NASA Black Marble VNP46A3 / VNP46A2", tautan: "https://blackmarble.gsfc.nasa.gov/", dipakai: "Uji deteksi padam (hasil negatif)", label: "asli" },
  { data: "Citra Sentinel-2 L2A", penyedia: "ESA Copernicus lewat Microsoft Planetary Computer", tautan: "https://planetarycomputer.microsoft.com/dataset/sentinel-2-l2a", dipakai: "Kondisi fisik area panel (NDVI)", label: "asli" },
  { data: "Model penuaan sel LFP", penyedia: "NREL BLAST-Lite (Naumann dkk., 2018; 2020)", tautan: "https://github.com/NREL/BLAST-Lite", dipakai: "Simulator 1.200 baterai PLTS desa", label: "simulasi" },
  { data: "77 sel LFP nyata sampai akhir umur", penyedia: "HUST, Ma dkk. (2022), CC BY 4.0", tautan: "https://doi.org/10.17632/nsc7hnsg4s.2", dipakai: "Uji silang model baterai", label: "asli" },
  { data: "Penduduk 100 m", penyedia: "WorldPop 2020 (Bondarenko dkk., 2020)", tautan: "https://doi.org/10.5258/SOTON/WP00685", dipakai: "Permukiman dan jumlah KK calon lokasi", label: "estimasi" },
  { data: "Radiasi matahari", penyedia: "NASA POWER", tautan: "https://power.larc.nasa.gov/", dipakai: "Ukuran panel calon lokasi", label: "asli" },
  { data: "Waktu tempuh ke kota", penyedia: "Weiss dkk. (2018), Malaria Atlas Project", tautan: "https://doi.org/10.1038/nature25181", dipakai: "Akses, logistik, dan risiko mangkrak", label: "asli" },
  { data: "Biaya mini-grid", penyedia: "ESMAP (2022), survei 53 mini-grid", tautan: "https://doi.org/10.1596/38082", dipakai: "Simulasi Monte Carlo anggaran", label: "estimasi" },
  { data: "Daerah tertinggal", penyedia: "Perpres 63/2020", tautan: "https://peraturan.bpk.go.id/Download/127452/Perpres%20Nomor%2063%20Tahun%202020.pdf", dipakai: "Pemilihan wilayah demo", label: "asli" },
];

const ASUMSI = [
  "Kebutuhan listrik 1,5 kWh per KK per hari, dari data PLTS Parang.",
  "Skenario baterai PLTS desa: suhu ruang 27-38 °C, kedalaman pengosongan harian 40-95%, sekitar 15% kegagalan dalam simulasi bersifat mendadak (125 dari 838).",
  "Ambang peringatan baterai 0,7 (waspada) dan 0,9 (kritis) adalah ambang awal yang wajib dikalibrasi dengan data lapangan.",
  "Dugaan padam ditandai bila dua malam berturut-turut dijawab tidak menyala atau tidak dijawab.",
  "Tambahan biaya logistik 2% per jam waktu tempuh ke kota, maksimum 50%.",
  "Tingkat diskonto 10% dan umur proyek 20 tahun, dengan satu kali ganti baterai di tahun ke-10.",
  "Pembanding genset hanya bahan bakar (0,29 liter per kWh, Dexlite Rp23.700 per liter), sehingga merupakan batas bawah.",
];

const BATASAN = [
  "Satelit cahaya malam beresolusi sekitar 500 m tidak bisa membedakan desa 200-400 KK yang padam dan yang menyala.",
  "Model baterai dilatih dari data simulasi; di sel nyata urutan risikonya tepat, tetapi peluangnya lebih rendah sehingga ambang perlu kalibrasi.",
  "Kalimat latih dan uji klasifikasi keluhan disusun tim, bukan pesan operator asli; akurasinya batas atas.",
  "Status listrik eksisting tiap desa calon lokasi belum tercakup karena data jaringan di OpenStreetMap sangat sedikit.",
  "Belum ada PLTS dengan data BMS lapangan; prediksi baterai di semua PLTS memakai lintasan simulasi yang dipilih sesuai kondisi laporan.",
  "Laporan malam yang tampil saat pertama dibuka adalah contoh peragaan; jawaban operator di browser ini menggantikannya.",
  "Isi percakapan operator belum disimpan di server; yang tercatat adalah perubahan status peringatan.",
];

export default function MetodologiSumber() {
  const kasus = DAFTAR_PLTS.filter(p => p.label_data === "laporan");
  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Metodologi & Sumber</h1>
        <p>Dari mana setiap angka berasal, asumsi yang dipakai, dan batas kemampuan purwarupa.</p>
      </div>
    </div>

    <section className="card">
      <div className="section-heading">
        <div><h2>Sumber data</h2><p>Label menunjukkan apakah data asli, simulasi, atau estimasi. Data simulasi dan estimasi selalu diberi label yang sama di halaman lain.</p></div>
      </div>
      <div className="tabel-gulir">
        <table>
          <thead><tr><th scope="col">Data</th><th scope="col">Sumber</th><th scope="col">Dipakai untuk</th><th scope="col">Label</th></tr></thead>
          <tbody>
            {SUMBER.map(s => <tr key={s.data}>
              <td>{s.data}</td>
              <td>{s.tautan.startsWith("#") ? <a className="text-link" href={s.tautan}>{s.penyedia}</a> : <a className="text-link tautan-luar" href={s.tautan} target="_blank" rel="noreferrer">{s.penyedia}<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden /></a>}</td>
              <td className="muted">{s.dipakai}</td>
              <td><Badge tone={s.label === "asli" ? "ok" : "neutral"}>{s.label === "asli" ? "Asli" : s.label === "simulasi" ? "Simulasi" : "Estimasi"}</Badge></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <div className="dua-kolom">
      <section className="card" aria-labelledby="model-judul">
        <h2 id="model-judul">Model dan versi</h2>
        <dl className="fitur bungkus">
          <div><dt>Prediksi baterai</dt><dd>{METRIK_BATERAI.model}</dd></div>
          <div><dt>Hash data latih baterai</dt><dd className="mono">{EVALUASI_BATERAI.hash_data}</dd></div>
          <div><dt>Klasifikasi keluhan</dt><dd>keluhan-v1, TF-IDF n-gram huruf + regresi logistik; hasil uji di api/eval/hasil.json</dd></div>
          <div><dt>Cahaya malam</dt><dd>{CAHAYA.metode.produk}</dd></div>
          <div><dt>Kondisi panel</dt><dd>{PANEL.metode.produk}</dd></div>
          <div><dt>Estimasi lokasi</dt><dd>{LOKASI.wilayah.nama}, {LOKASI.metode.simulasi.toLocaleString("id-ID")} simulasi Monte Carlo</dd></div>
        </dl>
      </section>

      <section className="card" aria-labelledby="kasus-judul" id="kasus">
        <h2 id="kasus-judul">Sumber kasus PLTS</h2>
        <ul className="daftar-sumber">
          {kasus.map(p => <li key={p.id}>
            <a className="text-link tautan-luar" href={p.sumber} target="_blank" rel="noreferrer">{p.nama}<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden /></a>
            <span className="table-sub">{p.desa}, {p.kabupaten}</span>
          </li>)}
        </ul>
        <p className="small muted catatan-bukti">{DAFTAR_PLTS.length - kasus.length} PLTS lain adalah data contoh berlabel untuk memperlihatkan fitur yang butuh data BMS.</p>
      </section>
    </div>

    <div className="dua-kolom">
      <section className="card" aria-labelledby="asumsi-judul">
        <div className="section-heading"><h2 id="asumsi-judul">Asumsi</h2><Badge>Asumsi</Badge></div>
        <ul className="daftar-alasan">{ASUMSI.map(a => <li key={a}>{a}</li>)}</ul>
      </section>
      <section className="card" aria-labelledby="batasan-judul">
        <h2 id="batasan-judul">Batasan yang diketahui</h2>
        <ul className="daftar-alasan">{BATASAN.map(b => <li key={b}>{b}</li>)}</ul>
      </section>
    </div>
  </div>;
}
