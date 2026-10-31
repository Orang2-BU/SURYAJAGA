import numpy as np
import pytest

from lokasi import parameter as P
from lokasi.estimasi import (biaya_per_kwh, crf, faktor_logistik, genset_per_kwh, kelompokkan, keputusan,
                             risiko, sampel_capex, ukur_sistem)


def test_piksel_berdekatan_digabung_yang_jauh_dipisah():
    larik = np.zeros((20, 20))
    larik[2, 2] = larik[2, 4] = 10     # berjarak 2 piksel: satu permukiman
    larik[15, 15] = 10                 # jauh: permukiman lain

    label, _ = kelompokkan(larik, jarak=2)

    assert label[2, 2] == label[2, 4] != label[15, 15]
    assert label[0, 0] == 0


def test_ukuran_sistem_mengikuti_kebutuhan_dan_radiasi():
    s = ukur_sistem(kk=100, psh=5.0)

    assert s["kebutuhan_kwh_hari"] == pytest.approx(100 * P.KWH_PER_KK_HARI)
    assert s["panel_kwp"] == pytest.approx(150 / (5.0 * P.PR))
    assert s["baterai_kwh"] == pytest.approx(150 * P.OTONOMI_HARI / P.DOD)
    assert s["beban_puncak_kw"] == pytest.approx(150 / 24 / P.FAKTOR_BEBAN)


def test_faktor_logistik_naik_dengan_waktu_tempuh_dan_dibatasi():
    assert faktor_logistik(None) == 1
    assert faktor_logistik(10) == pytest.approx(1 + 10 * P.LOGISTIK_PER_JAM)
    assert faktor_logistik(1000) == pytest.approx(1 + P.LOGISTIK_MAKS)


def test_median_anggaran_sesuai_median_esmap():
    capex = sampel_capex(beban_puncak_kw=10, jam=0, rng=np.random.default_rng(1))

    assert np.median(capex) == pytest.approx(10 * P.CAPEX_MEDIAN_USD_KW * P.KURS, rel=0.03)
    assert np.mean(capex) == pytest.approx(10 * P.CAPEX_RATA_USD_KW * P.KURS, rel=0.03)


def test_biaya_per_kwh_turun_bila_modal_turun():
    s = ukur_sistem(kk=100, psh=5.5)
    mahal, murah = biaya_per_kwh(np.array([2e9, 1e9]), 100, s)

    assert murah < mahal
    assert 0 < crf() < 1
    assert genset_per_kwh() == pytest.approx(P.SFC_L_KWH * P.HARGA_SOLAR)


@pytest.mark.parametrize("jam, kk, jarak, tingkat", [
    (3, 200, None, "rendah"),
    (8, 200, None, "sedang"),
    (3, 30, None, "sedang"),
    (15, 200, None, "sedang"),
    (8, 30, None, "tinggi"),
    (15, 30, None, "tinggi"),
    (3, 200, 2.0, "sedang"),
])
def test_aturan_risiko(jam, kk, jarak, tingkat):
    hasil, alasan = risiko(jam, kk, jarak)

    assert hasil == tingkat
    assert (len(alasan) > 0) == (tingkat != "rendah")


def test_keputusan_dari_risiko():
    assert [keputusan(t) for t in ("rendah", "sedang", "tinggi")] == ["prioritas", "layak_dengan_pendampingan", "perlu_skema_perawatan"]
