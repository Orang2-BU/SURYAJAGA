import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PemantauanHidup } from "@/components/peta/pemantauan-hidup";
import { DAFTAR_PLTS } from "@/lib/data";

export const metadata = { title: "Peta Pemantauan" };

export default function PetaPemantauan() {
  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Peta Pemantauan</h1>
        <p>Kondisi {DAFTAR_PLTS.length} PLTS desa, diurutkan dari yang paling butuh tindakan.</p>
      </div>
      <Link className="button secondary" href="/aset">Bandingkan di tabel<ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link>
    </div>

    {DAFTAR_PLTS.length === 0 ? <section className="panel kosong">
      <h2>Belum ada PLTS yang dipantau</h2>
      <p className="muted">Jalankan <code>python -m plts</code> di folder analisis untuk memuat data PLTS.</p>
    </section> : <PemantauanHidup awal={DAFTAR_PLTS} />}
  </div>;
}
