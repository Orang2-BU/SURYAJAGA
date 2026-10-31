import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { SoloFrame } from "@/components/solo/solo-frame";
import { Badge } from "@/components/ui";
import { bacaPeran, type Peran } from "@/lib/peran";

// Peran terakhir dibaca per permintaan; Suspense agar sisa halaman tetap prerender (Next 16 cacheComponents).
async function TandaTerakhir({ peran }: { peran: Peran }) {
  const terakhir = bacaPeran((await cookies()).get("peran")?.value);
  return terakhir === peran ? <Badge tone="ok">Terakhir dipakai</Badge> : null;
}

const KARTU: { peran: Peran; judul: string; isi: string; tombol: string; gaya: string }[] = [
  { peran: "pengawas", judul: "Pengawas", isi: "Memantau kondisi PLTS desa, menelusuri buktinya, dan mengirim peringatan ke operator koperasi.", tombol: "Masuk sebagai Pengawas", gaya: "primary" },
  { peran: "operator", judul: "Operator desa", isi: "Menerima peringatan untuk PLTS koperasi dan mengikuti langkah perbaikan dari asisten.", tombol: "Masuk sebagai Operator", gaya: "secondary" },
];

export default function PilihPeran() {
  return <SoloFrame nav={<Badge>Data simulasi</Badge>}>
    <main className="solo-center">
      <div className="role-grid">
        {KARTU.map(k => <div className="solo-card" key={k.peran}>
          <Suspense fallback={null}><TandaTerakhir peran={k.peran} /></Suspense>
          <h1>{k.judul}</h1>
          <p>{k.isi}</p>
          <Link className={`button ${k.gaya}`} href={`/masuk?peran=${k.peran}`} prefetch={false}>{k.tombol}</Link>
        </div>)}
      </div>
    </main>
  </SoloFrame>;
}
