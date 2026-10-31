import numpy as np

from cahaya_malam.unduh import ringkas, ubin, valid_bulanan, valid_harian


def test_ubin_parang_sesuai_larik_lat_lon_berkas_nasa():
    # Dicek terhadap larik lat/lon VNP46A2 h29v09: pusat piksel (1378, 58) = (-5.74167, 110.24167).
    assert ubin(-5.7440683, 110.2424772) == ("h29v09", 1378, 58)


def test_ubin_belahan_utara():
    assert ubin(0.6817473, 104.2841202)[0] == "h28v08"


def test_ringkas_tanpa_piksel_valid_mengembalikan_none():
    assert ringkas(np.ones((5, 5)), np.zeros((5, 5), bool)) == (None, 0, 25)


def test_ringkas_merata_piksel_valid_saja():
    rad = np.array([[1.0, 3.0], [100.0, -999.9]])
    valid = np.array([[True, True], [False, False]])

    assert ringkas(rad, valid) == (2.0, 2, 4)


def test_valid_harian_membuang_awan_dan_kualitas_buruk():
    mutu = np.array([0, 1, 2, 0, 255])
    awan = np.array([0, 1 << 6, 0, 3 << 6, 0], dtype=np.uint16)
    rad = np.array([1.0, 1.0, 1.0, 1.0, -999.9])

    assert valid_harian(mutu, awan, rad).tolist() == [True, True, False, False, False]


def test_valid_bulanan_membuang_isian_celah():
    assert valid_bulanan(np.array([0, 1, 2, 255]), np.array([1.0, 1.0, 1.0, 1.0])).tolist() == [True, True, False, False]
