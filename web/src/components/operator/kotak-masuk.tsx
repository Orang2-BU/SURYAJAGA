"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, Check, MessageCircle, MoonStar, RotateCw, X } from "lucide-react";
import { Badge, Icon } from "@/components/ui";
import { STATUS_PERINGATAN, ambilLaporanMalam, daftarPeringatan, kirimLaporanMalam, malamIni, waktuWib, type Jawaban, type Peringatan, type RingkasanLaporanMalam } from "@/lib/api";

const TANGGAL = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const tgl = (iso: string) => TANGGAL.format(new Date(`${iso}T00:00:00Z`));

type Keadaan = { tahap: "memuat" } | { tahap: "gagal" } | { tahap: "siap"; hariIni: string; malam: RingkasanLaporanMalam; peringatan: Peringatan[] };

/** P12: laporan malam (F15) di atas, peringatan dari pengawas di bawah. */
export function KotakMasuk({ pltsId, namaPlts }: { pltsId: string; namaPlts: string }) {
  const [keadaan, setKeadaan] = useState<Keadaan>({ tahap: "memuat" });
  const [mengirim, setMengirim] = useState<Jawaban | null>(null);
  const [galatKirim, setGalatKirim] = useState(false);

  const [versi, setVersi] = useState(0);

  useEffect(() => {
    let batal = false;
    Promise.all([ambilLaporanMalam(pltsId), daftarPeringatan(pltsId)]).then(
      // Tanggal dibaca di klien setelah data datang, bukan saat prerender (cacheComponents).
      ([malam, peringatan]) => { if (!batal) setKeadaan({ tahap: "siap", hariIni: malamIni(), malam, peringatan }); },
      () => { if (!batal) setKeadaan({ tahap: "gagal" }); },
    );
    return () => { batal = true; };
  }, [pltsId, versi]);

  async function jawab(jawaban: Jawaban, hariIni: string) {
    setMengirim(jawaban);
    setGalatKirim(false);
    try {
      await kirimLaporanMalam({ plts_id: pltsId, tanggal: hariIni, jawaban });
      setVersi(v => v + 1);
    } catch {
      setGalatKirim(true);
    } finally {
      setMengirim(null);
    }
  }

  if (keadaan.tahap === "memuat") return <p className="pesan-sistem" aria-live="polite">Memuat pesan...</p>;
  if (keadaan.tahap === "gagal") return <div className="pesan-gelembung asisten" role="alert">
    <p><strong>Layanan pesan belum bisa dihubungi.</strong> Periksa koneksi, lalu coba lagi.</p>
    <button type="button" className="button secondary" onClick={() => { setKeadaan({ tahap: "memuat" }); setVersi(v => v + 1); }}><Icon icon={RotateCw} size={16} />Coba lagi</button>
  </div>;

  const { hariIni, malam, peringatan } = keadaan;
  const malamIniDijawab = malam.laporan.find(l => l.tanggal === hariIni)?.jawaban ?? null;
  const tujuh = malam.laporan.slice(-7);

  return <>
    <section className="pesan-gelembung asisten" aria-labelledby="laporan-malam-judul">
      <span className="pesan-pengirim"><Icon icon={MoonStar} size={14} />SuryaJaga, laporan malam</span>
      <h2 id="laporan-malam-judul">Lampu desa dari {namaPlts} menyala malam ini?</h2>
      <p className="muted small">{tgl(hariIni)}. Cukup jawab sekali tiap malam. Bila {malam.malam_berturut} malam berturut tidak menyala atau tidak dijawab, pengawas diberi tahu.</p>
      <div className="jawaban-cepat" role="group" aria-label="Jawab laporan malam">
        {(["ya", "tidak"] as const).map(j => <button key={j} type="button" aria-pressed={malamIniDijawab === j} disabled={mengirim !== null}
          className={`button ${malamIniDijawab === j ? "primary" : "secondary"}`} onClick={() => jawab(j, hariIni)}>
          <Icon icon={j === "ya" ? Check : X} size={16} />{mengirim === j ? "Mengirim..." : j === "ya" ? "Ya, menyala" : "Tidak menyala"}
        </button>)}
      </div>
      {galatKirim && <p className="galat" role="alert">Jawaban belum terkirim. Coba sekali lagi.</p>}
      {malamIniDijawab && !galatKirim && <p className="small muted" aria-live="polite">Terima kasih, jawaban malam ini tercatat. Bisa diubah bila keliru.</p>}
    </section>

    {tujuh.length > 0 && <section className="riwayat-malam" aria-label="Laporan 7 malam terakhir">
      <ol>{tujuh.map(l => <li key={l.tanggal}>
        <span className={`malam-titik ${l.jawaban ?? "tanpa-jawaban"}`} aria-hidden />
        <span>{tgl(l.tanggal)}</span>
        <span className="muted">{l.jawaban === "ya" ? "Menyala" : l.jawaban === "tidak" ? "Tidak menyala" : "Tidak dijawab"}</span>
      </li>)}</ol>
      {malam.dugaan_padam && <Badge tone="crit">Pengawas menerima tanda dugaan padam</Badge>}
    </section>}

    <h2 className="pesan-judul-bagian">Peringatan dari pengawas</h2>
    {peringatan.length === 0
      ? <p className="pesan-sistem">Belum ada peringatan. Bila pengawas mengirim peringatan untuk PLTS ini, pesannya muncul di sini.</p>
      : <ul className="daftar-peringatan">{peringatan.map(p => <li key={p.id} className="pesan-gelembung asisten">
        <span className="pesan-pengirim"><Icon icon={BellRing} size={14} />Pengawas program · {waktuWib(p.dibuat)}</span>
        <p>{p.pesan}</p>
        <div className="pesan-aksi">
          <Badge tone={STATUS_PERINGATAN[p.status].tone}>{STATUS_PERINGATAN[p.status].label}</Badge>
          <Link className="button primary" href={`/operator/percakapan/${p.id}`}><Icon icon={MessageCircle} size={16} />{p.status === "selesai" ? "Lihat percakapan" : "Balas dan minta panduan"}</Link>
        </div>
      </li>)}</ul>}
  </>;
}
