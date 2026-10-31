"""Kondisi panel PLTS dari citra Sentinel-2 siang hari (F16, T7b, 03-ARCHITECTURE Q12).

Aturan ditetapkan 31 Okt 2026 sebelum data dilihat:
- Area = poligon PLTS di OpenStreetMap; pembanding = cincin 3 piksel (30 m) di sekelilingnya.
- Nilai tahunan = median NDVI piksel cerah di poligon, dari hingga 4 adegan musim kemarau (Jun-Okt) dengan
  awan paling sedikit; adegan dipakai bila >= 50% piksel poligon cerah.
- Status: "naik" bila NDVI tahun terakhir - tahun pertama >= 0,15 (tertutup vegetasi atau panel hilang),
  "turun" bila <= -0,15 (panel baru atau lahan dibuka), selain itu "stabil".

Sumber: Sentinel-2 L2A (ESA Copernicus) lewat Microsoft Planetary Computer, tanpa kunci; hanya jendela kecil di
sekitar poligon yang dibaca dari berkas COG, bukan ubin utuh.
Keluaran: web/public/data/panel.json.  Jalankan: python -m panel.analisis
"""

import json
import os
import re
import statistics
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from pystac_client import Client
from rasterio.enums import Resampling
from rasterio.features import geometry_mask
from rasterio.warp import transform_geom
from rasterio.windows import from_bounds

AKAR = Path(__file__).resolve().parent.parent
PLTS_JSON = AKAR.parent / "web" / "public" / "data" / "plts.json"
KELUARAN = AKAR.parent / "web" / "public" / "data" / "panel.json"
SIMPANAN = AKAR / "data" / "panel_tahunan.json"  # hasil per PLTS-tahun agar skrip bisa dilanjutkan
STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
SAS = "https://planetarycomputer.microsoft.com/api/sas/v1/token/sentinel-2-l2a"

TAHUN = range(2017, 2027)
BULAN_KEMARAU = "06-01/{t}-10-31"
ADEGAN_PER_TAHUN = 4
AWAN_MAKS = 60          # % awan seluruh adegan untuk kandidat; penyaringan sebenarnya per piksel (SCL)
CERAH_MIN = 0.5
CINCIN = 3              # piksel 10 m
AMBANG_UBAH = 0.15      # [asumsi] beda NDVI yang dianggap perubahan tutupan nyata
# SCL L2A: 2 gelap (panel surya biasanya di sini), 4 vegetasi, 5 tanah/bangunan, 6 air, 7 tak terklasifikasi.
SCL_CERAH = {2, 4, 5, 6, 7}

os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
# Tanpa batas waktu, satu unduhan COG yang macet menghentikan skrip; adegan yang gagal dilewati dan dicatat.
os.environ.setdefault("GDAL_HTTP_TIMEOUT", "60")
os.environ.setdefault("GDAL_HTTP_MAX_RETRY", "3")

# PLTS nyata tanpa poligon OSM: area panel ditafsirkan dari citra Esri World Imagery (31 Okt 2026), belum
# diverifikasi di lapangan. Persegi 18 x 12 m di tengah permukiman, sekitar 1,3 km utara titik pusat desa.
POLIGON_MANUAL = {
    "lakarama": {
        "sumber": "Penafsiran citra Esri World Imagery, 31 Okt 2026, belum diverifikasi lapangan",
        "geom": {"type": "Polygon", "coordinates": [[(122.722681, -4.523832), (122.722843, -4.523832),
                                                     (122.722843, -4.523940), (122.722681, -4.523940),
                                                     (122.722681, -4.523832)]]},
    },
}
# PLTS contoh bersifat fiktif sehingga tidak punya area panel nyata untuk dibaca satelit; deret berikut adalah
# contoh berlabel (panel terpasang sejak awal, NDVI rendah dan stabil) agar kartu P3 dapat diperagakan.
CONTOH = {"karimunjawa-contoh": 0.16, "genting-contoh": 0.19}


def poligon_osm(way: str) -> dict:
    with urllib.request.urlopen(urllib.request.Request(
            f"https://api.openstreetmap.org/api/0.6/way/{way}/full.json",
            headers={"User-Agent": "SuryaJaga-purwarupa/0.1 (hackathon ITS)"}), timeout=60) as r:
        el = json.load(r)["elements"]
    simpul = {e["id"]: (e["lon"], e["lat"]) for e in el if e["type"] == "node"}
    jalur = next(e for e in el if e["type"] == "way")["nodes"]
    return {"type": "Polygon", "coordinates": [[simpul[n] for n in jalur]]}


def lebarkan(mask: np.ndarray, n: int) -> np.ndarray:
    hasil = mask.copy()
    for _ in range(n):
        geser = hasil.copy()
        geser[1:] |= hasil[:-1]
        geser[:-1] |= hasil[1:]
        geser[:, 1:] |= hasil[:, :-1]
        geser[:, :-1] |= hasil[:, 1:]
        hasil = geser
    return hasil


def ndvi(merah: np.ndarray, nir: np.ndarray) -> np.ndarray:
    m, n = merah.astype("float64"), nir.astype("float64")
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(m + n > 0, (n - m) / (m + n), np.nan)


def nilai_adegan(merah: np.ndarray, nir: np.ndarray, scl: np.ndarray, dalam: np.ndarray) -> dict | None:
    """Median NDVI di poligon dan cincin untuk satu adegan; None bila piksel cerah di poligon < CERAH_MIN."""
    cerah = np.isin(scl, list(SCL_CERAH))
    sekitar = lebarkan(dalam, CINCIN) & ~dalam
    if dalam.sum() == 0 or (cerah & dalam).sum() / dalam.sum() < CERAH_MIN:
        return None
    v = ndvi(merah, nir)
    luar = v[cerah & sekitar]
    return {"dalam": float(np.nanmedian(v[cerah & dalam])), "sekitar": float(np.nanmedian(luar)) if luar.size else None}


def status(tahunan: list[dict]) -> tuple[str, float | None]:
    ada = [t for t in tahunan if t["ndvi_dalam"] is not None]
    if len(ada) < 2:
        return "data_kurang", None
    beda = ada[-1]["ndvi_dalam"] - ada[0]["ndvi_dalam"]
    return ("naik" if beda >= AMBANG_UBAH else "turun" if beda <= -AMBANG_UBAH else "stabil"), round(beda, 3)


def jendela_20m(win, tf10, tf20):
    """Jendela kisi 20 m yang menutupi area sama dengan jendela kisi 10 m. Batas dihitung dari transform DATASET 10 m,
    bukan transform jendela (yang sudah bergeser), agar SCL dibaca di lokasi yang sama dengan B04/B08."""
    return from_bounds(*rasterio.windows.bounds(win, tf10), tf20)


def baca_adegan(item, geom: dict, token: str) -> dict | None:
    with rasterio.open(f"{item.assets['B04'].href}?{token}") as src:
        g = transform_geom("EPSG:4326", src.crs, geom)
        xs, ys = zip(*g["coordinates"][0])
        win = from_bounds(min(xs) - 60, min(ys) - 60, max(xs) + 60, max(ys) + 60, src.transform).round_offsets().round_lengths()
        if win.col_off < 0 or win.row_off < 0 or win.col_off + win.width > src.width or win.row_off + win.height > src.height:
            return None  # PLTS di tepi ubin ini; ubin tetangga yang menutupinya utuh tetap dipakai
        merah = src.read(1, window=win)
        tf, tf10 = src.window_transform(win), src.transform
    with rasterio.open(f"{item.assets['B08'].href}?{token}") as src:
        nir = src.read(1, window=win)
    with rasterio.open(f"{item.assets['SCL'].href}?{token}") as src:
        # SCL 20 m dibaca ke kisi 10 m jendela yang sama.
        w20 = jendela_20m(win, tf10, src.transform)
        scl = src.read(1, window=w20, out_shape=merah.shape, resampling=Resampling.nearest)
    dalam = ~geometry_mask([g], out_shape=merah.shape, transform=tf, all_touched=True)
    return nilai_adegan(merah, nir, scl, dalam)


def main() -> None:
    semua = json.loads(PLTS_JSON.read_text(encoding="utf-8"))
    plts = [p for p in semua if p["titik"] == "plts" or p["id"] in POLIGON_MANUAL]
    katalog = Client.open(STAC)
    simpanan = json.loads(SIMPANAN.read_text(encoding="utf-8")) if SIMPANAN.exists() else {}
    hasil = []
    for p in plts:
        manual = POLIGON_MANUAL.get(p["id"])
        way = None if manual else re.search(r"way (\d+)", p["sumber_lokasi"]).group(1)
        geom = manual["geom"] if manual else poligon_osm(way)
        with urllib.request.urlopen(SAS, timeout=60) as r:
            token = json.load(r)["token"]  # SAS berlaku ~45 menit; diminta ulang per PLTS
        tahunan = []
        for t in TAHUN:
            if f"{p['id']}-{t}" in simpanan:
                tahunan.append(simpanan[f"{p['id']}-{t}"])
                continue
            items = sorted(katalog.search(collections=["sentinel-2-l2a"], intersects={"type": "Point", "coordinates": [p["lon"], p["lat"]]},
                                          datetime=f"{t}-{BULAN_KEMARAU.format(t=t)}", query={"eo:cloud_cover": {"lt": AWAN_MAKS}}).items(),
                           key=lambda i: i.properties["eo:cloud_cover"])[:ADEGAN_PER_TAHUN]
            nilai = []
            for i in items:
                try:
                    if v := baca_adegan(i, geom, token):
                        nilai.append(v)
                except rasterio.errors.RasterioIOError as e:
                    print(f"{p['id']} {t}: adegan {i.id} dilewati ({e})", flush=True)
            tahunan.append({
                "tahun": t,
                "adegan": len(nilai),
                "ndvi_dalam": round(statistics.median(v["dalam"] for v in nilai), 3) if nilai else None,
                "ndvi_sekitar": round(statistics.median(v["sekitar"] for v in nilai if v["sekitar"] is not None), 3)
                if any(v["sekitar"] is not None for v in nilai) else None,
            })
            simpanan[f"{p['id']}-{t}"] = tahunan[-1]
            SIMPANAN.write_text(json.dumps(simpanan), encoding="utf-8")
            print(p["id"], t, tahunan[-1], flush=True)
        s, beda = status(tahunan)
        hasil.append({"plts_id": p["id"], "osm_way": way, "sumber_poligon": manual["sumber"] if manual else "OpenStreetMap",
                      "label_data": "asli", "status": s, "beda_ndvi": beda, "tahunan": tahunan})
    for pid, nilai in CONTOH.items():
        tahunan = [{"tahun": t, "adegan": 0, "ndvi_dalam": nilai, "ndvi_sekitar": 0.62} for t in TAHUN]
        hasil.append({"plts_id": pid, "osm_way": None, "sumber_poligon": "Data contoh", "label_data": "contoh",
                      "status": status(tahunan)[0], "beda_ndvi": status(tahunan)[1], "tahunan": tahunan})
    metode = {"produk": "Sentinel-2 L2A (ESA Copernicus) lewat Microsoft Planetary Computer", "musim": "Juni-Oktober",
              "adegan_per_tahun": ADEGAN_PER_TAHUN, "cerah_min": CERAH_MIN, "cincin_m": CINCIN * 10, "ambang_ubah": AMBANG_UBAH,
              "poligon": "OpenStreetMap (ODbL)"}
    KELUARAN.write_text(json.dumps({"metode": metode, "plts": hasil}, ensure_ascii=False) + "\n", encoding="utf-8")
    for h in hasil:
        print(h["plts_id"], h["status"], h["beda_ndvi"])


if __name__ == "__main__":
    main()
