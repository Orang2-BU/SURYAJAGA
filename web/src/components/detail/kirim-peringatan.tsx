"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Send } from "lucide-react";
import { Badge, Icon, Modal } from "@/components/ui";
import { PESAN_MAKS, KATEGORI_PERINGATAN, STATUS_PERINGATAN, daftarPeringatan, kirimPeringatan, waktuWib, type KategoriPeringatan, type Peringatan } from "@/lib/api";

/** Aksi utama P3 (F4): tulis peringatan untuk operator, simpan, tampilkan status peringatan terakhir. */
export function KirimPeringatan({ pltsId, penerima, kategoriAwal, pesanAwal }: {
  pltsId: string; penerima: string; kategoriAwal: KategoriPeringatan; pesanAwal: string;
}) {
  const [buka, setBuka] = useState(false);
  const [kategori, setKategori] = useState(kategoriAwal);
  const [pesan, setPesan] = useState(pesanAwal);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState(false);
  // undefined = memuat, null = belum ada atau tidak bisa dibaca
  const [terakhir, setTerakhir] = useState<Peringatan | null | undefined>(undefined);
  const [baruTerkirim, setBaruTerkirim] = useState(false);

  useEffect(() => {
    let batal = false;
    daftarPeringatan(pltsId).then(d => { if (!batal) setTerakhir(d[0] ?? null); }, () => { if (!batal) setTerakhir(null); });
    return () => { batal = true; };
  }, [pltsId]);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setGalat(false);
    try {
      setTerakhir(await kirimPeringatan({ plts_id: pltsId, kategori, pesan: pesan.trim() }));
      setBaruTerkirim(true);
      setBuka(false);
    } catch {
      setGalat(true);
    } finally {
      setMengirim(false);
    }
  }

  const aktif = terakhir && terakhir.status !== "selesai" ? terakhir : null;

  return <div className="aksi-peringatan">
    <button type="button" className="button primary wide" onClick={() => { setGalat(false); setBuka(true); }}>
      <Icon icon={Send} size={16} />Kirim peringatan ke operator
    </button>
    <div className="small muted" aria-live="polite">
      {aktif ? <p className="peringatan-aktif">
        {baruTerkirim ? "Terkirim" : "Peringatan aktif"} {waktuWib(aktif.dibuat)}
        <Badge tone={STATUS_PERINGATAN[aktif.status].tone}>{STATUS_PERINGATAN[aktif.status].label}</Badge>
        <Link className="text-link" href="/peringatan">Lacak<Icon icon={ArrowRight} size={14} /></Link>
      </p> : <p>Peringatan masuk ke kotak masuk {penerima}.</p>}
    </div>

    {buka && <Modal title="Kirim peringatan" onClose={() => setBuka(false)}>
      <form className="form-peringatan" onSubmit={kirim}>
        <fieldset>
          <legend>Jenis masalah</legend>
          <div className="pilih-pill">
            {(Object.keys(KATEGORI_PERINGATAN) as KategoriPeringatan[]).map(k => <label key={k}>
              <input type="radio" name="kategori" value={k} checked={kategori === k} onChange={() => setKategori(k)} />
              {KATEGORI_PERINGATAN[k]}
            </label>)}
          </div>
        </fieldset>
        <div className="kolom">
          <label htmlFor="pesan-peringatan">Pesan untuk operator</label>
          <textarea id="pesan-peringatan" rows={5} required maxLength={PESAN_MAKS} value={pesan} onChange={e => setPesan(e.target.value)} aria-describedby="pesan-sisa" />
          <span id="pesan-sisa" className="small muted">{pesan.length}/{PESAN_MAKS} karakter. Dikirim ke {penerima}.</span>
        </div>
        {galat && <p className="galat" role="alert">Peringatan belum tersimpan karena penyimpanan browser tidak bisa dipakai. Coba sekali lagi.</p>}
        <div className="form-aksi">
          <button type="button" className="button secondary" onClick={() => setBuka(false)}>Batal</button>
          <button type="submit" className="button primary" disabled={mengirim || !pesan.trim()}>
            <Icon icon={Send} size={16} />{mengirim ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </form>
    </Modal>}
  </div>;
}
