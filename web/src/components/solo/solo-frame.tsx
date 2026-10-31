import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/shell/brand";
import { Badge } from "@/components/ui";

/** Bingkai halaman di luar shell pengawas (pilih peran, tampilan operator) dengan gaya template yang sama. */
export function SoloFrame({ children, nav }: { children: ReactNode; nav?: ReactNode }) {
  return <div className="solo-frame">
    <header className="public-header">
      <Link href="/" className="brand" aria-label="SuryaJaga, ke pilih peran">
        <BrandLockup />
      </Link>
      {nav}
    </header>
    {children}
    <footer className="public-footer">
      <span>SuryaJaga <span className="footer-divider">/</span> Purwarupa Seno Hackathon ITS 2026</span>
      <span>Data simulasi dan contoh berlabel</span>
    </footer>
  </div>;
}

/** Placeholder halaman di luar shell (tampilan operator yang belum dibangun). */
export function SoloPlaceholder({ title, description }: { title: string; description: string }) {
  return <SoloFrame>
    <main className="solo-center">
      <div className="solo-card">
        <h1>{title}</h1>
        <p>{description}</p>
        <Badge>Belum dibangun</Badge>
        <Link className="button secondary" href="/">Ganti peran</Link>
      </div>
    </main>
  </SoloFrame>;
}
