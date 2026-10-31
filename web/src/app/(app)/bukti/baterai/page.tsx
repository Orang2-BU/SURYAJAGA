import Link from "next/link";
import { ArrowRight, BatteryCharging, Download, FlaskConical, Gauge, Target } from "lucide-react";
import { Badge } from "@/components/ui";
import { AMBANG_BATERAI } from "@/lib/ambang";
import { EVALUASI_BATERAI as E, METRIK_BATERAI, type KinerjaAmbang } from "@/lib/data";

export const metadata = { title: "Model Baterai" };

const ANGKA = new Intl.NumberFormat("id-ID");
const DES = (n: number, d = 3) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const persen = (n: number) => `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n * 100)}%`;

export default function ModelBaterai() {
  const u = E.uji_silang;
  const acakSim = E.positif_uji / E.jumlah_catatan_uji;
  const acakHust = u.positif / u.jumlah_catatan;
  const waspadaSim = E.per_ambang.find(a => a.ambang === AMBANG_BATERAI.waspada);
  const waspadaHust = u.per_ambang.find(a => a.ambang === AMBANG_BATERAI.waspada);

  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Model Baterai</h1>
        <p>Seberapa akurat prediksi baterai mencapai akhir umur (kapasitas 80%) dalam {METRIK_BATERAI.horizon_minggu} minggu.</p>
      </div>
      <div className="page-actions">
        <a className="button secondary" href="/data/baterai/metrik.json" download><Download size={16} strokeWidth={1.75} aria-hidden />Unduh metrik</a>
      </div>
    </div>

    <section className="monitor-peta">
      <div className="card">
        <div className="section-heading">
          <div><h2>Kemampuan mengurutkan risiko</h2><p>PR-AUC: 1 sempurna; garis tipis menandai tebakan acak di tiap data uji.</p></div>
          <Badge>Data simulasi + sel nyata</Badge>
        </div>
        <div className="batang-daftar">
          <BatangMetrik label={`Data uji simulasi (${ANGKA.format(E.jumlah_baterai.uji)} baterai)`} nilai={E.pr_auc} acak={acakSim} />
          <BatangMetrik label={`Sel LFP nyata HUST (${u.jumlah_sel} sel)`} nilai={u.pr_auc} acak={acakHust} />
        </div>
        <p className="prediksi-arti">Di kedua data, model jauh di atas tebakan acak: baterai yang hampir aus mendapat peluang lebih tinggi daripada yang masih sehat.</p>
      </div>

      <article className="incident-card" aria-labelledby="kesimpulan-judul">
        <div className="incident-top">
          <span className="incident-status"><FlaskConical size={14} strokeWidth={1.75} aria-hidden />Kesimpulan uji</span>
          <span>{METRIK_BATERAI.model.split(" ")[0]}</span>
        </div>
        <h2 id="kesimpulan-judul">Urutan risiko sudah tepat, ambang perlu kalibrasi lapangan</h2>
        <p>Di sel nyata, peluang yang keluar lebih rendah daripada di simulasi (median {DES(u.median_p_pada_positif)} pada sel yang akan aus). Dengan ambang waspada {DES(AMBANG_BATERAI.waspada, 1)}, baru {waspadaHust ? persen(waspadaHust.recall) : "-"} sel yang akan aus tertangkap, walaupun tanpa peringatan palsu.</p>
        <div className="incident-factors">
          <span><Target size={13} strokeWidth={1.75} aria-hidden />Presisi sel nyata {waspadaHust ? persen(waspadaHust.presisi) : "-"}</span>
        </div>
        <Link className="button inverse" href="/pemantauan/karimunjawa-contoh">
          Lihat contoh prediksi<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
        </Link>
      </article>
    </section>

    <section className="metrics-grid" aria-label="Metrik utama">
      <Kartu ikon={Gauge} label="PR-AUC simulasi" nilai={DES(E.pr_auc)} ket={`acak ${DES(acakSim)}`} />
      <Kartu ikon={Gauge} label="PR-AUC sel nyata" nilai={DES(u.pr_auc)} ket={`acak ${DES(acakHust)}`} />
      <Kartu ikon={Target} label={`Recall simulasi @${DES(AMBANG_BATERAI.waspada, 1)}`} nilai={waspadaSim ? persen(waspadaSim.recall) : "-"} ket={`presisi ${waspadaSim ? persen(waspadaSim.presisi) : "-"}`} />
      <Kartu ikon={BatteryCharging} label="Galat sisa umur" nilai={`±${Math.round(METRIK_BATERAI.mae_minggu)}`} ket="minggu (MAE)" />
    </section>

    <section className="card">
      <div className="section-heading">
        <div><h2>Kinerja per ambang</h2><p>Recall: bagian baterai yang akan aus yang tertangkap. Presisi: bagian peringatan yang benar.</p></div>
      </div>
      <div className="tabel-gulir">
        <table>
          <thead><tr><th scope="col">Ambang peluang</th><th scope="col" className="numeric">Recall simulasi</th><th scope="col" className="numeric">Presisi simulasi</th><th scope="col" className="numeric">Recall aus / mendadak</th><th scope="col" className="numeric">Recall sel nyata</th><th scope="col" className="numeric">Presisi sel nyata</th></tr></thead>
          <tbody>
            {E.per_ambang.map(a => <BarisAmbang key={a.ambang} sim={a} nyata={u.per_ambang.find(x => x.ambang === a.ambang)} />)}
            <tr>
              <td>Tanpa model: {E.pembanding_tanpa_ml.aturan.replace("<=", "≤")}<span className="table-sub">pembanding aturan sederhana</span></td>
              <td className="numeric">{persen(E.pembanding_tanpa_ml.recall)}</td>
              <td className="numeric">{persen(E.pembanding_tanpa_ml.presisi)}</td>
              <td className="numeric">-</td><td className="numeric">-</td><td className="numeric">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="small muted catatan-bukti">Aturan sederhana menangkap lebih banyak tetapi tiga dari empat peringatannya salah, sehingga operator cepat mengabaikannya. Kerusakan mendadak (sel atau BMS) hampir tidak tertangkap model karena tidak terlihat dari tren kapasitas; tanda ini datang dari laporan malam operator.</p>
    </section>

    <div className="dua-kolom">
      <section className="card">
        <h2>Fitur yang dipakai model</h2>
        <p className="small muted">Angka: turunnya PR-AUC bila fitur itu diacak. Makin besar, makin diandalkan model.</p>
        <div className="batang-daftar">
          {E.fitur_penting.map(f => <BatangMetrik key={f.fitur} label={f.nama} nilai={f.kontribusi} />)}
        </div>
        <p className="small muted catatan-bukti">Dihitung dengan permutation importance pada sampel data uji simulasi. Model hanya memakai kondisi kapasitas dari BMS, tanpa suhu, kedalaman pengosongan, atau umur.</p>
      </section>

      <section className="card">
        <h2>Data dan metode</h2>
        <dl className="fitur bungkus">
          <div><dt>Data latih dan uji</dt><dd>{ANGKA.format(E.jumlah_baterai.latih)} + {ANGKA.format(E.jumlah_baterai.uji)} baterai simulasi</dd></div>
          <div><dt>Simulator</dt><dd>NREL BLAST-Lite, sel LFP</dd></div>
          <div><dt>Uji silang</dt><dd>{u.jumlah_sel} sel LFP nyata, {ANGKA.format(u.jumlah_catatan)} catatan</dd></div>
          <div><dt>Horizon</dt><dd>{METRIK_BATERAI.horizon_minggu} minggu</dd></div>
        </dl>
        <p className="small muted catatan-bukti">{E.data}. {u.dataset}; {u.pemetaan}. {E.catatan_metode}</p>
      </section>
    </div>
  </div>;
}

function Kartu({ ikon: Ikon, label, nilai, ket }: { ikon: typeof Gauge; label: string; nilai: string; ket: string }) {
  return <div className="card metric-card">
    <div className="metric-label"><span className="metric-icon"><Ikon size={16} strokeWidth={1.75} aria-hidden /></span>{label}</div>
    <div className="metric-bottom"><p className="metric-value">{nilai}<span>{ket}</span></p></div>
  </div>;
}

function BarisAmbang({ sim, nyata }: { sim: KinerjaAmbang; nyata?: KinerjaAmbang }) {
  return <tr>
    <td>{DES(sim.ambang, 1)}{sim.ambang === AMBANG_BATERAI.waspada && <span className="table-sub">ambang waspada</span>}{sim.ambang === AMBANG_BATERAI.kritis && <span className="table-sub">ambang kritis</span>}</td>
    <td className="numeric">{persen(sim.recall)}</td>
    <td className="numeric">{persen(sim.presisi)}</td>
    <td className="numeric">{persen(sim.recall_aus)} / {sim.recall_mendadak === null ? "-" : persen(sim.recall_mendadak)}</td>
    <td className="numeric">{nyata ? persen(nyata.recall) : "-"}</td>
    <td className="numeric">{nyata ? persen(nyata.presisi) : "-"}</td>
  </tr>;
}

/** Batang horizontal 0-1 dengan penanda tebakan acak opsional. */
function BatangMetrik({ label, nilai, acak, format = (n: number) => DES(n) }: { label: string; nilai: number; acak?: number; format?: (n: number) => string }) {
  return <div className="batang">
    <div className="batang-kepala"><span>{label}</span><strong>{format(nilai)}</strong></div>
    <div className="batang-jalur" role="img" aria-label={`${label}: ${format(nilai)}${acak === undefined ? "" : `, tebakan acak ${DES(acak)}`}`}>
      <span className="batang-isi" style={{ width: `${nilai * 100}%` }} />
      {acak !== undefined && <span className="batang-acak" style={{ left: `${acak * 100}%` }} />}
    </div>
  </div>;
}
