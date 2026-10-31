/** Simbol sementara SuryaJaga (matahari di dalam perisai) sampai logo resmi dibuat di docs/brand. */
function BrandSymbol() {
  return <svg className="brand-symbol" viewBox="0 0 28 38" aria-hidden="true">
    <path fill="var(--color-primary)" d="M14 1 27 6v12c0 9.3-5.6 16.3-13 19C6.6 34.3 1 27.3 1 18V6Z" />
    <circle fill="var(--color-on-primary)" cx="14" cy="17" r="5" />
    <path stroke="var(--color-on-primary)" strokeWidth="1.75" strokeLinecap="round" d="M14 7.5v2.5M14 24v2.5M4.5 17H7M21 17h2.5M7.3 10.3l1.8 1.8M18.9 21.9l1.8 1.8M7.3 23.7l1.8-1.8M18.9 12.1l1.8-1.8" />
  </svg>;
}

export function BrandWordmark() {
  return <span className="brand-wordmark brand-wordmark-text">SuryaJaga</span>;
}

/** Isi baris brand: simbol + wordmark + caption (label disembunyikan saat sidebar ciut). */
export function BrandLockup() {
  return <>
    <BrandSymbol />
    <span className="nav-label">
      <BrandWordmark />
      <span className="brand-caption">Peringatan dini PLTS desa</span>
    </span>
  </>;
}
