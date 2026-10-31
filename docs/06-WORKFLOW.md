# 06 — WORKFLOW: Aturan Main

> Prinsip: alur inti selalu bisa jalan. Lebih baik sedikit fitur yang stabil daripada banyak fitur setengah jadi.

## 1. Alur per Task
1. Ambil task dari 04-TODO sesuai prioritas → 🟦.
2. Baca bagian terkait di 03-ARCHITECTURE; ambigu → tanya, jangan menebak.
3. Implementasi minimal yang memenuhi kriteria selesai.
4. Verifikasi sesuai 07-RULES, termasuk cek alur inti.
5. Commit hanya bila user mengizinkan; update 04-TODO; laporkan.

## 2. Boleh Jalan Sendiri
- Mengerjakan task di 04-TODO, menjalankan semua pemeriksaan, memperbaiki error dari perubahan sendiri
- Menambah/memperbaiki data contoh dan contoh eval (dengan label "contoh")
- Menjalankan skrip analisis yang tidak butuh kredensial

## 3. Wajib Minta Izin
- Menambah dependency baru atau mengganti stack
- Mengubah model data yang sudah dipakai fitur lain
- Fitur atau halaman di luar 01-PRD §5, atau mengubah alur inti
- Commit, push, deploy, aksi ke layanan eksternal, menghapus data
- Mengubah daftar desa uji satelit setelah data dilihat (melanggar keputusan Q5)
- Memotong scope (✂️) — usulkan dengan alasan, user memutuskan

## 4. Prioritas
- Kerjakan task sesuai urutan 04-TODO; alur inti dulu (Must), lalu Should, lalu Could.
- Kalau task jauh lebih rumit dari perkiraan, usulkan versi lebih sederhana yang tetap memenuhi alur inti.

## 5. Definition of Done
- [ ] Kriteria selesai di 03-ARCHITECTURE terpenuhi
- [ ] Semua pemeriksaan di 07-RULES hijau dengan bukti
- [ ] Alur inti masih jalan end-to-end
- [ ] Tidak ada dead code / debug log tersisa
- [ ] 04-TODO diupdate, laporan diberikan

## 6. Prioritas Saat Konflik
07-RULES > instruksi user > 00-BRIEF > 01-PRD > 08-DESIGN (untuk UI) > 06-WORKFLOW > 03-ARCHITECTURE > 02-AGENT
