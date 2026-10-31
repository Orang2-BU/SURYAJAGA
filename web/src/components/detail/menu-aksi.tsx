"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BookOpenCheck, Ellipsis, Link2 } from "lucide-react";
import { Icon } from "@/components/ui";

/** Menu ⋯ untuk aksi sekunder P3 (08-DESIGN A5). Native <details>: buka/tutup dengan Enter atau Spasi, Esc menutup. */
export function MenuAksi() {
  const menu = useRef<HTMLDetailsElement>(null);
  const [pesan, setPesan] = useState("");

  async function salin() {
    try {
      await navigator.clipboard.writeText(location.href);
      setPesan("Tautan disalin");
    } catch {
      setPesan("Gagal menyalin, salin dari bilah alamat");
    }
  }

  return <details ref={menu} className="menu-aksi" onKeyDown={e => {
    if (e.key === "Escape" && menu.current?.open) { menu.current.open = false; menu.current.querySelector("summary")?.focus(); }
  }} onToggle={() => setPesan("")}>
    <summary className="icon-button" aria-label="Aksi lain"><Icon icon={Ellipsis} /></summary>
    <div className="menu-aksi-isi">
      <button type="button" onClick={salin}><Icon icon={Link2} size={16} />Salin tautan</button>
      <Link href="/bukti/metodologi"><Icon icon={BookOpenCheck} size={16} />Lihat metodologi</Link>
      <p role="status" className="small muted">{pesan}</p>
    </div>
  </details>;
}
