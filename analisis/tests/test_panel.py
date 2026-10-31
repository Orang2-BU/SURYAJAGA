import numpy as np

from panel.analisis import lebarkan, ndvi, nilai_adegan, status


def tahun(nilai):
    return [{"tahun": 2017 + i, "ndvi_dalam": v} for i, v in enumerate(nilai)]


def test_status_naik_turun_stabil_dan_data_kurang():
    assert status(tahun([0.1, None, 0.3])) == ("naik", 0.2)
    assert status(tahun([0.6, 0.2])) == ("turun", -0.4)
    assert status(tahun([0.2, 0.3])) == ("stabil", 0.1)
    assert status(tahun([None, 0.3])) == ("data_kurang", None)


def test_ndvi_rumus_standar_dan_aman_dari_nol():
    assert ndvi(np.array([1000, 0]), np.array([3000, 0])).tolist()[0] == 0.5
    assert np.isnan(ndvi(np.array([0]), np.array([0]))[0])


def test_lebarkan_satu_piksel_ke_empat_arah():
    m = np.zeros((3, 3), bool)
    m[1, 1] = True

    assert lebarkan(m, 1).sum() == 5


def test_adegan_berawan_ditolak():
    dalam = np.zeros((5, 5), bool)
    dalam[1:4, 1:4] = True
    scl = np.full((5, 5), 9)  # awan tebal

    assert nilai_adegan(np.ones((5, 5)), np.ones((5, 5)), scl, dalam) is None


def test_adegan_cerah_membedakan_panel_dan_sekitar():
    dalam = np.zeros((9, 9), bool)
    dalam[3:6, 3:6] = True
    merah = np.where(dalam, 1000, 500)
    nir = np.where(dalam, 1200, 3000)  # panel: NDVI rendah, vegetasi sekitar: tinggi

    v = nilai_adegan(merah, nir, np.full((9, 9), 4), dalam)

    assert v["dalam"] < 0.1 < 0.5 < v["sekitar"]


def test_jendela_20m_menutupi_area_yang_sama_dengan_10m():
    from rasterio.transform import Affine
    from rasterio.windows import Window, bounds

    from panel.analisis import jendela_20m

    tf10 = Affine(10, 0, 300000, 0, -10, 9500000)
    tf20 = Affine(20, 0, 300000, 0, -20, 9500000)
    win = Window(1000, 4000, 12, 8)

    w20 = jendela_20m(win, tf10, tf20)

    assert bounds(w20, tf20) == bounds(win, tf10)
    assert (w20.col_off, w20.row_off, w20.width, w20.height) == (500, 2000, 6, 4)
