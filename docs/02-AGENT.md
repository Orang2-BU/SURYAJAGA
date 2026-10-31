# 02 — AGENT: Instruksi untuk AI

> Konvensi yang harus diikuti AI (dan developer manusia) di projek ini.
> Uji kualitas: developer lain harus bisa memahami isi file ini tanpa penjelasan tambahan.

## 1. Konteks Singkat
- **Aplikasi:** SuryaJaga — sistem peringatan dini berbasis AI agar PLTS desa (program PLTS Koperasi Desa Merah Putih) tidak mangkrak.
- **Stack:** Next.js App Router + TypeScript + Tailwind v4 (template Soft Op) · FastAPI + scikit-learn · skrip analisis Python yang menghasilkan JSON statis.

## 2. Struktur Folder
```
SURYAJAGAT/
├─ docs/                    # 00-08, AI-PRIMITIVES (sumber kebenaran)
├─ web/                     # Next.js
│  ├─ src/app/              # rute; (app)/ = shell pengawas, operator/ = tampilan pesan
│  ├─ src/components/shell/ # dari starter Soft Op (jangan dibangun ulang)
│  ├─ src/components/ui/    # Icon, Badge, Modal dari starter
│  ├─ src/components/<fitur>/  # peta/, grafik/, percakapan/
│  ├─ src/lib/              # nav.ts, ambang.ts, data.ts (pemuat JSON), api.ts
│  ├─ src/styles/theme.css  # hasil designmd export (jangan diedit tangan)
│  └─ public/data/          # JSON hasil analisis (dihasilkan skrip, jangan diedit tangan)
├─ api/                     # FastAPI
│  ├─ app/                  # main.py, config.py (ambang), rute peringatan & klasifikasi
│  ├─ data/                 # panduan.json, keluhan_latih.csv (tetap); peringatan.json, laporan_malam.json (demo)
│  ├─ eval/                 # keluhan.csv (60, dikunci) + keluhan.py + hasil.json
│  └─ tests/
└─ analisis/                # skrip offline
   ├─ baterai/              # parameter.py, simulasi.py, latih.py, evaluasi.py
   ├─ cahaya_malam/         # desa_uji.json, unduh.py, analisis.py
   ├─ lokasi/               # skor.py, config bobot
   ├─ data/                 # data mentah (.gitignore bila besar)
   └─ tests/
```
- **Rute halaman:** mengikuti 01-PRD §5a; nama rute bahasa Indonesia, huruf kecil, tanda hubung (`/bukti/cahaya-malam`). Registry halaman di `web/src/lib/nav.ts` dengan id P1-P17.

## 3. Gaya Koding
- **Penamaan:** TS: variabel/fungsi camelCase, komponen PascalCase, file kebab-case. Python: snake_case, konstanta UPPER_SNAKE. Nama domain dalam bahasa Indonesia (`plts`, `peringatan`, `skorRisiko`).
- **Prinsip:** fungsi kecil & satu tanggung jawab; solusi paling sederhana yang benar; standard library/fitur framework sebelum dependency.
- **Typing:** TS `strict`, tanpa `any`; Python type hints + Pydantic di batas API.
- **Data:** web hanya membaca `public/data/*.json` lewat `src/lib/data.ts` yang memvalidasi bentuknya; skrip analisis satu-satunya penulis JSON tersebut.
- **Ambang AI:** hanya di `api/app/config.py` dan `web/src/lib/ambang.ts`; ada test bahwa keduanya sama.
- **Error handling:** web menampilkan state error/kosong yang dirancang; API mengembalikan HTTP status + pesan bahasa Indonesia; tidak ada error ditelan diam-diam.
- **Formatter / linter:** ESLint (bawaan Next) + Prettier default; Ruff untuk Python. Config di repo adalah sumber kebenaran.

## 4. Gaya Komentar
- Komentar menjelaskan **kenapa**, bukan **apa**.
- Bahasa komentar: Indonesia.
- Setiap parameter simulator dan ambang yang berasal dari literatur diberi komentar sumbernya (penulis, tahun).
- Tidak ada kode yang di-comment-out.

## 5. Testing
- **Framework:** Vitest (web), Pytest (api, analisis).
- **Lokasi & penamaan:** `*.test.ts` di samping file; `tests/test_*.py`.
- **Format:** Arrange–Act–Assert; satu perilaku per test.
- **Wajib ditest:** aturan ambang + eskalasi, deteksi anomali, skor lokasi, simulator baterai (sifat monoton kapasitas), pemuat data web, `nav.ts`.

## 6. Dependency
- Web runtime: hanya `next`, `react`, `lucide-react`, `maplibre-gl`. Tambahan harus izin.
- Python: `fastapi`, `uvicorn`, `pydantic`, `scikit-learn`, `joblib` (api); `numpy`, `pandas`, `scikit-learn`, `rasterio`, `blackmarblepy` (analisis). Tambahan harus izin.
- Package manager: npm; pip + venv.

## 7. Git
- **Format commit:** Conventional Commits (`feat:`, `fix:`, `data:`, `docs:`), bahasa Indonesia.
- **Branch:** `main` + branch per task (`t9-peta-pemantauan`).
- Data mentah besar dan `.env` tidak di-commit.

## 8. Lain-lain
- Bahasa UI: Indonesia, tanpa em-dash.
- Semua data simulasi/contoh diberi label di UI.
- Atribusi OpenStreetMap dan sumber data tampil di peta dan P11.
