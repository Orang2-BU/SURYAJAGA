# SuryaJaga

> Dibuat oleh skill setup-project-00 (30 Okt 2026). File ini dimuat otomatis setiap sesi,
> jadi tidak perlu membaca ulang docs/ kecuali dibutuhkan (lihat bagian "Kapan baca docs").

## Aplikasi Ini
Purwarupa (target TKT 3) untuk Seno Hackathon ITS 2026: sistem peringatan dini berbasis AI agar PLTS desa pada program PLTS Koperasi Desa Merah Putih tidak mangkrak. Pengguna: pengawas program (dasbor peta) dan operator koperasi desa (tampilan pesan). Fitur Must: peta pemantauan berstatus, detail PLTS dengan bukti satelit cahaya malam dan prediksi umur baterai, kirim dan lacak peringatan, asisten operator (klasifikasi keluhan + panduan), halaman bukti (uji satelit, metrik model). Should: peta kelayakan dan risiko lokasi Kab. Jepara. Di luar scope: WhatsApp asli, sensor fisik, login sungguhan, integrasi Simkopdes sungguhan.
Ide asli user ada di `docs/00-BRIEF.md`.

## Stack & Perintah
- **Stack:** Next.js App Router + TS + Tailwind v4 (template Soft Op Dashboard) · FastAPI + scikit-learn · skrip analisis Python → JSON statis di `web/public/data/`
- **Test:** `npx vitest run` (web) + `pytest -q` (api, analisis) · **Build:** `npm run build` · **Typecheck:** `npx tsc --noEmit` · **Lint:** `npm run lint` + `ruff check api analisis` · **Dead code:** `npx knip` + `vulture api analisis --min-confidence 80`

## Konvensi Singkat (dari docs/02-AGENT.md)
- Nama domain dan UI dalam bahasa Indonesia; rute huruf kecil bertanda hubung.
- Web hanya membaca `public/data/*.json` lewat `src/lib/data.ts`; skrip analisis satu-satunya penulisnya.
- Ambang AI hanya di `api/app/config.py` dan `web/src/lib/ambang.ts` (diuji sama).
- Parameter literatur diberi komentar sumber; data simulasi/contoh selalu berlabel di UI.
- Shell dan komponen dasar dari starter Soft Op; jangan dibangun ulang.
- TS strict tanpa `any`; Pydantic di batas API.

## Aturan Wajib
@docs/07-RULES.md

## Aturan Main
@docs/06-WORKFLOW.md

## Kapan baca docs
- Mulai task baru → bagian task terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Pitch & script demo → `docs/05-PITCH.md`
- Ragu soal scope fitur → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`. UI wajib ikut 08-DESIGN termasuk Standar UI anti tampilan AI.
- Saat membuat panggilan AI, ikuti §5 `docs/03-ARCHITECTURE.md` dan `docs/AI-PRIMITIVES.md`.
- Detail konvensi koding → `docs/02-AGENT.md`
