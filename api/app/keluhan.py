"""Klasifikasi keluhan operator (F5, 03-ARCHITECTURE §5): TF-IDF n-gram huruf + regresi logistik.

Model kecil (±150 kalimat) dilatih ulang saat API mulai, jadi tidak ada berkas model yang di-unpickle.
Hasilnya deterministik untuk data latih yang sama; hash data latih dicatat di eval/hasil.json.
"""

import csv
import hashlib
import json
import re
from functools import cache
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline, make_pipeline

from app import config

# Dipilih lewat validasi silang 5 lipatan pada data latih saja (eval set tidak dipakai), 31 Okt 2026:
# C 1/5/20/100 → akurasi 0,886/0,893/0,906/0,906; porsi p ≥ 0,8 0,7%/19%/54%/64% (akurasi di porsi itu 1,0 semua).
# C=100 dipilih agar lebih banyak keluhan langsung dipandu tanpa menurunkan akurasi porsi yakin.
C = 100.0


def normalisasi(teks: str) -> str:
    """Huruf kecil, tanda baca jadi spasi: "Inverter MATI!!" sama dengan "inverter mati"."""
    return " ".join(re.sub(r"[^0-9a-z]+", " ", teks.lower()).split())


def baca_csv(path: Path) -> tuple[list[str], list[str]]:
    with path.open(encoding="utf-8", newline="") as f:
        baris = list(csv.DictReader(f))
    return [b["teks"] for b in baris], [b["kategori"] for b in baris]


def buat_model() -> Pipeline:
    # n-gram huruf menahan variasi ejaan sehari-hari ("gak/ga/nggak", "cepet/cepat").
    return make_pipeline(
        TfidfVectorizer(preprocessor=normalisasi, analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True),
        LogisticRegression(C=C, max_iter=5000),
    )


@cache
def model() -> Pipeline:
    return buat_model().fit(*baca_csv(config.KELUHAN_LATIH))


def hash_latih() -> str:
    return hashlib.sha256(config.KELUHAN_LATIH.read_bytes()).hexdigest()[:16]


@cache
def panduan() -> dict:
    return json.loads(config.PANDUAN_JSON.read_text(encoding="utf-8"))


def topik(kategori: str) -> dict:
    return next(t for t in panduan()["topik"] if t["kategori"] == kategori)


def klasifikasi(teks: str) -> dict:
    """Primitif choice + p: kategori teratas dan kandidat kedua."""
    m = model()
    p = m.predict_proba([teks])[0]
    urut = p.argsort()[::-1]
    return {
        "kategori": str(m.classes_[urut[0]]), "p": round(float(p[urut[0]]), 3),
        "kandidat_kedua": {"kategori": str(m.classes_[urut[1]]), "p": round(float(p[urut[1]]), 3)},
    }


def ada_kata_bahaya(teks: str) -> bool:
    return not config.KATA_BAHAYA.isdisjoint(normalisasi(teks).split())


def putuskan(teks: str, hasil: dict) -> tuple[str, str]:
    """Kode yang memutuskan dari p (bukan model): (keputusan, alasan)."""
    if ada_kata_bahaya(teks):
        return "teknisi", "bahaya"
    if topik(hasil["kategori"])["wajib_teknisi"]:
        return "teknisi", "wajib_teknisi"
    if hasil["p"] >= config.AMBANG_KELUHAN["panduan"]:
        return "panduan", "yakin"
    if hasil["p"] >= config.AMBANG_KELUHAN["konfirmasi"]:
        return "konfirmasi", "ragu"
    return "teknisi", "tidak_yakin"
