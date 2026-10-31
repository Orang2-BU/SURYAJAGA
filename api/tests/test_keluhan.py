import pytest
from fastapi.testclient import TestClient

from app import keluhan
from app.main import app
from eval.keluhan import evaluasi, varian

klien = TestClient(app)


def palsu(monkeypatch, kategori: str, p: float, kedua: str = "lainnya"):
    monkeypatch.setattr(keluhan, "klasifikasi", lambda _: {"kategori": kategori, "p": p, "kandidat_kedua": {"kategori": kedua, "p": 1 - p}})


@pytest.mark.parametrize("p, keputusan", [(0.8, "panduan"), (0.79, "konfirmasi"), (0.5, "konfirmasi"), (0.49, "teknisi")])
def test_tiga_cabang_ambang(monkeypatch, p, keputusan):
    palsu(monkeypatch, "panel", p)

    r = klien.post("/keluhan", json={"teks": "panel kotor"}).json()

    assert r["keputusan"] == keputusan
    assert ("topik" in r) is (keputusan == "panduan")
    assert ("pilihan" in r) is (keputusan == "konfirmasi")


def test_konfirmasi_menawarkan_dua_kandidat(monkeypatch):
    palsu(monkeypatch, "baterai", 0.6, kedua="beban")

    r = klien.post("/keluhan", json={"teks": "listrik malam cepat habis"}).json()

    assert [x["kategori"] for x in r["pilihan"]] == ["baterai", "beban"]


def test_kategori_wajib_teknisi_selalu_ke_teknisi_walau_yakin(monkeypatch):
    palsu(monkeypatch, "kabel", 0.99)

    r = klien.post("/keluhan", json={"teks": "kabel putus"}).json()

    assert (r["keputusan"], r["alasan"]) == ("teknisi", "wajib_teknisi")
    assert r["topik"]["wajib_teknisi"] is True


@pytest.mark.parametrize("teks", ["ada ASAP dari inverter", "baterai menggembung", "kesetrum pas pegang panel"])
def test_kata_bahaya_selalu_ke_teknisi(monkeypatch, teks):
    palsu(monkeypatch, "panel", 0.99)

    r = klien.post("/keluhan", json={"teks": teks}).json()

    assert (r["keputusan"], r["alasan"]) == ("teknisi", "bahaya")


def test_kata_bahaya_utuh_bukan_potongan_kata():
    assert not keluhan.ada_kata_bahaya("kapasitas baterai turun")


@pytest.mark.parametrize("teks", ["", "x" * 501])
def test_teks_tidak_valid_ditolak(teks):
    assert klien.post("/keluhan", json={"teks": teks}).status_code == 422


def test_model_asli_mengenali_keluhan_jelas():
    r = klien.post("/keluhan", json={"teks": "Inverter mati total, layarnya gelap!"}).json()

    assert r["kategori"] == "inverter"


def test_robustness_huruf_dan_tanda_baca():
    asli = keluhan.klasifikasi("panel berdebu kena kotoran burung")["kategori"]

    assert all(keluhan.klasifikasi(v)["kategori"] == asli for v in varian("panel berdebu kena kotoran burung"))


def test_panduan_lengkap_untuk_setiap_kategori_model():
    kategori = {t["kategori"] for t in klien.get("/panduan").json()["topik"]}

    assert kategori == set(keluhan.model().classes_)
    assert klien.get("/panduan/tidak-ada").status_code == 404


def test_eval_memenuhi_target_akurasi():
    h = evaluasi()

    assert h["n"] == 60
    assert h["akurasi"] >= 0.85
    assert h["robustness_stabil"] == "60/60"
