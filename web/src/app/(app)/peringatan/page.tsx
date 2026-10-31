import { DaftarPeringatan } from "@/components/peringatan/daftar-peringatan";
import { DAFTAR_PLTS } from "@/lib/data";

export const metadata = { title: "Peringatan" };

// Hanya nama dan lokasi yang dikirim ke klien, bukan seluruh data PLTS.
const PLTS = Object.fromEntries(DAFTAR_PLTS.map(p => [p.id, { nama: p.nama, lokasi: `${p.desa}, ${p.kabupaten}` }]));

export default function Peringatan() {
  return <div className="page-enter">
    <div className="page-heading">
      <div><h1>Peringatan</h1><p>Lacak peringatan yang dikirim ke operator sampai selesai ditangani.</p></div>
    </div>
    <DaftarPeringatan plts={PLTS} />
  </div>;
}
