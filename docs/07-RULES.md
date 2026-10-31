# 07 — RULES: Aturan Wajib

> Aturan tertinggi projek. Berlaku untuk setiap AI dan setiap perubahan kode, tanpa pengecualian.

## 1. Tuntaskan Permintaan
- Kerjakan setiap permintaan sampai benar-benar selesai, mengikuti aturan di docs/.
- Jangan berhenti di tengah jalan atau menyerahkan pekerjaan setengah jadi sebagai "selesai".

## 2. Verifikasi Wajib Setiap Perubahan Kode
Jalankan semua pemeriksaan yang tersedia di projek ini:

| Cek | Perintah |
|---|---|
| Test | `cd web && npx vitest run` · `cd api && .venv/Scripts/pytest -q` · `cd analisis && .venv/Scripts/pytest -q` |
| Build | `cd web && npm run build` |
| Typecheck | `cd web && npx tsc --noEmit` |
| Lint | `cd web && npm run lint` · `ruff check api analisis` |
| Dead code | `cd web && npx knip` · `vulture api analisis --min-confidence 80` |
| Eval AI (bila model/ambang/data latih berubah) | `cd api && .venv/Scripts/python -m eval.keluhan` · `cd analisis && .venv/Scripts/python -m baterai.latih` |
| Cek fungsi terkait | Jalankan web + API, buka halaman yang berubah, dan **cek alur inti** 6 langkah di 01-PRD §4 |

## 3. Siklus Perbaikan Error
Jika ada pemeriksaan yang gagal:
1. Cari **akar penyebabnya** (baca pesan error, reproduksi).
2. Perbaiki penyebabnya, bukan gejalanya.
3. Jalankan ulang **semua** pemeriksaan wajib.
4. Ulangi sampai semuanya berhasil.

## 4. Dilarang
- Melewati pemeriksaan wajib.
- Melemahkan test: menghapus/men-skip test, melonggarkan assertion, menambah `@ts-ignore`, `eslint-disable`, `# type: ignore`, `any`, atau sejenisnya hanya agar lolos.
- Menyatakan pekerjaan selesai tanpa bukti verifikasi (output perintah).
- Mengarang hasil pemeriksaan.
- **Khusus projek ini:** mengarang atau memoles metrik model; menyembunyikan hasil uji satelit yang negatif; menampilkan data simulasi/contoh tanpa label; mengubah daftar desa uji setelah data dilihat tanpa izin dan tanpa mencatatnya.

## 5. Kejujuran
Jika ada pemeriksaan yang tidak bisa dijalankan (tool belum terpasang, butuh kredensial seperti token Earthdata, butuh layanan eksternal, dsb.), jelaskan dengan jujur: pemeriksaan apa, kenapa tidak bisa, dan risikonya.

## 6. Nol Dead Code
Projek harus bersih dari kode tak terpakai setiap saat:
- Tidak ada import, variabel, fungsi, export, komponen, file, atau dependency yang tidak dipakai.
- Tidak ada kode yang di-comment-out, `console.log`/print debug, atau feature flag mati.
- Saat mengubah/menghapus kode, telusuri dan hapus juga semua yang jadi tak terpakai karenanya.
- Jalankan cek dead code sebagai bagian dari verifikasi wajib.

## 7. Solusi Paling Sederhana (Ponytail)
Berlaku untuk setiap tugas koding: menulis, memperbaiki, refactor, review, memilih dependency.
- Kalau skill `ponytail` tersedia (Claude Code), panggil otomatis. Kalau tidak, prinsip di bawah tetap wajib.
- Tanya dulu: apakah ini perlu dibuat sama sekali? (YAGNI — jangan bangun untuk kebutuhan yang belum ada.)
- Urutan pilihan: fitur bawaan bahasa/standard library → fitur bawaan framework/platform → dependency yang sudah ada di projek → dependency baru (harus minta izin, sertakan alasan).
- Kode sesedikit mungkin yang tetap benar, terbaca, dan teruji. Tidak ada abstraksi, konfigurasi, atau lapisan "untuk jaga-jaga".
- Sederhana bukan berarti asal: tidak boleh mengorbankan kebenaran, keamanan, test, atau aturan lain di dokumen ini.

## 8. UI/UX
Berlaku untuk setiap kerja tampilan: halaman, komponen, layout, warna, tipografi, aksesibilitas, responsif.
- Kalau skill `impeccable` tersedia (Claude Code), panggil otomatis: `impeccable` menentukan tampilan (kualitas visual penuh), `ponytail` menentukan cara membangunnya (tanpa dependency tambahan). Jangan menurunkan kualitas visual demi menghemat kode. Kalau skill tidak tersedia, checklist di bawah tetap wajib.
- `docs/08-DESIGN.md` wajib dipakai: hanya token di dokumen itu (warna, font, spacing, radius), tidak ada nilai hardcode di luar token.
- Sumber komponen projek ini: **template Soft Op Dashboard** (`starter/`: kelas CSS + shell + `components/ui`). Tidak memakai shadcn, sidebar-21st, atau framer-motion (keputusan Q2 di 03-ARCHITECTURE). Library UI lain butuh izin.
- Checklist wajib sebelum UI dinyatakan selesai:
  - Responsif di 375px, 768px, dan 1440px tanpa scroll horizontal.
  - Kontras teks ≥ 4.5:1 (teks besar & elemen UI ≥ 3:1).
  - Semua aksi bisa lewat keyboard, focus terlihat jelas; peta punya alternatif daftar yang bisa dinavigasi keyboard.
  - Target sentuh ≥ 44×44px di bawah 1200px (≥ 36px di desktop); body text ≥ 16px di mobile.
  - State lengkap: hover, active, focus, disabled, loading, empty, error.
  - Input punya label; ikon tanpa teks punya `aria-label`.
  - Konsisten dengan komponen lain yang sudah ada.
  - Teks yang terlihat user tanpa em-dash (`—`/`–` sebagai pemisah); konten contoh realistis (bukan John Doe/Acme, bukan angka terlalu rapi, tanpa kata klise pemasaran).
  - Bagian setinggi layar memakai `min-h-[100dvh]`, bukan `h-screen`; font lewat `next/font`, bukan `<link>` Google Fonts.
  - Lulus Standar UI A1–A11 + A13 di bagian Do's and Don'ts 08-DESIGN (tanpa emoji, tanpa warna bawaan AI, satu layar satu tugas, tanpa elemen tanpa fungsi, tanpa em-dash, konten realistis, `100dvh` + font self-host, semua elemen klik punya hover/tekan/fokus beranimasi).
  - Shell lolos verifikasi berdampingan dengan `preview/` template Soft Op (1440, 768, 375) sesuai `starter/README.md`.
  - Setelah token diubah: `npx -p @google/design.md designmd lint docs/08-DESIGN.md` wajib 0 error dan tanpa warning `contrast-ratio`, lalu `export` ulang theme-nya.
  - Lulus Prinsip UX di bagian "Do's and Don'ts" `docs/08-DESIGN.md`.
- Verifikasi visual: buka halaman yang berubah di browser (desktop + mobile) dan cek checklist di atas. Masukkan hasilnya ke laporan.

## 9. Output Perintah Hemat (RTK)
- Kalau `rtk` (Rust Token Killer) terpasang, jalankan perintah yang outputnya panjang (git, package manager, test runner, build, lint, docker, ls/grep di folder besar) lewat `rtk` agar output ringkas tanpa kehilangan sinyal penting.
- Kalau tidak terpasang, pakai flag ringkas bawaan tool dan batasi output dengan filter, tanpa menyembunyikan error.
- Gabungkan perintah yang saling terkait dalam satu kali jalan.
- Kalau output ringkas tidak bisa dipakai, jalankan ulang tanpa peringkas (`rtk proxy <cmd>`). Jangan menebak hasil dari output yang terpotong.

## 10. Laporan Akhir (wajib setelah setiap pekerjaan)
```
### Perubahan
- {{file}}: {{apa yang diubah dan kenapa}}

### Pemeriksaan
| Cek | Perintah | Hasil |
|---|---|---|
| Test | ... | ✅ 42 passed |
| Build | ... | ✅ |
| Typecheck | ... | ✅ |
| Lint | ... | ✅ |
| Dead code | ... | ✅ tidak ada temuan |
| Eval AI (bila relevan) | ... | ✅ akurasi ... |
| Fungsi terkait / alur inti | ... | ✅ {{apa yang dicek}} |
| UI (jika ada perubahan tampilan) | browser 375 / 768 / 1440 | ✅ {{checklist §8}} |
| UI: Standar UI A1–A11 | 08-DESIGN Do's and Don'ts | ✅ |

### Tidak bisa dijalankan / catatan
- {{... atau "Tidak ada"}}
```
