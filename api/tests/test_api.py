import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app, dugaan_padam


@pytest.fixture
def klien(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "DATA", tmp_path)
    return TestClient(app)


def peringatan(klien, **ubah):
    return klien.post("/peringatan", json={"plts_id": "parang", "kategori": "padam", "pesan": "Lampu desa padam", **ubah})


def test_buat_peringatan_tersimpan_berstatus_terkirim(klien):
    r = peringatan(klien)

    assert r.status_code == 201
    assert r.json()["status"] == "terkirim"
    assert [p["id"] for p in klien.get("/peringatan", params={"plts_id": "parang"}).json()] == [r.json()["id"]]


@pytest.mark.parametrize("ubah", [{"plts_id": "tidak-ada"}, {"pesan": "x" * 501}, {"pesan": ""}, {"kategori": "rahasia"}])
def test_input_tidak_valid_ditolak_422(klien, ubah):
    assert peringatan(klien, **ubah).status_code == 422


def test_transisi_status_mengikuti_alur(klien):
    pid = peringatan(klien).json()["id"]

    assert klien.patch(f"/peringatan/{pid}", json={"status": "selesai"}).status_code == 409
    assert klien.patch(f"/peringatan/{pid}", json={"status": "dibaca"}).status_code == 200
    akhir = klien.patch(f"/peringatan/{pid}", json={"status": "selesai"}).json()
    assert [r["status"] for r in akhir["riwayat"]] == ["terkirim", "dibaca", "selesai"]
    assert klien.patch(f"/peringatan/{pid}", json={"status": "dibaca"}).status_code == 409


def test_ubah_peringatan_tidak_ada_404(klien):
    assert klien.patch("/peringatan/abc", json={"status": "dibaca"}).status_code == 404


@pytest.mark.parametrize("jawaban, padam", [
    (["tidak", "tidak"], True),
    ([None, "tidak"], True),
    (["tidak", "ya"], False),
    (["ya", "tidak"], False),
    (["tidak"], False),
])
def test_dugaan_padam_dua_malam_berturut(jawaban, padam):
    laporan = [{"tanggal": f"2026-10-{i + 1:02d}", "jawaban": j} for i, j in enumerate(jawaban)]

    assert dugaan_padam(laporan) is padam


def test_laporan_malam_menggantikan_jawaban_malam_yang_sama(klien):
    for jawaban in (None, "tidak"):
        klien.post("/laporan-malam", json={"plts_id": "parang", "tanggal": "2026-10-30", "jawaban": jawaban})
    klien.post("/laporan-malam", json={"plts_id": "parang", "tanggal": "2026-10-31", "jawaban": "tidak"})

    r = klien.get("/laporan-malam/parang").json()

    assert [x["jawaban"] for x in r["laporan"]] == ["tidak", "tidak"]
    assert r["dugaan_padam"] is True


def test_laporan_malam_plts_tidak_dikenal(klien):
    assert klien.get("/laporan-malam/tidak-ada").status_code == 404
    assert klien.post("/laporan-malam", json={"plts_id": "x", "tanggal": "2026-10-30", "jawaban": "ya"}).status_code == 422


def test_cors_menolak_origin_asing(klien):
    r = klien.options("/peringatan", headers={"Origin": "https://jahat.example", "Access-Control-Request-Method": "POST"})

    assert "access-control-allow-origin" not in r.headers


@pytest.mark.parametrize("nama", ["AMBANG_BATERAI"])
def test_ambang_sama_dengan_web(nama):
    ts = (Path(config.AKAR).parent / "web" / "src" / "lib" / "ambang.ts").read_text(encoding="utf-8")
    nilai = dict(re.findall(r"(\w+): (0\.\d+)", re.search(nama + r" = \{([^}]*)\}", ts).group(1)))

    assert {k: float(v) for k, v in nilai.items()} == getattr(config, nama)
