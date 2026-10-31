"""Ekspor model keluhan dan aturan API ke web, untuk deploy di Vercel tanpa layanan Python.

Bobot model ke web/src/server (dipakai server Next.js), aturan kecil ke web/src/lib/aturan.json (dipakai klien).
Model tetap dilatih di sini (scikit-learn); web menjalankan inferensinya di server Next.js dengan bobot ini.
Ambang, kata bahaya, panduan, transisi status, dan aturan laporan malam ikut diekspor agar satu sumber:
api/app/config.py dan api/app/main.py. Berkas uji berisi hasil Python untuk 60 kalimat eval, dipakai test
kesetaraan di web.

Jalankan dari folder api: python ekspor_web.py
"""

import json
from pathlib import Path

from app import config, keluhan
from app.main import TRANSISI
from eval.keluhan import EVAL

TUJUAN = config.AKAR.parent / "web" / "src" / "server"


def ekspor() -> tuple[dict, dict, list[dict]]:
    m = keluhan.model()
    tfidf, logreg = m.named_steps["tfidfvectorizer"], m.named_steps["logisticregression"]
    kosakata = sorted(tfidf.vocabulary_.items(), key=lambda kv: kv[1])
    asisten = {
        "versi": f"keluhan-v1, C={keluhan.C:g}",
        "hash_data_latih": keluhan.hash_latih(),
        "ngram": list(tfidf.ngram_range),
        "kosakata": [k for k, _ in kosakata],
        "idf": [round(float(v), 6) for v in tfidf.idf_],
        "kelas": [str(k) for k in logreg.classes_],
        "bobot": [[round(float(v), 6) for v in baris] for baris in logreg.coef_],
        "intersep": [round(float(v), 6) for v in logreg.intercept_],
        "ambang": config.AMBANG_KELUHAN,
        "kata_bahaya": sorted(config.KATA_BAHAYA),
        "panduan": keluhan.panduan()["topik"],
        "pesan_maks": config.PESAN_MAKS,
    }
    # Aturan kecil untuk penyimpanan di browser; dipisah agar bobot model tidak ikut ke klien.
    aturan = {
        "pesan_maks": config.PESAN_MAKS,
        "malam_berturut_padam": config.MALAM_BERTURUT_PADAM,
        "transisi": {k: sorted(v) for k, v in TRANSISI.items()},
    }
    teks, _ = keluhan.baca_csv(EVAL)
    uji = [{"teks": t, **keluhan.klasifikasi(t), "keputusan": keluhan.putuskan(t, keluhan.klasifikasi(t))[0]} for t in teks]
    return asisten, aturan, uji


def tulis(path: Path, isi: object) -> None:
    path.write_text(json.dumps(isi, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    TUJUAN.mkdir(parents=True, exist_ok=True)
    asisten, aturan, uji = ekspor()
    tulis(TUJUAN / "asisten.json", asisten)
    tulis(TUJUAN.parent / "lib" / "aturan.json", aturan)
    tulis(TUJUAN / "asisten-uji.json", uji)
    print("ok", len(asisten["kosakata"]), "n-gram,", len(uji), "kalimat uji")
