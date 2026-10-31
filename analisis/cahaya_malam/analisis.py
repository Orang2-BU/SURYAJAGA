"""Deteksi PLTS desa padam dari cahaya malam dan ekspor hasil semua desa uji (T7).

Aturan ditetapkan 30 Okt 2026 sebelum data desa uji dilihat (03-ARCHITECTURE Q11):
- Garis dasar desa = median radiansi bulanan 2015-2016.
- Bulan anomali = radiansi < 50% garis dasar.
- Terdeteksi padam = minimal 6 bulan anomali berturut-turut (bulan tanpa data tidak memutus deret).
- Sinyal lemah = garis dasar < 0,5 nW/cm²/sr: lampu desa tidak terbedakan dari derau sensor,
  sehingga desa itu tidak dinilai (dilaporkan apa adanya, bukan dibuang).
- Malam gelap (90 hari terakhir) = malam cerah dengan radiansi < 50% garis dasar.

Masukan: analisis/data/cahaya/{bulanan,harian}.csv dari cahaya_malam.unduh.
Keluaran: web/public/data/cahaya.json (metode + hasil dan deret semua desa uji).

Jalankan: python -m cahaya_malam.analisis
"""

import csv
import json
import statistics
from pathlib import Path

import numpy as np

AKAR = Path(__file__).resolve().parent.parent
DESA_UJI = Path(__file__).resolve().parent / "desa_uji.json"
MASUKAN = AKAR / "data" / "cahaya"
KELUARAN = AKAR.parent / "web" / "public" / "data" / "cahaya.json"

PERIODE_DASAR = ("2015-01", "2016-12")
RASIO_ANOMALI = 0.5
BULAN_BERTURUT = 6
# [asumsi] Kira-kira tingkat derau latar DNB di komposit bulanan; bukan dari satu sumber literatur tertentu.
DASAR_MINIMUM = 0.5

TERDETEKSI, TIDAK_TERDETEKSI, SINYAL_LEMAH = "terdeteksi", "tidak_terdeteksi", "sinyal_lemah"


def garis_dasar(bulanan: list[dict]) -> float | None:
    nilai = [b["radiansi"] for b in bulanan
             if PERIODE_DASAR[0] <= b["bulan"] <= PERIODE_DASAR[1] and b["radiansi"] is not None]
    return statistics.median(nilai) if nilai else None


def deret_anomali(bulanan: list[dict], dasar: float) -> tuple[int, str | None]:
    """Panjang deret bulan anomali terpanjang setelah periode dasar dan bulan awalnya."""
    terpanjang, mulai, n, awal = 0, None, 0, None
    for b in bulanan:
        if b["bulan"] <= PERIODE_DASAR[1] or b["radiansi"] is None:
            continue
        if b["radiansi"] < RASIO_ANOMALI * dasar:
            n, awal = n + 1, awal or b["bulan"]
            if n > terpanjang:
                terpanjang, mulai = n, awal
        else:
            n, awal = 0, None
    return terpanjang, mulai


def nilai_desa(bulanan: list[dict], harian: list[dict]) -> dict:
    dasar = garis_dasar(bulanan)
    lemah = dasar is None or dasar < DASAR_MINIMUM
    berturut, mulai = (0, None) if lemah else deret_anomali(bulanan, dasar)
    cerah = [h for h in harian if h["radiansi"] is not None]
    gelap = None if lemah else sum(h["radiansi"] < RASIO_ANOMALI * dasar for h in cerah)
    return {
        "garis_dasar": None if dasar is None else round(dasar, 3),
        "status": SINYAL_LEMAH if lemah else TERDETEKSI if berturut >= BULAN_BERTURUT else TIDAK_TERDETEKSI,
        "bulan_anomali_berturut": berturut,
        "anomali_mulai": mulai,
        "bulan_berdata": sum(b["radiansi"] is not None for b in bulanan),
        "bulan_total": len(bulanan),
        "malam_cerah": len(cerah),
        "malam_total": len(harian),
        "malam_gelap": gelap,
    }


def baca_csv(path: Path, kunci: str) -> dict[str, list[dict]]:
    hasil: dict[str, list[dict]] = {}
    with open(path, encoding="utf-8") as f:
        for b in csv.DictReader(f):
            hasil.setdefault(b["desa"], []).append({
                kunci: b["tanggal"][:7] if kunci == "bulan" else b["tanggal"],
                "radiansi": float(b["radiansi"]) if b["radiansi"] else None,
                "piksel_valid": int(b["piksel_valid"]),
            })
    for deret in hasil.values():
        deret.sort(key=lambda x: x[kunci])
    return hasil


# PLTS contoh (fiktif) tidak termasuk desa uji. Deret contoh berlabel agar kartu P3 dapat diperagakan: kalender
# bulan/malam mengikuti Parang, radiansi = dasar + musiman kecil + derau (benih tetap). Tidak masuk hasil uji.
CONTOH = {"karimunjawa-contoh": ("PLTS contoh Karimunjawa", 1.2), "genting-contoh": ("PLTS contoh Pulau Genting", 0.9)}


def deret_contoh(kalender: list[dict], kunci: str, dasar: float, rng: np.random.Generator) -> list[dict]:
    return [{kunci: x[kunci], "radiansi": round(float(max(0.0, dasar * (1 + 0.1 * np.sin(i / 2) + rng.normal(0, 0.08)))), 3),
             "piksel_valid": 25} for i, x in enumerate(kalender)]


def main() -> None:
    desa = json.loads(DESA_UJI.read_text(encoding="utf-8"))["desa"]
    bulanan, harian = baca_csv(MASUKAN / "bulanan.csv", "bulan"), baca_csv(MASUKAN / "harian.csv", "tanggal")
    metode = {
        "produk": "NASA Black Marble VNP46A3 (bulanan) dan VNP46A2 (harian), koleksi 5200, LAADS DAAC",
        "jendela": "5x5 piksel (~2,3 km) di sekitar pusat desa",
        "periode_dasar": f"{PERIODE_DASAR[0][:4]}-{PERIODE_DASAR[1][:4]}",
        "rasio_anomali": RASIO_ANOMALI,
        "bulan_berturut": BULAN_BERTURUT,
        "dasar_minimum": DASAR_MINIMUM,
        "satuan": "nW/cm²/sr",
    }
    hasil = []
    for d in desa:
        b, h = bulanan.get(d["id"], []), harian.get(d["id"], [])
        hasil.append({"desa_id": d["id"], "nama": d["nama"], "grup": d["grup"], **nilai_desa(b, h), "bulanan": b, "harian": h})
    rng = np.random.default_rng(26)
    contoh = []
    for pid, (nama, dasar) in CONTOH.items():
        b, h = deret_contoh(bulanan["parang"], "bulan", dasar, rng), deret_contoh(harian["parang"], "tanggal", dasar, rng)
        contoh.append({"desa_id": pid, "nama": nama, "grup": "contoh", **nilai_desa(b, h), "bulanan": b, "harian": h})
    KELUARAN.write_text(json.dumps({"metode": metode, "desa": hasil, "contoh": contoh}, ensure_ascii=False) + "\n", encoding="utf-8")
    for r in hasil:
        print(r["desa_id"], r["grup"], r["status"], r["bulan_anomali_berturut"], r["anomali_mulai"], r["malam_gelap"])


if __name__ == "__main__":
    main()
