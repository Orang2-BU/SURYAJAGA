"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BellRing, HardHat, RotateCw } from "lucide-react";
import { Badge, Icon } from "@/components/ui";
import { KATEGORI_PERINGATAN, STATUS_PERINGATAN, daftarPeringatan, ubahStatusPeringatan, waktuWib, type Peringatan } from "@/lib/api";

type Keadaan = { tahap: "memuat" } | { tahap: "gagal" } | { tahap: "tidak_ada" } | { tahap: "siap"; p: Peringatan };

const ARTI: Record<Peringatan["status"], string> = {
  terkirim: "Peringatan sudah masuk ke kotak masuk operator, belum dibuka.",
  dibaca: "Operator sudah membuka peringatan.",
  ditangani: "Operator mengikuti langkah panduan dari asisten.",
  eskalasi: "Asisten atau operator meneruskan masalah ini ke teknisi.",
  selesai: "Operator menandai masalah selesai. PLTS tampil Dalam pemulihan di peta.",
};

/** P6: linimasa satu peringatan dan tindak lanjut eskalasi oleh pengawas. */
export function DetailPeringatan({ plts }: { plts: Record<string, { nama: string; lokasi: string }> }) {
  const { id } = useParams<{ id: string }>();
  const [keadaan, setKeadaan] = useState<Keadaan>({ tahap: "memuat" });
  const [versi, setVersi] = useState(0);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState(false);

  useEffect(() => {
    let batal = false;
    daftarPeringatan().then(d => {
      const p = d.find(x => x.id === id);
      if (!batal) setKeadaan(p ? { tahap: "siap", p } : { tahap: "tidak_ada" });
    }, () => { if (!batal) setKeadaan({ tahap: "gagal" }); });
    return () => { batal = true; };
  }, [id, versi]);

  async function tangani(p: Peringatan) {
    setSibuk(true);
    setGalat(false);
    try {
      setKeadaan({ tahap: "siap", p: await ubahStatusPeringatan(p.id, "ditangani") });
    } catch {
      setGalat(true);
    } finally {
      setSibuk(false);
    }
  }

  if (keadaan.tahap === "memuat") return <section className="card" aria-busy="true"><p className="muted" aria-live="polite">Memuat peringatan...</p></section>;
  if (keadaan.tahap === "tidak_ada") return <section className="card kosong">
    <h2>Peringatan tidak ditemukan</h2>
    <p className="muted">Mungkin sudah dihapus dari data demo.</p>
    <Link className="button secondary" href="/peringatan">Kembali ke Peringatan</Link>
  </section>;
  if (keadaan.tahap === "gagal") return <section className="card kosong" role="alert">
    <h2>Peringatan tidak bisa dibuka</h2>
    <p className="muted">Peringatan demo disimpan di browser ini. Pastikan penyimpanan situs tidak diblokir, lalu coba lagi.</p>
    <button type="button" className="button secondary" onClick={() => { setKeadaan({ tahap: "memuat" }); setVersi(v => v + 1); }}><Icon icon={RotateCw} size={16} />Coba lagi</button>
  </section>;

  const { p } = keadaan;
  const info = plts[p.plts_id];
  const s = STATUS_PERINGATAN[p.status];

  return <>
    <div className="page-heading">
      <div>
        <h1>Peringatan {info?.nama ?? p.plts_id}</h1>
        <p>{info?.lokasi} · dikirim {waktuWib(p.dibuat)}</p>
      </div>
      <div className="page-actions">
        <Link className="button secondary" href="/peringatan">Kembali ke daftar</Link>
      </div>
    </div>

    <div className="telusuri">
      <div className="telusuri-kiri">
        <article className="incident-card" aria-labelledby="status-judul" aria-live="polite">
          <div className="incident-top">
            <span className="incident-status"><BellRing size={14} strokeWidth={1.75} aria-hidden />Status peringatan</span>
            <span>{KATEGORI_PERINGATAN[p.kategori]}</span>
          </div>
          <h2 id="status-judul">{s.label}</h2>
          <p>{ARTI[p.status]}</p>
          <Link className="button inverse" href={`/pemantauan/${p.plts_id}`}>
            Buka PLTS terkait<span className="button-circle"><ArrowRight size={16} strokeWidth={1.75} aria-hidden /></span>
          </Link>
        </article>

        {p.status === "eskalasi" && <section className="card" aria-labelledby="eskalasi-judul">
          <div className="section-heading">
            <div><h2 id="eskalasi-judul">Diteruskan ke teknisi</h2><p>Setelah teknisi dikirim atau dijadwalkan, tandai eskalasi ini sudah ditangani.</p></div>
            <Badge tone="warn">Perlu tindakan</Badge>
          </div>
          <button type="button" className="button primary wide" onClick={() => tangani(p)} disabled={sibuk}><Icon icon={HardHat} size={16} />{sibuk ? "Menyimpan..." : "Tandai eskalasi ditangani"}</button>
          {galat && <p className="galat" role="alert">Status belum tersimpan. Coba sekali lagi.</p>}
        </section>}

        <section className="card" aria-labelledby="pesan-judul">
          <h2 id="pesan-judul">Pesan untuk operator</h2>
          <blockquote className="pesan-kutip">{p.pesan}</blockquote>
        </section>
      </div>

      <div className="telusuri-kanan">
        <section className="card" aria-labelledby="linimasa-judul">
          <div className="section-heading">
            <div><h2 id="linimasa-judul">Linimasa</h2><p>Setiap perubahan status dari operator, asisten, dan pengawas.</p></div>
            <Badge tone={s.tone}>{s.label}</Badge>
          </div>
          <ol className="linimasa">
            {p.riwayat.map((r, i) => <li key={i}>
              <span className="linimasa-titik" aria-hidden />
              <div><strong>{STATUS_PERINGATAN[r.status].label}</strong><span>{waktuWib(r.waktu)}</span></div>
            </li>)}
          </ol>
          <p className="small muted catatan-bukti">Isi percakapan operator dengan asisten belum disimpan di server pada purwarupa ini; yang tercatat adalah perubahan statusnya.</p>
        </section>
      </div>
    </div>
  </>;
}
