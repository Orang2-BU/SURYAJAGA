"""Unduh data mentah estimasi lokasi untuk wilayah demo ke analisis/data/lokasi/ (tidak masuk git).

- WorldPop 2020 constrained 100 m Indonesia (±100 MB), lalu dipotong ke wilayah demo.
- Waktu tempuh ke kota 2015 (Weiss dkk., 2018) lewat WCS Malaria Atlas Project, hanya kotak wilayah demo.
- Nama desa dan infrastruktur listrik dari OpenStreetMap (Overpass).
Radiasi NASA POWER diambil per permukiman di lokasi.estimasi karena butuh titik permukiman dulu.

Jalankan: python -m lokasi.unduh
"""

import urllib.parse
import urllib.request
from pathlib import Path

import rasterio
from rasterio.windows import from_bounds

from lokasi.parameter import WILAYAH

AKAR = Path(__file__).resolve().parent.parent
DATA = AKAR / "data" / "lokasi"
AGEN = {"User-Agent": "SuryaJaga-purwarupa/0.1 (Seno Hackathon ITS 2026)"}

WORLDPOP = "https://data.worldpop.org/GIS/Population/Global_2000_2020_Constrained/2020/BSGM/IDN/idn_ppp_2020_constrained.tif"
WCS = ("https://data.malariaatlas.org/geoserver/Accessibility/ows?service=WCS&version=2.0.1&request=GetCoverage"
       "&coverageId=Accessibility__201501_Global_Travel_Time_to_Cities&format=image/geotiff")
# Server utama sering sibuk (502/504); cermin dipakai bergiliran.
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]


def kotak() -> tuple[float, float, float, float]:
    w = WILAYAH
    return w["barat"], w["selatan"], w["timur"], w["utara"]


def unduh(url: str, tujuan: Path, data: bytes | None = None) -> None:
    if tujuan.exists():
        return
    sementara = tujuan.with_suffix(tujuan.suffix + ".tmp")
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=AGEN), timeout=600) as r:
        sementara.write_bytes(r.read())
    sementara.replace(tujuan)


def potong_worldpop(sumber: Path, tujuan: Path) -> None:
    with rasterio.open(sumber) as r:
        jendela = from_bounds(*kotak(), transform=r.transform)
        larik = r.read(1, window=jendela)
        profil = r.profile | {"height": larik.shape[0], "width": larik.shape[1], "transform": r.window_transform(jendela)}
    with rasterio.open(tujuan, "w", **profil) as t:
        t.write(larik, 1)


def kueri_osm() -> str:
    b, s, t, u = kotak()
    k = f"({s},{b},{u},{t})"
    return (f'[out:json][timeout:120];(node["place"~"^(village|hamlet|town|island;village)$"]{k};'
            f'way["power"~"^(line|minor_line)$"]{k};nwr["power"="plant"]{k};nwr["power"="generator"]{k};);out tags center geom;')


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    nasional = DATA / "idn_ppp_2020_constrained.tif"
    unduh(WORLDPOP, nasional)
    potong_worldpop(nasional, DATA / "penduduk.tif")
    b, s, t, u = kotak()
    unduh(f"{WCS}&subset=Long({b},{t})&subset=Lat({s},{u})", DATA / "waktu_tempuh.tif")
    kueri = urllib.parse.urlencode({"data": kueri_osm()}).encode()
    for i, url in enumerate(OVERPASS):
        try:
            unduh(url, DATA / "osm.json", kueri)
            break
        except OSError:
            if i == len(OVERPASS) - 1:
                raise
    print("ok", sorted(p.name for p in DATA.iterdir()))


if __name__ == "__main__":
    main()
