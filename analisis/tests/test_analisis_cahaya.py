from cahaya_malam.analisis import SINYAL_LEMAH, TERDETEKSI, TIDAK_TERDETEKSI, deret_anomali, nilai_desa


def bulan(nilai: list[float | None], mulai_tahun: int = 2015) -> list[dict]:
    return [{"bulan": f"{mulai_tahun + i // 12}-{i % 12 + 1:02d}", "radiansi": v, "piksel_valid": 25} for i, v in enumerate(nilai)]


def test_padam_enam_bulan_berturut_terdeteksi():
    deret = bulan([4.0] * 24 + [4.1] * 6 + [0.3] * 7 + [None] + [0.2] * 2)

    hasil = nilai_desa(deret, [])

    assert hasil["status"] == TERDETEKSI
    assert hasil["bulan_anomali_berturut"] == 9  # bulan tanpa data tidak memutus deret
    assert hasil["anomali_mulai"] == "2017-07"


def test_turun_singkat_tidak_terdeteksi():
    hasil = nilai_desa(bulan([4.0] * 24 + [0.5] * 5 + [4.0] * 10), [])

    assert hasil["status"] == TIDAK_TERDETEKSI
    assert hasil["bulan_anomali_berturut"] == 5


def test_desa_redup_dilaporkan_sinyal_lemah_bukan_dibuang():
    hasil = nilai_desa(bulan([0.2] * 24 + [0.0] * 12), [{"tanggal": "2026-10-01", "radiansi": 0.0, "piksel_valid": 25}])

    assert hasil["status"] == SINYAL_LEMAH
    assert hasil["malam_gelap"] is None
    assert hasil["malam_cerah"] == 1


def test_malam_gelap_hanya_dari_malam_cerah():
    harian = [{"tanggal": f"2026-10-{i:02d}", "radiansi": v, "piksel_valid": 25} for i, v in enumerate([0.1, 3.9, None, 0.4], 1)]

    hasil = nilai_desa(bulan([4.0] * 24), harian)

    assert (hasil["malam_cerah"], hasil["malam_gelap"]) == (3, 2)


def test_deret_anomali_mengabaikan_periode_dasar():
    assert deret_anomali(bulan([0.1] * 24 + [4.0] * 3), dasar=4.0) == (0, None)
