/** Simbol SuryaJaga "Empat Penjaga", potongan kecil (master dan panduan di docs/brand). */
function BrandSymbol() {
  return <svg className="brand-symbol" viewBox="24 24 208 208" aria-hidden="true">
    <path fill="var(--color-primary)" fillRule="evenodd" d="M140 82L140 24.69A104 104 0 0 1 186.16 41.78L172.12 83.88L214.22 69.84A104 104 0 0 1 231.31 116L174 116A34 34 0 0 1 140 82ZM82 116L24.69 116A104 104 0 0 1 41.78 69.84L83.88 83.88L69.84 41.78A104 104 0 0 1 116 24.69L116 82A34 34 0 0 1 82 116ZM116 174L116 231.31A104 104 0 0 1 69.84 214.22L83.88 172.12L41.78 186.16A104 104 0 0 1 24.69 140L82 140A34 34 0 0 1 116 174ZM174 140L231.31 140A104 104 0 0 1 214.22 186.16L172.12 172.12L186.16 214.22A104 104 0 0 1 140 231.31L140 174A34 34 0 0 1 174 140Z" />
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
