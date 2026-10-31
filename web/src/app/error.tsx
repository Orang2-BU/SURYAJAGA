"use client";

import Link from "next/link";
import { SoloFrame } from "@/components/solo/solo-frame";

export default function TerjadiKesalahan({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SoloFrame>
    <main className="solo-center">
      <div className="solo-card">
        <h1>Terjadi kesalahan</h1>
        <p>Halaman gagal dimuat. Coba lagi; bila masih gagal, kembali ke pilih peran.{error.digest ? ` Kode: ${error.digest}.` : ""}</p>
        <button className="button primary" onClick={reset}>Coba lagi</button>
        <Link className="button secondary" href="/">Kembali ke pilih peran</Link>
      </div>
    </main>
  </SoloFrame>;
}
