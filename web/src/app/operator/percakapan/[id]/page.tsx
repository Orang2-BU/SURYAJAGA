import Link from "next/link";
import { Suspense } from "react";
import { Percakapan } from "@/components/operator/percakapan";
import { SoloFrame } from "@/components/solo/solo-frame";

export const metadata = { title: "Percakapan asisten" };

// Id peringatan dibaca di klien (useParams) karena datanya dari penyimpanan browser, bukan saat prerender.
export default function PercakapanAsisten() {
  return <SoloFrame nav={<Link className="button secondary" href="/">Ganti peran</Link>}>
    <main className="pesan-bingkai">
      <Suspense fallback={<p className="pesan-sistem" aria-live="polite">Memuat percakapan...</p>}>
        <Percakapan />
      </Suspense>
    </main>
  </SoloFrame>;
}
