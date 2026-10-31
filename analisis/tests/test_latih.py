import numpy as np
import pandas as pd
import pytest

from baterai import parameter as P
from baterai.latih import buat_fitur, buat_label, metrik_klasifikasi, pilih_contoh


def catatan(n_minggu: int = 80, hari_gagal: int = -1) -> pd.DataFrame:
    hari = np.arange(n_minggu) * 7 + 6
    return pd.DataFrame({
        "baterai": 0,
        "hari": hari,
        "soh_bms": 1 - 0.0005 * np.arange(n_minggu),
        "hari_gagal": hari_gagal,
        "sebab_gagal": "aus" if hari_gagal >= 0 else "",
    })


def test_fitur_tidak_memakai_data_masa_depan():
    df = catatan()
    ubah = df.copy()
    ubah.loc[60:, "soh_bms"] = 0.5  # masa depan diubah drastis

    a, b = buat_fitur(df), buat_fitur(ubah)

    pd.testing.assert_frame_equal(a.iloc[:60], b.iloc[:60])


def test_tren_mengikuti_kemiringan_kapasitas():
    fitur = buat_fitur(catatan())

    assert fitur.tren_soh.iloc[-1] == pytest.approx(-0.0005, rel=1e-6)


def test_proyeksi_menghitung_minggu_sampai_akhir_umur():
    fitur = buat_fitur(catatan())
    akhir = fitur.iloc[-1]

    assert akhir.proyeksi_minggu == pytest.approx((akhir.soh_bms - P.SOH_AKHIR_UMUR) / 0.0005, rel=1e-6)


def test_label_positif_hanya_dalam_horizon():
    df = catatan(hari_gagal=6 + 79 * 7)
    label = buat_label(df)
    sisa = df.hari_gagal - df.hari

    assert (label.gagal_horizon == (sisa <= P.HORIZON_HARI)).all()
    assert label.gagal_horizon.iloc[0] == 0 and label.gagal_horizon.iloc[-1] == 1


def test_baterai_tanpa_kegagalan_tidak_pernah_positif():
    assert buat_label(catatan()).gagal_horizon.sum() == 0


def test_metrik_dipisah_per_sebab_kegagalan():
    y = np.array([1, 1, 0, 0])
    p = np.array([0.95, 0.1, 0.2, 0.8])
    sebab = np.array(["aus", "mendadak", "", ""])

    baris = {b["ambang"]: b for b in metrik_klasifikasi(y, p, sebab)}

    assert baris[0.7]["recall_aus"] == 1.0
    assert baris[0.7]["recall_mendadak"] == 0.0
    assert baris[0.7]["presisi"] == 0.5


def test_pilih_contoh_gagal_bila_tidak_ada_kandidat():
    with pytest.raises(RuntimeError):
        pilih_contoh(np.array([], dtype=bool))
