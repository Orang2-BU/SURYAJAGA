"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, BellRing, Bot, CheckCheck, HardHat, RotateCw, Send } from "lucide-react";
import { Badge, Icon } from "@/components/ui";
import {
  PESAN_MAKS, STATUS_PERINGATAN, ambilPanduan, daftarPeringatan, kirimKeluhan, ubahStatusPeringatan, waktuWib,
  type HasilKeluhan, type Peringatan, type StatusPeringatan, type TopikPanduan,
} from "@/lib/api";

type Pesan =
  | { jenis: "keluhan"; teks: string }
  | { jenis: "panduan"; topik: TopikPanduan; dipilih: boolean }
  | { jenis: "konfirmasi"; pilihan: NonNullable<HasilKeluhan["pilihan"]> }
  | { jenis: "teknisi"; alasan: HasilKeluhan["alasan"] | "diminta"; topik?: TopikPanduan }
  | { jenis: "selesai" }
  | { jenis: "galat" };

type Keadaan = { tahap: "memuat" } | { tahap: "gagal" } | { tahap: "tidak_ada" } | { tahap: "siap"; peringatan: Peringatan };

const ALASAN_TEKNISI: Record<string, string> = {
  bahaya: "Keluhanmu menyebut tanda bahaya listrik. Demi keselamatan, masalah ini diteruskan ke teknisi.",
  wajib_teknisi: "Masalah kabel dan sambungan harus ditangani teknisi.",
  tidak_yakin: "Asisten belum yakin ini masalah apa, jadi keluhanmu diteruskan ke teknisi.",
  diminta: "Permintaanmu sudah diteruskan ke teknisi.",
};

/** P13: operator membaca peringatan, menulis keluhan, lalu dipandu atau diteruskan ke teknisi (F5). */
export function Percakapan() {
  const { id } = useParams<{ id: string }>();
  const [keadaan, setKeadaan] = useState<Keadaan>({ tahap: "memuat" });
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [teks, setTeks] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [versi, setVersi] = useState(0);
  const akhir = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let batal = false;
    daftarPeringatan().then(async semua => {
      let p = semua.find(x => x.id === id);
      if (!p) { if (!batal) setKeadaan({ tahap: "tidak_ada" }); return; }
      // Membuka percakapan = peringatan dibaca; status ini yang dilihat pengawas di P5.
      if (p.status === "terkirim") p = await ubahStatusPeringatan(id, "dibaca");
      if (!batal) setKeadaan({ tahap: "siap", peringatan: p });
    }, () => { if (!batal) setKeadaan({ tahap: "gagal" }); });
    return () => { batal = true; };
  }, [id, versi]);

  useEffect(() => { akhir.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [pesan]);

  const peringatan = keadaan.tahap === "siap" ? keadaan.peringatan : null;

  async function ubah(status: StatusPeringatan) {
    if (!peringatan || peringatan.status === status || peringatan.status === "selesai") return;
    try {
      const baru = await ubahStatusPeringatan(peringatan.id, status);
      setKeadaan({ tahap: "siap", peringatan: baru });
    } catch {
      // Transisi tidak diizinkan (409) tidak menghalangi operator; status di P5 tetap yang terakhir sah.
    }
  }

  async function tampilkan(hasil: HasilKeluhan) {
    if (hasil.keputusan === "panduan" && hasil.topik) {
      setPesan(x => [...x, { jenis: "panduan", topik: hasil.topik!, dipilih: false }]);
      await ubah("ditangani");
    } else if (hasil.keputusan === "konfirmasi" && hasil.pilihan) {
      setPesan(x => [...x, { jenis: "konfirmasi", pilihan: hasil.pilihan! }]);
    } else {
      setPesan(x => [...x, { jenis: "teknisi", alasan: hasil.alasan, topik: hasil.topik }]);
      await ubah("eskalasi");
    }
  }

  async function kirim(e: FormEvent) {
    e.preventDefault();
    const isi = teks.trim();
    if (!isi) return;
    setPesan(x => [...x, { jenis: "keluhan", teks: isi }]);
    setTeks("");
    setSibuk(true);
    try {
      await tampilkan(await kirimKeluhan(isi));
    } catch {
      setPesan(x => [...x, { jenis: "galat" }]);
    } finally {
      setSibuk(false);
    }
  }

  async function pilihKategori(kategori: string, label: string) {
    setPesan(x => [...x, { jenis: "keluhan", teks: `Masalah ${label.toLowerCase()}` }]);
    setSibuk(true);
    try {
      const topik = await ambilPanduan(kategori);
      if (topik.wajib_teknisi) {
        setPesan(x => [...x, { jenis: "teknisi", alasan: "wajib_teknisi", topik }]);
        await ubah("eskalasi");
      } else {
        setPesan(x => [...x, { jenis: "panduan", topik, dipilih: true }]);
        await ubah("ditangani");
      }
    } catch {
      setPesan(x => [...x, { jenis: "galat" }]);
    } finally {
      setSibuk(false);
    }
  }

  async function hubungiTeknisi() {
    setPesan(x => [...x, { jenis: "teknisi", alasan: "diminta" }]);
    await ubah("eskalasi");
  }

  async function selesai() {
    await ubah("selesai");
    setPesan(x => [...x, { jenis: "selesai" }]);
  }

  const kembali = <Link className="text-link pesan-kembali" href="/operator"><Icon icon={ArrowLeft} size={16} />Kotak masuk</Link>;

  if (keadaan.tahap === "memuat") return <>{kembali}<p className="pesan-sistem" aria-live="polite">Memuat percakapan...</p></>;
  if (keadaan.tahap === "tidak_ada") return <>{kembali}<p className="pesan-sistem">Peringatan ini tidak ditemukan. Mungkin sudah dihapus dari data demo.</p></>;
  if (keadaan.tahap === "gagal") return <>{kembali}<div className="pesan-gelembung asisten" role="alert">
    <p><strong>Asisten belum bisa dihubungi.</strong> Bila listrik desa bermasalah sekarang, hubungi pengurus koperasi atau teknisi mitra secara langsung.</p>
    <button type="button" className="button secondary" onClick={() => { setKeadaan({ tahap: "memuat" }); setVersi(v => v + 1); }}><Icon icon={RotateCw} size={16} />Coba lagi</button>
  </div></>;

  const p = keadaan.peringatan;
  const tutup = p.status === "selesai";

  return <>
    <div className="pesan-atas">
      {kembali}
      <Badge tone={STATUS_PERINGATAN[p.status].tone}>{STATUS_PERINGATAN[p.status].label}</Badge>
    </div>
    <div className="pesan-gelembung asisten">
      <span className="pesan-pengirim"><Icon icon={BellRing} size={14} />Pengawas program · {waktuWib(p.dibuat)}</span>
      <p>{p.pesan}</p>
    </div>
    <div className="pesan-gelembung asisten">
      <span className="pesan-pengirim"><Icon icon={Bot} size={14} />Asisten SuryaJaga</span>
      <p>Ceritakan apa yang terjadi dengan bahasa sehari-hari, misalnya &ldquo;lampu cuma kuat sampai jam 9 malam&rdquo;. Asisten akan memberi langkah pemeriksaan atau meneruskannya ke teknisi.</p>
    </div>

    <div className="pesan-riwayat" aria-live="polite">
      {pesan.map((m, i) => <GelembungPesan key={i} pesan={m} sibuk={sibuk} onPilih={pilihKategori} />)}
      {sibuk && <p className="pesan-sistem">Asisten sedang membaca keluhanmu...</p>}
      <div ref={akhir} />
    </div>

    {tutup ? <p className="pesan-sistem">Peringatan ini sudah ditandai selesai. Pengawas melihat statusnya di peta.</p> : <>
      <div className="jawaban-cepat">
        <button type="button" className="button secondary" onClick={hubungiTeknisi} disabled={p.status === "eskalasi"}><Icon icon={HardHat} size={16} />{p.status === "eskalasi" ? "Teknisi sudah diberi tahu" : "Hubungi teknisi"}</button>
        <button type="button" className="button secondary" onClick={selesai} disabled={p.status === "terkirim"}><Icon icon={CheckCheck} size={16} />Tandai selesai</button>
      </div>
      <form className="pesan-tulis" onSubmit={kirim}>
        <label htmlFor="keluhan" className="sr-only">Tulis keluhan</label>
        <textarea id="keluhan" rows={2} maxLength={PESAN_MAKS} value={teks} onChange={e => setTeks(e.target.value)} placeholder="Tulis keluhan..."
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        <button type="submit" className="icon-button kirim" aria-label="Kirim keluhan" disabled={sibuk || !teks.trim()}><Icon icon={Send} size={18} /></button>
      </form>
    </>}
  </>;
}

function GelembungPesan({ pesan, sibuk, onPilih }: { pesan: Pesan; sibuk: boolean; onPilih: (kategori: string, label: string) => void }) {
  const asisten = (isi: ReactNode, ikon = Bot) => <div className="pesan-gelembung asisten">
    <span className="pesan-pengirim"><Icon icon={ikon} size={14} />Asisten SuryaJaga</span>{isi}
  </div>;

  switch (pesan.jenis) {
    case "keluhan":
      return <div className="pesan-gelembung operator"><p>{pesan.teks}</p></div>;
    case "panduan":
      return asisten(<>
        <h2>{pesan.topik.judul}</h2>
        <p className="small muted">{pesan.dipilih ? "Sesuai pilihanmu." : "Asisten cukup yakin ini masalahnya."} Ikuti langkah berikut berurutan.</p>
        <ol className="langkah">{pesan.topik.langkah.map(l => <li key={l}>{l}</li>)}</ol>
        <p className="small muted">Setelah langkah ini, tekan Tandai selesai bila listrik kembali normal, atau Hubungi teknisi bila belum.</p>
      </>);
    case "konfirmasi":
      return asisten(<>
        <p>Asisten ragu di antara dua masalah. Mana yang paling mirip?</p>
        <div className="jawaban-cepat" role="group" aria-label="Pilih jenis masalah">
          {pesan.pilihan.map(x => <button key={x.kategori} type="button" className="button secondary" disabled={sibuk} onClick={() => onPilih(x.kategori, x.label)}>{x.label}</button>)}
        </div>
      </>);
    case "teknisi":
      return asisten(<>
        <p><strong>Diteruskan ke teknisi.</strong> {ALASAN_TEKNISI[pesan.alasan]}</p>
        {pesan.topik && <ol className="langkah">{pesan.topik.langkah.map(l => <li key={l}>{l}</li>)}</ol>}
        <p className="small muted">Sambil menunggu, jangan menyentuh kabel atau perangkat yang rusak.</p>
      </>, HardHat);
    case "selesai":
      return asisten(<p>Terima kasih. Peringatan ditandai selesai dan pengawas sudah melihatnya.</p>, CheckCheck);
    case "galat":
      return <div className="pesan-gelembung asisten" role="alert"><p><strong>Keluhan belum terkirim.</strong> Asisten tidak bisa dihubungi. Coba lagi, atau tekan Hubungi teknisi bila mendesak.</p></div>;
  }
}
