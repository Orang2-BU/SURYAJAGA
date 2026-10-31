import { ArrowUpRight, Satellite } from "lucide-react";
import { Badge, type Tone } from "@/components/ui";
import type { KondisiPanel, MetodePanel } from "@/lib/data";

const ANGKA = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS: Record<KondisiPanel["status"], { label: string; tone: Tone; arti: (beda: string) => string }> = {
  naik: { label: "Berubah: lebih hijau", tone: "warn", arti: b => `NDVI di area panel naik ${b} sejak tahun pertama: area panel makin tertutup vegetasi, atau panel hilang.` },
  turun: { label: "Berubah: panel baru", tone: "neutral", arti: b => `NDVI di area panel turun ${b} sejak tahun pertama: lahan dibuka atau panel baru dipasang.` },
  stabil: { label: "Stabil", tone: "ok", arti: b => `Perubahan NDVI di area panel hanya ${b} sejak tahun pertama, di bawah ambang perubahan.` },
  data_kurang: { label: "Data kurang", tone: "neutral", arti: () => "Terlalu sedikit adegan cerah untuk menilai perubahan." },
};

/** Kartu P3 (F16): NDVI di poligon PLTS vs cincin sekitarnya per tahun, dari Sentinel-2 musim kemarau. */
export function KartuPanel({ panel, metode }: { panel: KondisiPanel; metode: MetodePanel }) {
  const s = STATUS[panel.status];
  const ada = panel.tahunan.filter(t => t.ndvi_dalam !== null);
  const nilai = panel.tahunan.flatMap(t => [t.ndvi_dalam, t.ndvi_sekitar]).filter((v): v is number => v !== null);
  const bawah = Math.min(0, ...nilai), atas = Math.max(...nilai, 0.5);
  const x = (i: number) => i / Math.max(panel.tahunan.length - 1, 1) * 100;
  const y = (v: number) => (atas - v) / (atas - bawah) * 100;
  const garis = (k: "ndvi_dalam" | "ndvi_sekitar") => panel.tahunan.flatMap((t, i) => t[k] === null ? [] : [`${x(i).toFixed(2)},${y(t[k]!).toFixed(2)}`]).join(" ");
  const beda = panel.beda_ndvi === null ? "-" : ANGKA.format(Math.abs(panel.beda_ndvi));

  return <section className="card" aria-labelledby="panel-judul">
    <div className="section-heading">
      <div><h2 id="panel-judul">Kondisi panel dari foto satelit</h2><p>Indeks vegetasi (NDVI) Sentinel-2 musim kemarau di area panel dibanding sekitarnya.</p></div>
      <Badge tone={s.tone}>{s.label}</Badge>
    </div>
    {panel.label_data === "contoh" && <p className="catatan-simulasi" role="note">Data contoh untuk PLTS fiktif, bukan hasil citra satelit.</p>}
    {panel.label_data === "asli" && !panel.osm_way && <p className="catatan-simulasi" role="note">Area panel ditafsirkan dari citra satelit dan belum diverifikasi di lapangan; hasil di bawah adalah pengukuran Sentinel-2 asli di area tersebut.</p>}
    <p className="prediksi-arti">{s.arti(beda)}</p>
    <figure className="grafik">
      <div className="grafik-badan">
        <div className="grafik-sumbu-y" aria-hidden><span>{ANGKA.format(atas)}</span><span>{ANGKA.format(bawah)}</span></div>
        <div className="grafik-area pendek">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img"
            aria-label={`NDVI area panel dari ${ada.length} tahun berdata, ${ada[0] ? `${ANGKA.format(ada[0].ndvi_dalam!)} pada ${ada[0].tahun}` : ""} sampai ${ada.at(-1) ? `${ANGKA.format(ada.at(-1)!.ndvi_dalam!)} pada ${ada.at(-1)!.tahun}` : ""}.`}>
            <polyline className="garis-dasar" points={garis("ndvi_sekitar")} fill="none" />
            <polyline className="garis-data" points={garis("ndvi_dalam")} />
          </svg>
        </div>
      </div>
      <div className="grafik-sumbu-x tahun" aria-hidden>{panel.tahunan.map((t, i) => i % 3 === 0 && <span key={t.tahun} style={{ left: `${x(i)}%` }}>{t.tahun}</span>)}</div>
      <ul className="grafik-legenda" aria-label="Keterangan grafik">
        <li><span className="kunci garis" />Area panel</li>
        <li><span className="kunci dasar" />Sekitar {metode.cincin_m} m</li>
      </ul>
    </figure>
    <p className="small muted catatan-bukti">
      Panel surya punya NDVI rendah, vegetasi tinggi. Foto siang hanya melihat kondisi fisik panel, bukan apakah listriknya menyala.
      {panel.label_data === "contoh" ? "Deret contoh untuk peragaan." : <>Data {metode.produk}, poligon {panel.sumber_poligon}.</>}{" "}
      {panel.osm_way && <a className="chip-sumber" href={`https://www.openstreetmap.org/way/${panel.osm_way}`} target="_blank" rel="noreferrer"><Satellite size={12} strokeWidth={1.75} aria-hidden />OSM {panel.osm_way}<ArrowUpRight size={12} strokeWidth={1.75} aria-hidden /></a>}
    </p>
  </section>;
}
