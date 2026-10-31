import Link from "next/link";
import { KotakMasuk } from "@/components/operator/kotak-masuk";
import { SoloFrame } from "@/components/solo/solo-frame";
import { cariPlts } from "@/lib/data";

export const metadata = { title: "Kotak masuk operator" };

// Operator demo memegang PLTS Parang, PLTS kritis di alur inti (01-PRD §4).
const PLTS_OPERATOR = "parang";

export default function KotakMasukOperator() {
  const plts = cariPlts(PLTS_OPERATOR);
  return <SoloFrame nav={<Link className="button secondary" href="/">Ganti peran</Link>}>
    <main className="pesan-bingkai">
      <header className="pesan-kepala">
        <h1>Kotak masuk</h1>
        <p>Operator demo, Koperasi Desa Merah Putih {plts?.desa ?? "Parang"} (contoh)</p>
      </header>
      <KotakMasuk pltsId={PLTS_OPERATOR} namaPlts={plts?.nama ?? "PLTS desa"} />
    </main>
  </SoloFrame>;
}
