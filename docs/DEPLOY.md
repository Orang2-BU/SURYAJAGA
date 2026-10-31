# Deploy SuryaJaga

Purwarupa online cukup satu deploy di Vercel (gratis, tanpa kartu, tidak tertidur). Keputusan: 03-ARCHITECTURE Q14.

- **Asisten keluhan** berjalan di server Vercel (`web/src/app/api/keluhan`, `web/src/server/asisten.ts`) memakai bobot
  model yang dilatih scikit-learn di `api/`. Model tidak dikirim ke browser.
- **Peringatan dan laporan malam** disimpan di browser pengunjung, dengan aturan status yang sama dengan `api/app/main.py`.
- **FastAPI di `api/`** tetap menjadi tempat melatih dan menguji model, serta layanan integrasi (REST) untuk tahap lanjut.

## Langkah

1. Masuk ke https://vercel.com dengan akun GitHub yang punya akses ke `Orang2-BU/SURYAJAGA`.
2. **Add New → Project**, pilih repo `SURYAJAGA`.
3. **Root Directory: `web`**. Framework terdeteksi otomatis sebagai Next.js. Tidak perlu Environment Variable.
4. **Deploy**, lalu buka alamat produksinya (misalnya `https://suryajaga.vercel.app`).
5. Jalankan alur inti: pilih Pengawas → peta → detail Parang → kirim peringatan → ganti peran Operator → balas keluhan →
   tandai selesai → kembali ke peta (Parang jadi Dalam pemulihan).

Setiap push ke `main` otomatis dideploy ulang.

## Bila model atau aturan API berubah

Jalankan dari folder `api`: `python ekspor_web.py`, lalu commit berkas di `web/src/server/` dan `web/src/lib/aturan.json`.
Test `api/tests/test_ekspor_web.py` gagal bila ini terlupa, dan `web/src/server/asisten.test.ts` memastikan hasil di web
sama dengan scikit-learn untuk 60 kalimat eval.

## Yang perlu diketahui

- **Data per browser.** Peringatan yang dikirim pengawas terlihat oleh operator di browser yang sama (alur demo memakai
  tombol Ganti peran). Pengawas dan operator di dua perangkat berbeda belum saling melihat; untuk itu perlu basis data
  (tahap lanjut).
- **Lisensi ubin peta.** Lapisan foto Esri dan Sentinel-2 EOX gratis untuk non-komersial (03-ARCHITECTURE Q10).
