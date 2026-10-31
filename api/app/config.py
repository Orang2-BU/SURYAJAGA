"""Konfigurasi dan ambang API (03-ARCHITECTURE §5). Ambang baterai harus sama dengan web/src/lib/ambang.ts."""

import os
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("SURYAJAGA_DATA", AKAR / "data"))
PLTS_JSON = AKAR.parent / "web" / "public" / "data" / "plts.json"

# Origin web yang boleh memanggil API; dipisah koma, contoh "http://localhost:3000,https://suryajaga.vercel.app".
ASAL_WEB = [a.strip() for a in os.environ.get("SURYAJAGA_ASAL_WEB", "http://localhost:3000").split(",") if a.strip()]

# Ambang awal dari data simulasi; wajib dikalibrasi dengan data lapangan (uji silang HUST, Ma dkk., 2022).
AMBANG_BATERAI = {"kritis": 0.9, "waspada": 0.7, "perlu_dicek": 0.5}

# Laporan malam (F15): jumlah malam berturut "tidak" atau tanpa balasan yang menandai dugaan padam. [asumsi]
MALAM_BERTURUT_PADAM = 2

# Keluhan operator (F5), hanya di API (web menampilkan keputusan, tidak menghitung ulang): p ≥ panduan → langkah panduan; konfirmasi ≤ p < panduan → tanya dua kandidat; di bawahnya → teknisi.
AMBANG_KELUHAN = {"panduan": 0.8, "konfirmasi": 0.5}
# Kata yang menandai bahaya listrik/api: keluhan apa pun yang memuatnya langsung diteruskan ke teknisi.
KATA_BAHAYA = {"asap", "berasap", "terbakar", "kebakaran", "api", "percikan", "kesetrum", "nyetrum", "setrum",
               "gosong", "meleleh", "meledak", "bengkak", "menggembung", "hangus"}
STATIS = AKAR / "data"  # berkas tetap (data latih, panduan); bukan DATA yang ditulis saat berjalan
KELUHAN_LATIH = STATIS / "keluhan_latih.csv"
PANDUAN_JSON = STATIS / "panduan.json"

PESAN_MAKS = 500
SIMPAN_MAKS = 5000  # batas baris per berkas agar berkas demo tidak tumbuh tanpa batas
