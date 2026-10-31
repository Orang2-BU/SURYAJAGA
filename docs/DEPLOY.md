# Deploy SuryaJaga

API (FastAPI) di Render, web (Next.js) di Vercel. Keduanya gratis dan mengambil kode langsung dari
GitHub `Orang2-BU/SURYAJAGA` branch `main`. Akun dibuat tim sendiri.

## 1. API di Render

1. Masuk ke https://render.com dengan akun GitHub yang punya akses ke repo `Orang2-BU/SURYAJAGA`.
2. **New → Blueprint**, pilih repo `SURYAJAGA`. Render membaca `render.yaml` di akar repo.
3. Saat diminta mengisi `SURYAJAGA_ASAL_WEB`, isi sementara `http://localhost:3000` (diganti di langkah 3).
4. Tunggu build selesai, lalu buka `https://<nama-layanan>.onrender.com/health`. Harus muncul `{"status":"ok"}`.
5. Catat alamat API ini.

Bila build gagal karena versi Python, ganti nilai `PYTHON_VERSION` di Render (Environment) ke versi 3.13 yang tersedia di Render.

## 2. Web di Vercel

1. Masuk ke https://vercel.com dengan akun GitHub yang sama.
2. **Add New → Project**, pilih repo `SURYAJAGA`.
3. **Root Directory: `web`**. Framework terdeteksi otomatis sebagai Next.js.
4. Tambahkan Environment Variable `NEXT_PUBLIC_API_URL` = alamat API dari langkah 1 (tanpa garis miring di akhir).
   Nilai ini ditanam saat build, jadi harus diisi sebelum Deploy.
5. Deploy, lalu catat alamat produksi (misalnya `https://suryajaga.vercel.app`).

## 3. Sambungkan keduanya

1. Di Render, ubah `SURYAJAGA_ASAL_WEB` menjadi alamat produksi Vercel, lalu simpan (Render memulai ulang API).
2. Buka web, jalankan alur inti: pilih Pengawas → peta → detail Parang → kirim peringatan → ganti peran Operator →
   balas keluhan → tandai selesai → kembali ke peta (Parang jadi Dalam pemulihan).

## Yang perlu diketahui

- **Tidur saat sepi.** Tier gratis Render menidurkan API setelah sekitar 15 menit tanpa permintaan; permintaan pertama
  bisa butuh hampir satu menit. Sebelum demo, buka `/health` dulu. Selama API bangun, web menampilkan pesan
  "layanan belum terhubung" dan status dari data, bukan layar rusak.
- **Data peringatan tidak permanen.** Peringatan dan laporan malam disimpan di berkas; di tier gratis berkas ini
  hilang saat API dimulai ulang atau dideploy ulang. Untuk demo ini justru memberi keadaan bersih.
- **Preview Vercel.** Alamat preview per commit berbeda-beda dan tidak ada di `SURYAJAGA_ASAL_WEB`, jadi fitur yang
  memanggil API hanya jalan di alamat produksi.
- **Lisensi ubin peta.** Lapisan foto Esri dan Sentinel-2 EOX gratis untuk non-komersial (03-ARCHITECTURE Q10).
