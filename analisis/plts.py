"""Data PLTS purwarupa dan daftar desa uji satelit (T2).

Satu-satunya sumber data PLTS. Menulis:
- web/public/data/plts.json  (dibaca web)
- analisis/cahaya_malam/desa_uji.json  (dikunci sebelum data satelit dilihat, keputusan Q5)

Jalankan: python -m plts
"""

import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLTS_JSON = ROOT / "web" / "public" / "data" / "plts.json"
DESA_UJI_JSON = Path(__file__).resolve().parent / "cahaya_malam" / "desa_uji.json"

STATUS = {"normal", "waspada", "kritis", "dalam_pemulihan"}
LABEL_DATA = {"laporan", "contoh"}
GRUP_UJI = {"mangkrak", "pembanding"}

# lat/lon: titik pusat pulau/desa dari OpenStreetMap Nominatim (diambil 30 Okt 2026). Dipakai analisis satelit
# (buffer di sekitar permukiman) dan sudah dikunci di desa_uji.json.
# titik_plts: pusat poligon power=plant di OpenStreetMap (API 0.6, diambil 30 Okt 2026), dipakai sebagai titik peta.
OSM = "OpenStreetMap Nominatim, diakses 30 Okt 2026"


@dataclass(frozen=True)
class Plts:
    id: str
    nama: str
    desa: str
    kabupaten: str
    provinsi: str
    lat: float
    lon: float
    kapasitas_kwp: float | None
    baterai_kwh: float | None
    jumlah_kk: int | None
    jumlah_jiwa: int | None
    koperasi: str | None
    status: str
    alasan_status: str
    tanggal_laporan: str | None
    label_data: str
    sumber: str
    sumber_lokasi: str
    grup_uji: str | None
    titik_plts: tuple[float, float, str] | None = None  # (lat, lon, objek OSM)


PLTS = [
    Plts(
        id="parang", nama="PLTS Komunal Parang", desa="Parang", kabupaten="Jepara", provinsi="Jawa Tengah",
        lat=-5.7440683, lon=110.2424772, kapasitas_kwp=75, baterai_kwh=None, jumlah_kk=370, jumlah_jiwa=None,
        koperasi=None, status="kritis",
        alasan_status="Laporan: 75 kWp hampir seluruhnya tidak berfungsi sejak 2019, warga kembali memakai genset",
        tanggal_laporan="2022-03-12", label_data="laporan",
        sumber="https://www.detik.com/jateng/berita/d-5979817/miris-hampir-semua-plts-di-parang-karimunjawa-rusak-sejak-2019",
        sumber_lokasi=OSM, grup_uji="mangkrak",
        titik_plts=(-5.746232, 110.241575, "way 1328731111 \"PLTS Pulau Parang\""),
    ),
    Plts(
        id="lakarama", nama="PLTS Lakarama", desa="Lakarama", kabupaten="Muna", provinsi="Sulawesi Tenggara",
        lat=-4.5350276, lon=122.7236912, kapasitas_kwp=100, baterai_kwh=None, jumlah_kk=None, jumlah_jiwa=1287,
        koperasi=None, status="kritis",
        alasan_status="Laporan: sekitar 5 tahun tidak berfungsi normal karena baterai rusak; warga memakai genset 18.00-24.00",
        tanggal_laporan="2025-01-24", label_data="laporan",
        sumber="https://sultra.antaranews.com/berita/492426/warga-di-towea-muna-keluhkan-sudah-5-tahun-plts-tidak-berfungsi-normal",
        sumber_lokasi=OSM, grup_uji="mangkrak",
    ),
    Plts(
        id="burung-loe", nama="PLTS Pulau Burung Loe", desa="Pulau Buhung Pitue", kabupaten="Sinjai", provinsi="Sulawesi Selatan",
        lat=-5.1205104, lon=120.3918754, kapasitas_kwp=100, baterai_kwh=None, jumlah_kk=400, jumlah_jiwa=None,
        koperasi=None, status="kritis",
        alasan_status="Laporan: tidak beroperasi sejak 2018; 50 modul terbakar dan 500 baterai rusak, perbaikan terkendala dana",
        tanggal_laporan="2020-10-16", label_data="laporan",
        sumber="https://mongabay.co.id/2020/10/16/rusak-dan-mangkraknya-pembangkit-surya-di-kepulauan-sembilan-sinjai-dimana-masalahnya/",
        sumber_lokasi=OSM, grup_uji="mangkrak",
        titik_plts=(-5.117985, 120.391264, "way 1323856435 \"PLTS Burungloe\""),
    ),
    Plts(
        id="sembur", nama="PLTS Kopdes Merah Putih Pulau Sembur", desa="Pulau Sembur", kabupaten="Kota Batam", provinsi="Kepulauan Riau",
        lat=0.6817473, lon=104.2841202, kapasitas_kwp=400, baterai_kwh=1000, jumlah_kk=200, jumlah_jiwa=None,
        koperasi="Koperasi Desa/Kelurahan Merah Putih Galang Baru", status="normal",
        alasan_status="Laporan: diresmikan 20 Desember 2025, menggantikan genset untuk sekitar 200 KK",
        tanggal_laporan="2025-12-20", label_data="laporan",
        sumber="https://listrikindonesia.com/detail/18748/plts-desa-berbasis-koperasi-resmi-beroperasi-di-pulau-sembur",
        sumber_lokasi=OSM, grup_uji="pembanding",
        titik_plts=(0.675575, 104.300145, "way 1558353716 \"PLTS Sembur\""),
    ),
    Plts(
        id="batu-bingkung", nama="PLTS Terpusat Batu Bingkung", desa="Batu Bingkung", kabupaten="Kepulauan Selayar", provinsi="Sulawesi Selatan",
        lat=-7.3683708, lon=121.1260432, kapasitas_kwp=150, baterai_kwh=None, jumlah_kk=None, jumlah_jiwa=None,
        koperasi=None, status="normal",
        alasan_status="Laporan: setelah perbaikan, menyala 24 jam (sebelumnya hanya sampai pukul 22.00)",
        tanggal_laporan="2022-02-05", label_data="laporan",
        sumber="https://wartaekonomi.co.id/read391288/plts-terpusat-sudah-aktif-24-jam-warga-desa-batu-bingkung-merdeka-listrik",
        sumber_lokasi=OSM + " (titik Kantor Desa Batu Bingkung)", grup_uji="pembanding",
        titik_plts=(-7.367931, 121.124591, "way 1334459400 \"PLTS Batu Bingkung\""),
    ),
    # Lakarama tidak punya poligon PLTS di OSM (dicek 30 Okt 2026), jadi titik petanya tetap pusat desa.
    # Titik contoh sengaja tetap di pusat desa: Pulau Genting punya PLTS PLN nyata, dan status contoh
    # tidak boleh terlihat seperti kondisi PLTS itu.
    # Dua titik contoh di Karimunjawa untuk menguji tampilan status waspada dan normal.
    # Keberadaan dan kondisi PLTS di lokasi ini TIDAK diverifikasi; selalu tampil berlabel "contoh".
    Plts(
        id="karimunjawa-contoh", nama="PLTS contoh Karimunjawa", desa="Karimunjawa", kabupaten="Jepara", provinsi="Jawa Tengah",
        lat=-5.8796265, lon=110.4329073, kapasitas_kwp=250, baterai_kwh=600, jumlah_kk=520, jumlah_jiwa=None,
        koperasi="Koperasi Desa Merah Putih Karimunjawa (contoh)", status="waspada",
        alasan_status="Contoh: baterai diprediksi melemah dalam simulasi", tanggal_laporan=None, label_data="contoh",
        sumber="Data contoh purwarupa", sumber_lokasi=OSM, grup_uji=None,
    ),
    Plts(
        id="genting-contoh", nama="PLTS contoh Pulau Genting", desa="Pulau Genting", kabupaten="Jepara", provinsi="Jawa Tengah",
        lat=-5.8529734, lon=110.6038827, kapasitas_kwp=60, baterai_kwh=150, jumlah_kk=110, jumlah_jiwa=None,
        koperasi="Koperasi Desa Merah Putih Pulau Genting (contoh)", status="normal",
        alasan_status="Contoh: tidak ada anomali dalam simulasi", tanggal_laporan=None, label_data="contoh",
        sumber="Data contoh purwarupa", sumber_lokasi=OSM, grup_uji=None,
    ),
]


def validasi(daftar: list[Plts]) -> None:
    ids = [p.id for p in daftar]
    if len(ids) != len(set(ids)):
        raise ValueError("id PLTS ganda")
    for p in daftar:
        if p.status not in STATUS:
            raise ValueError(f"{p.id}: status tidak dikenal {p.status}")
        if p.label_data not in LABEL_DATA:
            raise ValueError(f"{p.id}: label_data tidak dikenal {p.label_data}")
        if p.grup_uji is not None and p.grup_uji not in GRUP_UJI:
            raise ValueError(f"{p.id}: grup_uji tidak dikenal {p.grup_uji}")
        if not (-11 <= p.lat <= 6 and 95 <= p.lon <= 141):
            raise ValueError(f"{p.id}: koordinat di luar Indonesia")
        # Titik PLTS harus dekat desanya; lebih jauh dari ~3 km berarti salah objek.
        if p.titik_plts and math.dist(p.titik_plts[:2], (p.lat, p.lon)) > 0.03:
            raise ValueError(f"{p.id}: titik PLTS terlalu jauh dari desa")
        if p.label_data == "laporan" and not p.sumber.startswith("https://"):
            raise ValueError(f"{p.id}: data laporan wajib bertautan sumber")
        if p.label_data == "contoh" and p.grup_uji is not None:
            raise ValueError(f"{p.id}: data contoh tidak boleh jadi desa uji")


def untuk_web(p: Plts) -> dict:
    """Baris plts.json: titik peta di PLTS bila poligonnya ada di OSM, selain itu pusat desa."""
    baris = asdict(p)
    del baris["titik_plts"]
    if p.titik_plts:
        baris["lat"], baris["lon"], objek = p.titik_plts
        baris["sumber_lokasi"] = f"OpenStreetMap {objek}, diakses 30 Okt 2026"
    baris["titik"] = "plts" if p.titik_plts else "desa"
    return baris


def desa_uji(daftar: list[Plts]) -> dict:
    return {
        "dikunci_pada": "2026-10-30",
        "catatan": "Ditetapkan sebelum data satelit dilihat. Perubahan wajib izin user dan dicatat (06-WORKFLOW).",
        "desa": [
            {"id": p.id, "nama": p.desa, "grup": p.grup_uji, "lat": p.lat, "lon": p.lon, "sumber": p.sumber}
            for p in daftar if p.grup_uji
        ],
    }


def kunci_desa_uji(isi: dict, path: Path = DESA_UJI_JSON) -> None:
    """Tulis daftar desa uji sekali; tolak bila sudah ada dengan isi berbeda."""
    teks = json.dumps(isi, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") != teks:
        raise RuntimeError(f"{path.name} sudah dikunci dan isinya berbeda; ubah hanya dengan izin user")
    path.write_text(teks, encoding="utf-8")


def main() -> None:
    validasi(PLTS)
    PLTS_JSON.parent.mkdir(parents=True, exist_ok=True)
    PLTS_JSON.write_text(json.dumps([untuk_web(p) for p in PLTS], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    kunci_desa_uji(desa_uji(PLTS))
    print(f"{len(PLTS)} PLTS ditulis ke {PLTS_JSON}; desa uji: {DESA_UJI_JSON}")


if __name__ == "__main__":
    main()
