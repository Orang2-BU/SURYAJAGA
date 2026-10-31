"""Estimasi kelayakan, anggaran, dan risiko PLTS komunal per permukiman di wilayah demo (T17, Q13).

Alur: permukiman dari WorldPop → kebutuhan listrik → ukuran sistem (radiasi NASA POWER) → anggaran
Monte Carlo (sebaran biaya ESMAP 2022 × faktor logistik dari waktu tempuh) → biaya listrik per kWh
dibanding bahan bakar genset → risiko mangkrak berbasis aturan. Keluaran: web/public/data/lokasi.json.

Jalankan: python -m lokasi.unduh lalu python -m lokasi.estimasi
"""

import json
import math
import time
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from scipy import ndimage

from lokasi import parameter as P

AKAR = Path(__file__).resolve().parent.parent
DATA = AKAR / "data" / "lokasi"
KELUARAN = AKAR.parent / "web" / "public" / "data" / "lokasi.json"
POWER = ("https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN"
         "&community=RE&longitude={lon}&latitude={lat}&format=JSON")


def kelompokkan(penduduk: np.ndarray, jarak: int = P.JARAK_GABUNG_PIKSEL) -> tuple[np.ndarray, int]:
    """Label permukiman: piksel berpenduduk yang berjarak ≤ `jarak` piksel digabung (8 arah)."""
    ada = penduduk > 0
    lebar = ndimage.binary_dilation(ada, structure=np.ones((3, 3), bool), iterations=jarak)
    label, n = ndimage.label(lebar, structure=np.ones((3, 3), bool))
    return np.where(ada, label, 0), n


def haversine_km(lat1: float, lon1: float, lat2: np.ndarray, lon2: np.ndarray) -> np.ndarray:
    p1, p2 = np.radians(lat1), np.radians(lat2)
    a = np.sin((p2 - p1) / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(np.radians(lon2 - lon1) / 2) ** 2
    return 6371 * 2 * np.arcsin(np.sqrt(a))


def ukur_sistem(kk: float, psh: float) -> dict:
    """Ukuran PLTS off-grid untuk kebutuhan `kk` rumah tangga pada radiasi `psh` kWh/m²/hari."""
    kebutuhan = kk * P.KWH_PER_KK_HARI
    return {
        "kebutuhan_kwh_hari": kebutuhan,
        "panel_kwp": kebutuhan / (psh * P.PR),
        "baterai_kwh": kebutuhan * P.OTONOMI_HARI / P.DOD,
        "beban_puncak_kw": kebutuhan / 24 / P.FAKTOR_BEBAN,
    }


def faktor_logistik(jam: float | None) -> float:
    return 1 + min(P.LOGISTIK_PER_JAM * (jam or 0), P.LOGISTIK_MAKS)


def crf(bunga: float = P.BUNGA, n: int = P.UMUR_TAHUN) -> float:
    return bunga * (1 + bunga) ** n / ((1 + bunga) ** n - 1)


def sampel_capex(beban_puncak_kw: float, jam: float | None, rng: np.random.Generator) -> np.ndarray:
    """Sampel anggaran pembangunan (Rp) dari sebaran lognormal biaya per kW_firm ESMAP (2022)."""
    sigma = math.sqrt(2 * math.log(P.CAPEX_RATA_USD_KW / P.CAPEX_MEDIAN_USD_KW))
    per_kw = rng.lognormal(math.log(P.CAPEX_MEDIAN_USD_KW), sigma, P.SIMULASI)
    return beban_puncak_kw * per_kw * faktor_logistik(jam) * P.KURS


def biaya_per_kwh(capex: np.ndarray, kk: float, sistem: dict) -> np.ndarray:
    """Biaya listrik setara (Rp/kWh): cicilan modal + penggantian baterai + operasi, dibagi produksi tahunan."""
    ganti = sistem["baterai_kwh"] * P.BATERAI_USD_KWH * P.KURS / (1 + P.BUNGA) ** P.GANTI_BATERAI_TAHUN
    tahunan = (capex + ganti) * crf() + kk * P.OPEX_USD_PELANGGAN_TAHUN * P.KURS
    return tahunan / (sistem["kebutuhan_kwh_hari"] * 365)


def genset_per_kwh() -> float:
    """Bahan bakar genset saja; mesin dan perawatan genset belum dihitung, jadi ini batas bawah."""
    return P.SFC_L_KWH * P.HARGA_SOLAR


def risiko(jam: float | None, kk: float, jarak_jaringan_km: float | None) -> tuple[str, list[str]]:
    alasan = []
    if jam is None:
        alasan.append("Waktu tempuh ke kota tidak tersedia di peta Weiss dkk. (2018)")
    elif jam > P.TEMPUH_TINGGI_JAM:
        alasan.append(f"Waktu tempuh ke kota sekitar {jam:.0f} jam: teknisi dan suku cadang sulit datang")
    elif jam > P.TEMPUH_SEDANG_JAM:
        alasan.append(f"Waktu tempuh ke kota sekitar {jam:.0f} jam: perbaikan bisa tertunda berhari-hari")
    if kk < P.KK_KECIL:
        alasan.append(f"Hanya sekitar {kk:.0f} KK: iuran sulit menutup penggantian baterai dan inverter")
    if jarak_jaringan_km is not None and jarak_jaringan_km <= P.JARINGAN_DEKAT_KM:
        alasan.append(f"Jaringan listrik tercatat {jarak_jaringan_km:.1f} km dari permukiman: PLTS bisa tidak terpakai bila jaringan PLN masuk")
    berat = sum([jam is not None and jam > P.TEMPUH_TINGGI_JAM, kk < P.KK_KECIL,
                 jarak_jaringan_km is not None and jarak_jaringan_km <= P.JARINGAN_DEKAT_KM])
    sedang = jam is not None and P.TEMPUH_SEDANG_JAM < jam <= P.TEMPUH_TINGGI_JAM
    tingkat = "tinggi" if berat >= 2 or (berat == 1 and sedang) else "sedang" if berat == 1 or sedang else "rendah"
    return tingkat, alasan


def keputusan(tingkat_risiko: str) -> str:
    """Biaya per kWh tidak dipakai sebagai syarat: pembanding genset hanya bahan bakar (batas bawah)."""
    return {"rendah": "prioritas", "sedang": "layak_dengan_pendampingan", "tinggi": "perlu_skema_perawatan"}[tingkat_risiko]


def radiasi(titik: list[tuple[float, float]]) -> list[float]:
    """Rata-rata tahunan radiasi global horizontal NASA POWER; disimpan per sel 0,5° agar panggilan hemat."""
    cache_path = DATA / "power.json"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    hasil = []
    for lat, lon in titik:
        kunci = f"{round(lat * 2) / 2},{round(lon * 2) / 2}"
        if kunci not in cache:
            url = POWER.format(lat=kunci.split(",")[0], lon=kunci.split(",")[1])
            with urllib.request.urlopen(url, timeout=120) as r:
                cache[kunci] = json.loads(r.read())["properties"]["parameter"]["ALLSKY_SFC_SW_DWN"]["ANN"]
            cache_path.write_text(json.dumps(cache))
            time.sleep(1)
        hasil.append(cache[kunci])
    return hasil


def baca_raster(nama: str) -> tuple[np.ndarray, rasterio.Affine, float | None]:
    with rasterio.open(DATA / nama) as r:
        return r.read(1), r.transform, r.nodata


def nilai_sekitar(larik: np.ndarray, transform, nodata, lat: float, lon: float, r: int = 2) -> float | None:
    baris, kolom = rasterio.transform.rowcol(transform, lon, lat)
    jendela = larik[max(baris - r, 0):baris + r + 1, max(kolom - r, 0):kolom + r + 1]
    valid = jendela[(jendela != nodata) & (jendela >= 0)]
    return float(np.median(valid)) if valid.size else None


def permukiman() -> list[dict]:
    pdd, tr, _ = baca_raster("penduduk.tif")
    pdd = np.where(pdd > 0, pdd, 0)
    label, n = kelompokkan(pdd)
    jumlah = ndimage.sum(pdd, label, range(1, n + 1))
    pusat = ndimage.center_of_mass(pdd, label, range(1, n + 1))
    hasil = []
    for i, (total, (b, k)) in enumerate(zip(jumlah, pusat), start=1):
        if total < P.PENDUDUK_MIN:
            continue
        lon, lat = tr * (k + 0.5, b + 0.5)
        hasil.append({"label": i, "penduduk": float(total), "lat": float(lat), "lon": float(lon)})
    return hasil


def main() -> None:
    osm = json.loads((DATA / "osm.json").read_text(encoding="utf-8"))["elements"]
    tempat = [e for e in osm if e["type"] == "node" and "place" in e["tags"] and "name" in e["tags"]]
    t_lat, t_lon = np.array([e["lat"] for e in tempat]), np.array([e["lon"] for e in tempat])
    titik_jaringan = [(g["lat"], g["lon"]) for e in osm if e["tags"].get("power") for g in e.get("geometry", [])]
    j_lat, j_lon = np.array([p[0] for p in titik_jaringan]), np.array([p[1] for p in titik_jaringan])
    tempuh, tr_t, nd_t = baca_raster("waktu_tempuh.tif")

    daftar = permukiman()
    psh = radiasi([(p["lat"], p["lon"]) for p in daftar])
    rng = np.random.default_rng(P.BENIH)
    genset = genset_per_kwh()
    keluaran = []
    for p, s in zip(daftar, psh):
        jarak_nama = haversine_km(p["lat"], p["lon"], t_lat, t_lon)
        dekat = int(np.argmin(jarak_nama))
        nama = tempat[dekat]["tags"]["name"] if jarak_nama[dekat] <= P.RADIUS_NAMA_KM else None
        menit = nilai_sekitar(tempuh, tr_t, nd_t, p["lat"], p["lon"])
        jam = None if menit is None else menit / 60
        jarak_jaringan = float(haversine_km(p["lat"], p["lon"], j_lat, j_lon).min()) if j_lat.size else None
        kk = p["penduduk"] / P.ART
        sistem = ukur_sistem(kk, s)
        capex = sampel_capex(sistem["beban_puncak_kw"], jam, rng)
        per_kwh = biaya_per_kwh(capex, kk, sistem)
        q = lambda x: [float(v) for v in np.percentile(x, [10, 50, 90])]  # noqa: E731
        tingkat, alasan = risiko(jam, kk, jarak_jaringan)
        rasio = float(np.median(per_kwh)) / genset
        solar_l = sistem["kebutuhan_kwh_hari"] * 365 * P.SFC_L_KWH
        keluaran.append({
            "id": f"mbd-{p['label']}",
            "nama": nama,
            "lat": round(p["lat"], 5), "lon": round(p["lon"], 5),
            "penduduk": round(p["penduduk"]), "kk": round(kk),
            "radiasi_kwh_m2_hari": round(s, 2),
            "kebutuhan_kwh_hari": round(sistem["kebutuhan_kwh_hari"], 1),
            "panel_kwp": round(sistem["panel_kwp"], 1),
            "baterai_kwh": round(sistem["baterai_kwh"], 1),
            "beban_puncak_kw": round(sistem["beban_puncak_kw"], 1),
            "waktu_tempuh_jam": None if jam is None else round(jam, 1),
            "faktor_logistik": round(faktor_logistik(jam), 3),
            "jarak_jaringan_km": None if jarak_jaringan is None else round(jarak_jaringan, 1),
            "anggaran_rp": q(capex),
            "anggaran_per_kk_rp": [v / kk for v in q(capex)],
            "biaya_rp_kwh": q(per_kwh),
            "rasio_genset": round(rasio, 3),
            "solar_dihemat_l_tahun": round(solar_l),
            "co2_dicegah_t_tahun": round(solar_l * P.KG_CO2_PER_L / 1000, 1),
            "risiko": tingkat,
            "alasan_risiko": alasan,
            "keputusan": keputusan(tingkat),
        })
    urutan = {"prioritas": 0, "layak_dengan_pendampingan": 1, "perlu_skema_perawatan": 2}
    keluaran.sort(key=lambda x: (urutan[x["keputusan"]], -x["kk"]))
    hasil = {
        "wilayah": P.WILAYAH,
        "label_data": "estimasi",
        "metode": {
            "genset_rp_kwh": round(genset), "kurs": P.KURS, "simulasi": P.SIMULASI,
            "kwh_per_kk_hari": P.KWH_PER_KK_HARI, "art": P.ART, "pr": P.PR, "faktor_beban": P.FAKTOR_BEBAN,
            "capex_median_usd_kw": P.CAPEX_MEDIAN_USD_KW, "bunga": P.BUNGA, "umur_tahun": P.UMUR_TAHUN,
            "penduduk_min": P.PENDUDUK_MIN,
            "ruas_jaringan_osm": len([e for e in osm if e["tags"].get("power")]),
        },
        "permukiman": keluaran,
    }
    KELUARAN.write_text(json.dumps(hasil, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    from collections import Counter
    print(len(keluaran), Counter(x["keputusan"] for x in keluaran), Counter(x["risiko"] for x in keluaran))


if __name__ == "__main__":
    main()
