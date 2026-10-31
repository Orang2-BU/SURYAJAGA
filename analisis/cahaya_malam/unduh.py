"""Unduh NASA Black Marble untuk desa uji dan simpan nilai piksel di sekitar desa (T6).

Produk (LAADS DAAC, koleksi 5200):
- VNP46A3 bulanan 2015 sampai bulan terbaru: tren jangka panjang.
- VNP46A2 harian untuk 90 hari terakhir yang tersedia: malam padam terbaru.
Data harian 2015-2026 penuh sekitar 260 GB, sehingga diganti kombinasi ini (03-ARCHITECTURE Q11).

Setiap ubin dibuang setelah pikselnya diambil; yang disimpan hanya ringkasan per desa di
analisis/data/cahaya/{bulanan,harian}.csv. Skrip bisa diulang: ubin yang sudah diproses dilewati.

Jalankan: python -m cahaya_malam.unduh   (butuh EARTHDATA_TOKEN di analisis/.env)
"""

import csv
import json
import math
import tempfile
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, timedelta
from pathlib import Path

import h5py
import numpy as np

AKAR = Path(__file__).resolve().parent.parent
DESA_UJI = Path(__file__).resolve().parent / "desa_uji.json"
KELUARAN = AKAR / "data" / "cahaya"
ARSIP = "https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/5200"
DATA = "HDFEOS/GRIDS/VIIRS_Grid_DNB_2d/Data Fields/"

PIKSEL_PER_DERAJAT = 240  # 15 detik busur (Román dkk., 2018)
JENDELA = 5               # 5x5 piksel (~2,3 km) di sekitar pusat desa; ditetapkan sebelum data dilihat
TAHUN_AWAL = 2015
HARI_HARIAN = 90
PEKERJA = 3
KOLOM = ["tanggal", "desa", "radiansi", "piksel_valid", "piksel_total"]


def token() -> str:
    for baris in (AKAR / ".env").read_text(encoding="utf-8").splitlines():
        if baris.startswith("EARTHDATA_TOKEN="):
            return baris.split("=", 1)[1].strip()
    raise RuntimeError("EARTHDATA_TOKEN tidak ada di analisis/.env")


def ubin(lat: float, lon: float) -> tuple[str, int, int]:
    """Nama ubin sinusoidal-lintang-bujur 10x10 derajat (h00v00) beserta baris dan kolom piksel di dalamnya."""
    h, v = math.floor((lon + 180) / 10), math.floor((90 - lat) / 10)
    kolom = math.floor((lon - (h * 10 - 180)) * PIKSEL_PER_DERAJAT)
    baris = math.floor(((90 - v * 10) - lat) * PIKSEL_PER_DERAJAT)
    return f"h{h:02d}v{v:02d}", baris, kolom


def potong(larik: np.ndarray, baris: int, kolom: int) -> np.ndarray:
    r = JENDELA // 2
    return larik[max(baris - r, 0):baris + r + 1, max(kolom - r, 0):kolom + r + 1]


def ringkas(radiansi: np.ndarray, valid: np.ndarray) -> tuple[float | None, int, int]:
    """Rata-rata radiansi piksel valid di jendela; None bila tidak ada piksel valid (awan, kualitas buruk)."""
    n = int(valid.sum())
    return (round(float(radiansi[valid].mean()), 3) if n else None), n, int(valid.size)


def valid_harian(mutu: np.ndarray, awan: np.ndarray, radiansi: np.ndarray) -> np.ndarray:
    # Mandatory_Quality_Flag 0-1 = kualitas tinggi; QF_Cloud_Mask bit 6-7: 00 pasti cerah, 01 mungkin cerah
    # (Román dkk., Black Marble User Guide v2).
    cerah = ((awan >> 6) & 0b11) <= 1
    return (mutu <= 1) & cerah & (radiansi >= 0)


def valid_bulanan(mutu: np.ndarray, radiansi: np.ndarray) -> np.ndarray:
    # Quality 0 = baik, 1 = pengamatan sedikit, 2 = diisi celah (Black Marble User Guide v2). Di musim hujan
    # kualitas 1 mendominasi, termasuk kota terang (Semarang Jan 2024), jadi 0-1 dipakai; isian celah dibuang.
    return (mutu <= 1) & (radiansi >= 0)


def baca(path: Path, harian: bool, desa: list[dict]) -> list[tuple[str, float | None, int, int]]:
    with h5py.File(path) as f:
        if harian:
            rad, mutu, awan = (f[DATA + n] for n in ("DNB_BRDF-Corrected_NTL", "Mandatory_Quality_Flag", "QF_Cloud_Mask"))
        else:
            rad, mutu = (f[DATA + n] for n in ("AllAngle_Composite_Snow_Free", "AllAngle_Composite_Snow_Free_Quality"))
        hasil = []
        for d in desa:
            _, b, k = ubin(d["lat"], d["lon"])
            r, m = potong(rad, b, k), potong(mutu, b, k)
            valid = valid_harian(m, potong(awan, b, k), r) if harian else valid_bulanan(m, r)
            hasil.append((d["id"], *ringkas(r, valid)))
        return hasil


def ambil_json(url: str) -> list[dict]:
    for coba in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                isi = json.load(r)
            return isi.get("content", isi) if isinstance(isi, dict) else isi
        except Exception:
            if coba == 3:
                raise
            time.sleep(5 * (coba + 1))
    raise AssertionError("tidak tercapai")


def daftar_berkas(produk: str, hari: list[date], nama_ubin: set[str]) -> list[tuple[date, str, str]]:
    """(tanggal, ubin, url) untuk setiap hari arsip yang tersedia."""
    tersedia = {y: {i["name"] for i in ambil_json(f"{ARSIP}/{produk}/{y}.json")} for y in sorted({t.year for t in hari})}
    hari = [t for t in hari if f"{t.timetuple().tm_yday:03d}" in tersedia[t.year]]

    def isi_hari(t: date) -> list[tuple[date, str, str]]:
        doy = f"{t.timetuple().tm_yday:03d}"
        return [(t, i["name"].split(".")[2], f"{ARSIP}/{produk}/{t.year}/{doy}/{i['name']}")
                for i in ambil_json(f"{ARSIP}/{produk}/{t.year}/{doy}.json") if i["name"].split(".")[2] in nama_ubin]

    with ThreadPoolExecutor(8) as kolam:
        hasil = [x for daftar in kolam.map(isi_hari, hari) for x in daftar]
    print(f"{produk}: daftar {len(hari)} hari arsip selesai", flush=True)
    return hasil


def unduh(url: str, kunci: str, tujuan: Path) -> None:
    for coba in range(4):
        try:
            req = urllib.request.Request(url, headers={"Authorization": f"Bearer {kunci}"})
            with urllib.request.urlopen(req, timeout=120) as r, open(tujuan, "wb") as f:
                while blok := r.read(1 << 20):
                    f.write(blok)
            with open(tujuan, "rb") as f:
                if f.read(4) != b"\x89HDF":
                    raise RuntimeError("bukan berkas HDF5 (cek token atau lisensi LAADS)")
            return
        except Exception:
            if coba == 3:
                raise
            time.sleep(10 * (coba + 1))


def sudah(path: Path) -> set[tuple[str, str]]:
    if not path.exists():
        return set()
    with open(path, encoding="utf-8") as f:
        return {(b["tanggal"], b["desa"]) for b in csv.DictReader(f)}


def jalankan(produk: str, hari: list[date], harian: bool, desa: list[dict], kunci: str) -> None:
    keluaran = KELUARAN / ("harian.csv" if harian else "bulanan.csv")
    per_ubin: dict[str, list[dict]] = {}
    for d in desa:
        per_ubin.setdefault(ubin(d["lat"], d["lon"])[0], []).append(d)
    selesai = sudah(keluaran)
    tugas = [(t, u, url) for t, u, url in daftar_berkas(produk, hari, set(per_ubin))
             if any((t.isoformat(), d["id"]) not in selesai for d in per_ubin[u])]
    print(f"{produk}: {len(tugas)} ubin perlu diunduh", flush=True)
    baru = not keluaran.exists()
    with open(keluaran, "a", newline="", encoding="utf-8") as f, tempfile.TemporaryDirectory(dir=KELUARAN) as tmp:
        tulis = csv.writer(f)
        if baru:
            tulis.writerow(KOLOM)

        def kerja(t: date, u: str, url: str):
            # Satu ubin gagal tidak boleh menghentikan yang lain; ubin itu diambil lagi saat skrip diulang.
            path = Path(tmp) / url.rsplit("/", 1)[1]
            try:
                unduh(url, kunci, path)
                return t, baca(path, harian, per_ubin[u]), None
            except Exception as e:
                return t, [], f"{url.rsplit('/', 1)[1]}: {e}"
            finally:
                path.unlink(missing_ok=True)

        gagal = 0
        with ThreadPoolExecutor(PEKERJA) as kolam:
            for i, fut in enumerate(as_completed(kolam.submit(kerja, *x) for x in tugas), 1):
                t, baris, galat = fut.result()
                if galat:
                    gagal += 1
                    print(f"{produk}: gagal {galat}", flush=True)
                tulis.writerows([t.isoformat(), *b] for b in baris)
                f.flush()
                if i % 20 == 0 or i == len(tugas):
                    print(f"{produk}: {i}/{len(tugas)} ({gagal} gagal)", flush=True)
        if gagal:
            print(f"{produk}: {gagal} ubin gagal, jalankan ulang skrip untuk melanjutkan", flush=True)


def hari_terakhir_harian() -> date:
    tahun = max(int(i["name"]) for i in ambil_json(f"{ARSIP}/VNP46A2.json"))
    doy = max(int(i["name"]) for i in ambil_json(f"{ARSIP}/VNP46A2/{tahun}.json"))
    return date(tahun, 1, 1) + timedelta(days=doy - 1)


def main() -> None:
    desa = json.loads(DESA_UJI.read_text(encoding="utf-8"))["desa"]
    kunci = token()
    KELUARAN.mkdir(parents=True, exist_ok=True)
    akhir = hari_terakhir_harian()
    bulan = [date(y, m, 1) for y in range(TAHUN_AWAL, akhir.year + 1) for m in range(1, 13) if date(y, m, 1) <= akhir]
    jalankan("VNP46A3", bulan, False, desa, kunci)
    jalankan("VNP46A2", [akhir - timedelta(days=i) for i in range(HARI_HARIAN)], True, desa, kunci)


if __name__ == "__main__":
    main()
