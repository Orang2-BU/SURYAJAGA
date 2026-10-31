"""Eval klasifikasi keluhan (F8): `python -m eval.keluhan` dari folder api.

eval/keluhan.csv (60 kalimat, 10 per kategori) ditulis dan dikunci sebelum model dilatih, terpisah dari data latih.
Keduanya ditulis tim (bukan pesan operator asli), jadi akurasi di sini batas atas; perlu diuji ulang dengan pesan lapangan.
"""

import hashlib
import json
from collections import Counter
from pathlib import Path

from app import config, keluhan

EVAL = Path(__file__).parent / "keluhan.csv"
HASIL = Path(__file__).parent / "hasil.json"


def varian(teks: str) -> list[str]:
    """Uji robustness: huruf besar/kecil dan tanda baca diubah, isi sama."""
    return [teks.upper(), teks.capitalize() + "!!!", teks.replace(",", "").replace(" ", "  ") + "?", f"({teks}).."]


def evaluasi() -> dict:
    teks, label = keluhan.baca_csv(EVAL)
    hasil = [keluhan.klasifikasi(t) for t in teks]
    keputusan = [keluhan.putuskan(t, h)[0] for t, h in zip(teks, hasil)]
    benar = [h["kategori"] == y for h, y in zip(hasil, label)]
    top2 = [y in (h["kategori"], h["kandidat_kedua"]["kategori"]) for h, y in zip(hasil, label)]

    per_kategori = {}
    for k in sorted(set(label)):
        idx = [i for i, y in enumerate(label) if y == k]
        per_kategori[k] = {"n": len(idx), "akurasi": round(sum(benar[i] for i in idx) / len(idx), 3)}

    def akurasi_cabang(c: str) -> float | None:
        idx = [i for i, k in enumerate(keputusan) if k == c]
        return round(sum(benar[i] for i in idx) / len(idx), 3) if idx else None

    stabil = sum(all(keluhan.klasifikasi(v)["kategori"] == h["kategori"] for v in varian(t)) for t, h in zip(teks, hasil))
    salah = [{"teks": t, "label": y, "prediksi": h["kategori"], "p": h["p"]} for t, y, h, b in zip(teks, label, hasil, benar) if not b]

    return {
        "model": f"keluhan-v1 (TF-IDF n-gram huruf 2-5 + regresi logistik C={keluhan.C:g})",
        "hash_data_latih": keluhan.hash_latih(),
        "hash_eval": hashlib.sha256(EVAL.read_bytes()).hexdigest()[:16],
        "n": len(teks),
        "akurasi": round(sum(benar) / len(benar), 3),
        "akurasi_dua_teratas": round(sum(top2) / len(top2), 3),
        "per_kategori": per_kategori,
        "ambang": config.AMBANG_KELUHAN,
        "cabang": dict(Counter(keputusan)),
        "akurasi_per_cabang": {c: akurasi_cabang(c) for c in ("panduan", "konfirmasi", "teknisi")},
        "robustness_stabil": f"{stabil}/{len(teks)}",
        "salah": salah,
        "catatan": "Data latih dan eval ditulis tim (bukan pesan operator asli); akurasi ini batas atas.",
    }


if __name__ == "__main__":
    h = evaluasi()
    HASIL.write_text(json.dumps(h, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: v for k, v in h.items() if k != "salah"}, ensure_ascii=False, indent=1))
    for s in h["salah"]:
        print("SALAH", s)
