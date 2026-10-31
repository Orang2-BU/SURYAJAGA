import { Suspense } from "react";
import { DetailPeringatan } from "@/components/peringatan/detail-peringatan";
import { DAFTAR_PLTS } from "@/lib/data";

export const metadata = { title: "Detail peringatan" };

const PLTS = Object.fromEntries(DAFTAR_PLTS.map(p => [p.id, { nama: p.nama, lokasi: `${p.desa}, ${p.kabupaten}` }]));

// Id peringatan dibaca di klien (useParams) karena datanya dari API, bukan saat prerender.
export default function HalamanDetailPeringatan() {
  return <div className="page-enter">
    <Suspense fallback={<p className="muted" aria-live="polite">Memuat peringatan...</p>}>
      <DetailPeringatan plts={PLTS} />
    </Suspense>
  </div>;
}
