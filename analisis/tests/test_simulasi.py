import numpy as np
import pytest

from baterai import parameter as P
from baterai.simulasi import laju_kalender, laju_siklus, simulasi, tambah_pangkat, tambah_sigmoid


@pytest.fixture(scope="module")
def data():
    return simulasi(150, seed=3)


def test_kapasitas_tidak_pernah_naik(data):
    selisih = data.sort_values(["baterai", "hari"]).groupby("baterai").soh.diff().dropna()

    assert (selisih <= 1e-12).all()


def test_baterai_berhenti_dicatat_setelah_gagal(data):
    gagal = data[data.hari_gagal >= 0]

    assert (gagal.hari <= gagal.hari_gagal).all()
    assert (data[data.sebab_gagal == "aus"].groupby("baterai").soh.min() <= P.SOH_AKHIR_UMUR + 0.01).all()


def test_simulasi_dapat_diulang_dengan_seed_sama():
    a = simulasi(20, seed=9)
    b = simulasi(20, seed=9)

    assert a.equals(b)


def test_suhu_lebih_tinggi_mempercepat_penuaan_kalender():
    dod = np.array([0.7, 0.7])
    q1, _ = laju_kalender(np.array([300.0, 310.0]), dod)

    assert q1[1] > q1[0]


def test_dod_lebih_dalam_mempercepat_penuaan_siklus():
    laju = laju_siklus(np.array([0.4, 0.9]), np.array([0.1, 0.1]))

    assert laju[1] > laju[0]


def test_state_nol_dengan_langkah_nol_tidak_berubah():
    nol = np.zeros(1)

    assert tambah_pangkat(nol, nol, np.ones(1), P.Q6)[0] == 0
    assert tambah_sigmoid(nol, 1.0, np.full(1, 0.1), P.Q2, np.full(1, 0.5))[0] > 0


def test_kalibrasi_median_umur_sekitar_10_tahun(data):
    umur = data.groupby("baterai").hari_gagal.first()
    gagal = umur[umur >= 0] / 365

    assert 7 <= gagal.median() <= 13
    porsi_mendadak = (data.groupby("baterai").sebab_gagal.first() == "mendadak").sum() / (umur >= 0).sum()
    assert 0.05 <= porsi_mendadak <= 0.4
