import json

from ekspor_web import TUJUAN, ekspor


def test_berkas_web_sama_dengan_model_dan_config_saat_ini():
    """Gagal bila model, panduan, atau config berubah tanpa menjalankan ulang `python ekspor_web.py`."""
    asisten, aturan, uji = ekspor()

    assert json.loads((TUJUAN / "asisten.json").read_text(encoding="utf-8")) == asisten
    assert json.loads((TUJUAN / "asisten-uji.json").read_text(encoding="utf-8")) == uji
    assert json.loads((TUJUAN.parent / "lib" / "aturan.json").read_text(encoding="utf-8")) == aturan
