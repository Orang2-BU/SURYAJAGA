"""API SuryaJaga: peringatan (F4), asisten keluhan (F5), dan laporan malam operator (F15). Penyimpanan berkas JSON untuk demo (03-ARCHITECTURE)."""

import json
import threading
import uuid
from datetime import date, datetime, timezone
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AfterValidator, BaseModel, Field

from app import config, keluhan

app = FastAPI(title="SuryaJaga API")
app.add_middleware(CORSMiddleware, allow_origins=config.ASAL_WEB, allow_methods=["GET", "POST", "PATCH"], allow_headers=["Content-Type"])

Kategori = Literal["baterai", "padam", "panel", "lainnya"]
StatusPeringatan = Literal["terkirim", "dibaca", "ditangani", "selesai", "eskalasi"]
Jawaban = Literal["ya", "tidak"]

# Transisi yang boleh; "selesai" final. Eskalasi boleh kembali ditangani setelah teknisi datang.
TRANSISI: dict[str, set[str]] = {
    "terkirim": {"dibaca", "eskalasi"},
    "dibaca": {"ditangani", "eskalasi", "selesai"},
    "ditangani": {"selesai", "eskalasi"},
    "eskalasi": {"ditangani", "selesai"},
    "selesai": set(),
}

_kunci = threading.Lock()


def id_plts() -> set[str]:
    return {p["id"] for p in json.loads(config.PLTS_JSON.read_text(encoding="utf-8"))}


def _baca(nama: str) -> list[dict]:
    path = config.DATA / nama
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def _tulis(nama: str, isi: list[dict]) -> None:
    config.DATA.mkdir(parents=True, exist_ok=True)
    sementara = config.DATA / f"{nama}.tmp"
    sementara.write_text(json.dumps(isi[-config.SIMPAN_MAKS:], ensure_ascii=False, indent=1), encoding="utf-8")
    sementara.replace(config.DATA / nama)  # ganti atomik: berkas tidak pernah setengah tertulis


def _sekarang() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _plts_dikenal(v: str) -> str:
    if v not in id_plts():
        raise ValueError("PLTS tidak dikenal")
    return v


IdPlts = Annotated[str, Field(min_length=1, max_length=64), AfterValidator(_plts_dikenal)]


class PeringatanBaru(BaseModel):
    plts_id: IdPlts
    kategori: Kategori
    pesan: str = Field(min_length=1, max_length=config.PESAN_MAKS)


class Keluhan(BaseModel):
    teks: str = Field(min_length=1, max_length=config.PESAN_MAKS)


class UbahStatus(BaseModel):
    status: StatusPeringatan


class LaporanMalamBaru(BaseModel):
    plts_id: IdPlts
    tanggal: date
    jawaban: Jawaban | None  # None = pertanyaan terkirim tetapi belum dibalas


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/peringatan", status_code=201)
def buat_peringatan(data: PeringatanBaru) -> dict:
    baru = {"id": uuid.uuid4().hex[:12], **data.model_dump(), "status": "terkirim", "dibuat": _sekarang()}
    baru["riwayat"] = [{"status": "terkirim", "waktu": baru["dibuat"]}]
    with _kunci:
        _tulis("peringatan.json", [*_baca("peringatan.json"), baru])
    return baru


@app.get("/peringatan")
def daftar_peringatan(plts_id: str | None = None) -> list[dict]:
    semua = _baca("peringatan.json")
    return sorted((p for p in semua if plts_id is None or p["plts_id"] == plts_id), key=lambda p: p["dibuat"], reverse=True)


@app.patch("/peringatan/{peringatan_id}")
def ubah_peringatan(peringatan_id: str, data: UbahStatus) -> dict:
    with _kunci:
        semua = _baca("peringatan.json")
        p = next((x for x in semua if x["id"] == peringatan_id), None)
        if p is None:
            raise HTTPException(404, "Peringatan tidak ditemukan")
        if data.status not in TRANSISI[p["status"]]:
            raise HTTPException(409, f"Status {p['status']} tidak bisa diubah ke {data.status}")
        p["status"] = data.status
        p["riwayat"].append({"status": data.status, "waktu": _sekarang()})
        _tulis("peringatan.json", semua)
    return p


def dugaan_padam(laporan: list[dict]) -> bool:
    """True bila N malam terakhir berturut dijawab "tidak" atau tidak dibalas (F15)."""
    terakhir = sorted(laporan, key=lambda x: x["tanggal"])[-config.MALAM_BERTURUT_PADAM:]
    return len(terakhir) == config.MALAM_BERTURUT_PADAM and all(x["jawaban"] != "ya" for x in terakhir)


@app.post("/laporan-malam", status_code=201)
def kirim_laporan_malam(data: LaporanMalamBaru) -> dict:
    baru = {**data.model_dump(mode="json"), "diterima": _sekarang()}
    with _kunci:
        # Satu laporan per PLTS per malam: jawaban baru menggantikan yang lama.
        lain = [x for x in _baca("laporan_malam.json") if (x["plts_id"], x["tanggal"]) != (baru["plts_id"], baru["tanggal"])]
        _tulis("laporan_malam.json", [*lain, baru])
    return baru


@app.get("/laporan-malam/{plts_id}")
def ringkasan_laporan_malam(plts_id: str) -> dict:
    if plts_id not in id_plts():
        raise HTTPException(404, "PLTS tidak dikenal")
    milik = sorted((x for x in _baca("laporan_malam.json") if x["plts_id"] == plts_id), key=lambda x: x["tanggal"])
    return {"plts_id": plts_id, "dugaan_padam": dugaan_padam(milik), "malam_berturut": config.MALAM_BERTURUT_PADAM, "laporan": milik[-30:]}


@app.post("/keluhan")
def klasifikasi_keluhan(data: Keluhan) -> dict:
    hasil = keluhan.klasifikasi(data.teks)
    keputusan, alasan = keluhan.putuskan(data.teks, hasil)
    jawab = {**hasil, "keputusan": keputusan, "alasan": alasan}
    if keputusan == "panduan" or alasan == "wajib_teknisi":
        jawab["topik"] = keluhan.topik(hasil["kategori"])
    if keputusan == "konfirmasi":
        jawab["pilihan"] = [{"kategori": k, "label": keluhan.topik(k)["label"]} for k in (hasil["kategori"], hasil["kandidat_kedua"]["kategori"])]
    return jawab


@app.get("/panduan")
def semua_panduan() -> dict:
    return keluhan.panduan()


@app.get("/panduan/{kategori}")
def panduan_kategori(kategori: str) -> dict:
    t = next((t for t in keluhan.panduan()["topik"] if t["kategori"] == kategori), None)
    if t is None:
        raise HTTPException(404, "Kategori tidak dikenal")
    return t
