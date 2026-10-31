import Link from "next/link";
import { SoloFrame } from "@/components/solo/solo-frame";

export default function TidakDitemukan() {
  return <SoloFrame>
    <main className="solo-center">
      <div className="solo-card">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat ini tidak ada di SuryaJaga. Periksa kembali tautannya atau mulai dari pilih peran.</p>
        <Link className="button primary" href="/">Kembali ke pilih peran</Link>
      </div>
    </main>
  </SoloFrame>;
}
