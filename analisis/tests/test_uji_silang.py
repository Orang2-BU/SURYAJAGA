import io
import os
import pickle

import numpy as np
import pandas as pd
import pytest

from baterai.uji_silang import _UnpicklerTerbatas, kapasitas_siklus, ke_catatan_mingguan


def test_kapasitas_dari_integrasi_arus_pengosongan():
    # 1 jam pengosongan 1.100 mA = 1,1 Ah; arus pengisian (positif) diabaikan.
    waktu = np.arange(0, 7201, 1.0)
    arus = np.where(waktu <= 3600, 500.0, -1100.0)
    data = {1: pd.DataFrame({"Current (mA)": arus, "Time (s)": waktu})}

    assert kapasitas_siklus(data)[0][1] == pytest.approx(1.1, rel=1e-3)


def test_catatan_berhenti_di_akhir_umur():
    siklus = np.arange(1, 141)
    kap = pd.DataFrame({"sel": "1-1", "siklus": siklus, "kapasitas_ah": 1.1 * (1 - siklus / 500)})

    catatan = ke_catatan_mingguan(kap)

    gagal = catatan.hari_gagal.iloc[0]
    assert gagal > 0 and catatan.hari.max() <= gagal
    assert (catatan.sebab_gagal == "aus").all()


def test_sel_yang_belum_aus_tidak_diberi_tanggal_gagal():
    kap = pd.DataFrame({"sel": "2-2", "siklus": np.arange(1, 50), "kapasitas_ah": 1.05})

    assert (ke_catatan_mingguan(kap).hari_gagal == -1).all()


def test_unpickler_menolak_kelas_berbahaya():
    class Jahat:
        def __reduce__(self):
            return (os.system, ("echo diretas",))

    with pytest.raises(pickle.UnpicklingError):
        _UnpicklerTerbatas(io.BytesIO(pickle.dumps(Jahat()))).load()


def test_unpickler_mengizinkan_dataframe():
    df = pd.DataFrame({"Current (mA)": [1.0, -2.0]})

    hasil = _UnpicklerTerbatas(io.BytesIO(pickle.dumps({"a": df}))).load()

    pd.testing.assert_frame_equal(hasil["a"], df)
