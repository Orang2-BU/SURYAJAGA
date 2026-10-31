"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

// Komponen dasar template Soft Op Dashboard (port dari implementasi acuan K-DASP).

export type Tone = "neutral" | "ok" | "warn" | "crit";

export function Icon({ icon: Glyph, size = 18, ...props }: { icon: LucideIcon; size?: number } & ComponentProps<"svg">) {
  return <Glyph size={size} strokeWidth={1.75} aria-hidden="true" {...props} />;
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge ${tone}`}><span className="status-dot" />{children}</span>;
}

/** Dialog modal native: focus trap & Esc bawaan browser, fokus dikembalikan saat ditutup. */
export function Modal({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; active?.focus(); };
  }, []);
  return (
    <dialog ref={dialog} className={`modal ${className}`} aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-body">
        <div className="section-heading"><h2>{title}</h2><button className="icon-button" aria-label="Tutup dialog" onClick={onClose}><Icon icon={X} /></button></div>
        {children}
      </div>
    </dialog>
  );
}
