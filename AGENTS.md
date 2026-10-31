# SuryaJaga

> Instruksi untuk semua AI coding assistant. Dibuat oleh skill setup-project-00 (30 Okt 2026).
> Sumber kebenaran ada di `docs/`. File ini ringkasannya.

## WAJIB sebelum ngoding pertama kali
Jika kamu AI yang belum pernah bekerja di projek ini, baca **seluruh** file di `docs/` (00 sampai 08, yang ada, plus `AI-PRIMITIVES.md`) secara berurutan satu kali, lalu ikuti aturannya. Setelah itu cukup rujuk file ini.

## Aplikasi
Purwarupa TKT 3 untuk Seno Hackathon ITS 2026: sistem peringatan dini berbasis AI agar PLTS desa (program PLTS Koperasi Desa Merah Putih) tidak mangkrak. Pengawas memakai dasbor peta (status PLTS, bukti satelit cahaya malam, prediksi umur baterai, kirim peringatan, skor lokasi). Operator koperasi memakai tampilan pesan (asisten klasifikasi keluhan + panduan perbaikan). Di luar scope: WhatsApp asli, sensor fisik, login sungguhan, integrasi Simkopdes sungguhan. Ide asli di `docs/00-BRIEF.md`.

## Stack & Perintah Verifikasi
- **Stack:** Next.js App Router + TS + Tailwind v4 (template Soft Op Dashboard) · FastAPI + scikit-learn · skrip analisis Python → JSON statis
- **Test:** `npx vitest run` + `pytest -q` · **Build:** `npm run build` · **Typecheck:** `npx tsc --noEmit` · **Lint:** `npm run lint` + `ruff check api analisis` · **Dead code:** `npx knip` + `vulture api analisis --min-confidence 80`

## Aturan Wajib (ringkas — lengkapnya di docs/07-RULES.md)
- Tuntaskan setiap permintaan sesuai aturan projek.
- Setiap perubahan kode: jalankan test, build, typecheck, lint, cek dead code, dan cek alur inti.
- Error → cari akar penyebab, perbaiki, ulangi semua pemeriksaan sampai hijau.
- Dilarang skip pemeriksaan, melemahkan test, klaim selesai tanpa bukti, memoles metrik, atau menyembunyikan hasil uji yang negatif.
- Pemeriksaan yang tidak bisa dijalankan → jelaskan dengan jujur.
- Projek harus bersih dari dead code.
- Solusi paling sederhana yang benar (YAGNI, standard library & fitur bawaan dulu, dependency baru harus izin). Pakai skill `ponytail` jika tersedia.
- Kerja UI: ikuti docs/08-DESIGN.md termasuk Standar UI anti tampilan AI + checklist UI/UX. Pakai skill `impeccable` jika tersedia.
- Output perintah panjang lewat `rtk` jika terpasang; jangan menebak dari output terpotong.
- Selesai kerja → laporkan perubahan, pemeriksaan, dan hasilnya.

## Aturan Main (ringkas — lengkapnya di docs/06-WORKFLOW.md)
- **Otonomi:** kerjakan task 04-TODO dan perbaiki error sendiri.
- **Wajib minta izin:** dependency baru, ubah model data, fitur di luar PRD, commit/push/deploy, ubah daftar desa uji, potong scope.
- **Selesai =** kriteria di 03 terpenuhi + semua cek hijau + ada test + 04-TODO diupdate + laporan.

## Konvensi (ringkas — lengkapnya di docs/02-AGENT.md)
- Nama domain dan UI bahasa Indonesia; rute huruf kecil bertanda hubung.
- Web membaca `public/data/*.json` lewat `src/lib/data.ts`; skrip analisis satu-satunya penulisnya.
- Ambang AI hanya di `api/app/config.py` dan `web/src/lib/ambang.ts`.
- Parameter literatur diberi komentar sumber; data simulasi/contoh berlabel di UI.
- Shell dan komponen dasar dari starter Soft Op; tanpa shadcn, sidebar-21st, framer-motion.
- Saat membuat panggilan AI, ikuti §5 `docs/03-ARCHITECTURE.md` dan `docs/AI-PRIMITIVES.md`.

## Kapan baca docs
- Mulai task baru → bagian terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Pitch & script demo → `docs/05-PITCH.md`
- Ragu scope → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`
- Konflik aturan → prioritas: 07-RULES > instruksi user > 00-BRIEF > 01-PRD > 08-DESIGN (untuk UI) > 06-WORKFLOW > 03-ARCHITECTURE > 02-AGENT
