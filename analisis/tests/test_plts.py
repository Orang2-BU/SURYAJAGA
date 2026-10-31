from dataclasses import replace

import pytest

from plts import PLTS, desa_uji, kunci_desa_uji, untuk_web, validasi


def test_data_plts_lolos_validasi():
    validasi(PLTS)


def test_desa_uji_berisi_tiga_mangkrak_dan_dua_pembanding():
    grup = [d["grup"] for d in desa_uji(PLTS)["desa"]]

    assert grup.count("mangkrak") == 3
    assert grup.count("pembanding") == 2


def test_data_contoh_tidak_masuk_desa_uji():
    ids = {d["id"] for d in desa_uji(PLTS)["desa"]}

    assert not any(p.id in ids for p in PLTS if p.label_data == "contoh")


def test_validasi_menolak_id_ganda():
    with pytest.raises(ValueError, match="ganda"):
        validasi([PLTS[0], PLTS[0]])


def test_validasi_menolak_laporan_tanpa_tautan():
    tanpa_tautan = replace(PLTS[0], sumber="kata orang")

    with pytest.raises(ValueError, match="sumber"):
        validasi([tanpa_tautan])


def test_kunci_desa_uji_menolak_isi_berbeda(tmp_path):
    path = tmp_path / "desa_uji.json"
    kunci_desa_uji({"desa": [1]}, path)

    kunci_desa_uji({"desa": [1]}, path)  # isi sama: boleh ditulis ulang
    with pytest.raises(RuntimeError, match="dikunci"):
        kunci_desa_uji({"desa": [2]}, path)


def test_peta_memakai_titik_plts_tetapi_desa_uji_tetap_pusat_desa():
    parang = next(p for p in PLTS if p.id == "parang")
    baris = untuk_web(parang)
    uji = next(d for d in desa_uji(PLTS)["desa"] if d["id"] == "parang")

    assert (baris["lat"], baris["lon"], baris["titik"]) == (*parang.titik_plts[:2], "plts")
    assert (uji["lat"], uji["lon"]) == (parang.lat, parang.lon)
    assert "titik_plts" not in baris


def test_validasi_menolak_titik_plts_jauh_dari_desa():
    salah = replace(PLTS[0], titik_plts=(PLTS[0].lat + 0.5, PLTS[0].lon, "way 1"))

    with pytest.raises(ValueError, match="terlalu jauh"):
        validasi([salah])
