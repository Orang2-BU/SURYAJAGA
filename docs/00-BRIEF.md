# 00 — BRIEF: SuryaJaga

> Sumber kebenaran untuk ide asli, tujuan, dan batasan. Prioritas: 07-RULES > instruksi user > dokumen ini > dokumen lain.

## 1. Ide Asli
> Dari percakapan dengan user (30 Okt 2026), disalin apa adanya:
>
> "oke yang aku tangkep ini web kan? terus aku punya gambaran kayak pake konsep google eart yang open source, terus bisa di cek lewat situ"
>
> "ini temanku adad ide, tapi aku mau tanya kepadadmu, temenku idenya adalah lewat citra sate;it tu yg map, nah dia itu bisa pemetaan mana yang cocok buat bangun plts atau apa gitu yang berhubungan energi ternarukan"
>
> Permintaan setup (argumen skill): "Projek: purwarupa SuryaJaga untuk Seno Hackathon ITS 2026 (bidang energi, tema Semikonduktor dan Digitalisasi AI). Komponen purwarupa (target TKT 3): (1) model prediksi umur baterai dari data simulasi + metrik akurasi, (2) peta pemantauan web (MapLibre) titik PLTS hijau/kuning/merah, (3) simulasi asisten operator berbasis web (WhatsApp asli tahap lanjut), (4) skrip deret waktu cahaya malam NASA Black Marble untuk Parang Karimunjawa (tim daftar Earthdata), (5) peta kelayakan dan risiko lokasi satu kabupaten."
>
> Konteks lengkap: `../riset-lomba-seno-hackathon-its-2026.md` dan `../Proposal_SuryaJaga_Seno_Hackathon_ITS_2026.docx` (satu folder di atas projek ini).

## 2. Ringkasan
- **Masalah inti:** PLTS desa di Indonesia sering mangkrak karena kerusakan (terutama baterai) baru diketahui setelah listrik padam, operator desa tidak punya panduan, dan pengawas tidak punya gambaran kondisi aset. Program PLTS Koperasi Desa Merah Putih (80 GW di sekitar 80.000 koperasi) berisiko mengulang pola ini [riset: Kontan, Agu 2025; detik, 2016 dan 2022; Kompas, Sep 2025].
- **Untuk siapa:** pengawas program (Kementerian Koperasi, Dinas ESDM, pengembang/EPC) dan operator PLTS di koperasi desa.
- **Hasil yang diharapkan:** purwarupa TKT 3 yang membuktikan fungsi kritis bekerja (skor lokasi, deteksi dugaan padam dari satelit, prediksi umur baterai, panduan operator) dan alur demo utuh yang bisa dibuka juri secara online.

## 3. Projek
| Item | Isi |
|---|---|
| Jenis | Purwarupa produk untuk kompetisi (Seno Hackathon ITS 2026) |
| Saklar bisnis | **Tidak.** Model bisnis ada di proposal, bukan di dokumen projek ini |
| Target waktu | Alur Must selesai dalam 1-2 minggu [asumsi], menyesuaikan deadline pendaftaran yang belum dicek |
| Dipresentasikan | Ya: berkas seleksi (proposal + purwarupa), main event 3 hari, Demo Day dan business matching Januari 2027 |
| Platform | Web (dasbor pengawas desktop-first, tampilan operator mobile-first) + API Python + skrip analisis |
| Budget & hosting | Rp0: Vercel (web) dan layanan gratis seperti Render (API); data satelit dan peta terbuka |

## 4. Tim
Label "Anggota N" dan "Ketua" di 03-ARCHITECTURE dan 04-TODO merujuk ke tabel ini (diperbarui 31 Okt 2026).

| Label | Nama (NIM) | Peran |
|---|---|---|
| Ketua, Anggota 2 | Krisna Panca Dewa (E31241924) | Ketua tim, front end: web, peta, dasbor, tampilan operator |
| Anggota 1 | Hadi Akram Ramadhan (E41250480) | AI: model baterai, uji silang, klasifikasi keluhan |
| Anggota 3 | Mohammad Yassir Thoriq Fathirurrizqy (E41240985) | Analis data satelit dan geospasial: cahaya malam, Sentinel-2, estimasi lokasi |
| Anggota 4 | Asyam Rafif Aubin Fawwaz (E41260791) | Back end: API, integrasi, deploy |
| Anggota 5, rencana | Belum ditentukan | Bisnis: model bisnis, calon pembayar, validasi pasar |

## 5. Batasan & Asumsi
- **Batasan:**
  - Tidak ada akses data inverter PLTS nyata; data baterai memakai simulasi berbasis literatur dan diberi label jelas.
  - Data Black Marble butuh akun NASA Earthdata (gratis) yang didaftarkan tim sendiri; AI tidak membuat akun atau mengetik kata sandi.
  - WhatsApp asli butuh akun Meta/Twilio; purwarupa memakai simulasi percakapan di web.
  - Hosting gratis: API bisa "tidur", jadi hasil analisis berat disimpan statis di web.
- **Asumsi:**
  - Wilayah contoh peta lokasi: Kab. Jepara (Karimunjawa) [dari user] karena Parang ada di sini.
  - Login cukup pilih peran tanpa sandi [dari user].
  - Asisten = klasifikasi keluhan oleh model lokal + jawaban dari panduan tertulis [dari user].
  - Uji satelit memakai daftar desa yang ditetapkan **sebelum** data dilihat, semua hasil dilaporkan (keputusan konsultasi, lihat §6 P3).
  - Bahasa antarmuka Indonesia; mode light [asumsi].

## 6. Pertanyaan Terbuka
| # | Pertanyaan | Asumsi sementara | Status |
|---|---|---|---|
| P1 | Kapan deadline pendaftaran Seno Hackathon? | Purwarupa Must 1-2 minggu | terbuka, user cek di dashboard |
| P2 | Siapa anggota yang mendaftar NASA Earthdata? | Anggota 3 | terbuka |
| P3 | Desa uji satelit selain Parang: lokasi dan koordinat pasti | Daftar kandidat di 03-ARCHITECTURE §3 | terjawab 30 Okt 2026: 5 desa terverifikasi dan dikunci di `desa_uji.json` |
| P4 | Ambang kategori klasifikasi dan isi panduan perawatan perlu diperiksa ahli elektro | Disusun dari manual umum; ditinjau teknisi listrik atau dosen pendamping (anggota ke-5 untuk bisnis) | terbuka |
| P5 | Apakah satu tim boleh mencampur mahasiswa dan dosen? | Tidak dipakai di docs | terbuka, tanya panitia |

User menyetujui saran konsultan (30 Okt 2026) termasuk: rencana B satelit = cari desa lain, tetapi dengan daftar yang ditetapkan di muka dan semua hasil dilaporkan.
