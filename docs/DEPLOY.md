# Deploy SuryaJaga

API (FastAPI) di Hugging Face Spaces, web (Next.js) di Vercel. Keduanya gratis dan mengambil kode langsung dari
GitHub `Orang2-BU/SURYAJAGA` branch `main`. Akun dibuat tim sendiri.

## 1. API di Hugging Face Spaces (gratis, tanpa kartu)

Render sekarang meminta kartu kredit walau memilih tier gratis, jadi API dipasang di Hugging Face Spaces.
Space hanya berisi dua berkas di `deploy/huggingface/`; kodenya diambil dari repo GitHub publik saat build.

1. Daftar atau masuk di https://huggingface.co.
2. **New Space**: nama `suryajaga-api`, SDK **Docker**, template **Blank**, hardware **CPU basic (free)**, Public.
3. Di tab **Files**, unggah `deploy/huggingface/Dockerfile` dan `deploy/huggingface/README.md`
   (README bawaan Space ditimpa).
4. **Settings → Variables and secrets → New variable**: `SURYAJAGA_ASAL_WEB` = `http://localhost:3000`
   (diganti di langkah 3).
5. Tunggu status **Running**, lalu buka `https://<nama-akun>-suryajaga-api.hf.space/health`.
   Harus muncul `{"status":"ok"}`. Catat alamat ini.

Untuk memakai commit terbaru dari GitHub: **Settings → Factory rebuild**.

Alternatif: `render.yaml` di akar repo tetap bisa dipakai bila tim bersedia mendaftarkan kartu di Render.

## 2. Web di Vercel

1. Masuk ke https://vercel.com dengan akun GitHub yang sama.
2. **Add New → Project**, pilih repo `SURYAJAGA`.
3. **Root Directory: `web`**. Framework terdeteksi otomatis sebagai Next.js.
4. Tambahkan Environment Variable `NEXT_PUBLIC_API_URL` = alamat API dari langkah 1 (tanpa garis miring di akhir).
   Nilai ini ditanam saat build, jadi harus diisi sebelum Deploy.
5. Deploy, lalu catat alamat produksi (misalnya `https://suryajaga.vercel.app`).

## 3. Sambungkan keduanya

1. Di Space Hugging Face, ubah variabel `SURYAJAGA_ASAL_WEB` menjadi alamat produksi Vercel (Space memulai ulang API).
2. Buka web, jalankan alur inti: pilih Pengawas → peta → detail Parang → kirim peringatan → ganti peran Operator →
   balas keluhan → tandai selesai → kembali ke peta (Parang jadi Dalam pemulihan).

## Yang perlu diketahui

- **Tidur saat sepi.** Space gratis tidur setelah 48 jam tanpa pengunjung; membangunkannya butuh beberapa menit.
  Sebelum demo, buka `/health` dulu. Selama API bangun, web menampilkan pesan
  "layanan belum terhubung" dan status dari data, bukan layar rusak.
- **Data peringatan tidak permanen.** Peringatan dan laporan malam disimpan di berkas; di tier gratis berkas ini
  hilang saat Space dimulai ulang atau di-rebuild. Untuk demo ini justru memberi keadaan bersih.
- **Preview Vercel.** Alamat preview per commit berbeda-beda dan tidak ada di `SURYAJAGA_ASAL_WEB`, jadi fitur yang
  memanggil API hanya jalan di alamat produksi.
- **Lisensi ubin peta.** Lapisan foto Esri dan Sentinel-2 EOX gratis untuk non-komersial (03-ARCHITECTURE Q10).
