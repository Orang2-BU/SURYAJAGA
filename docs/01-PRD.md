# 01 — PRD: SuryaJaga

> Apa yang dibangun, untuk siapa, dan kenapa. Turunan dari 00-BRIEF. Status: ✅ ACC 30 Okt 2026
> Saklar bisnis: Tidak. Bagian bisnis sengaja tidak ada (model bisnis ada di proposal lomba).

## 1. Pitch Satu Kalimat
Untuk pengawas program PLTS Koperasi Desa Merah Putih yang kesulitan menjaga ribuan PLTS tetap menyala, SuryaJaga adalah sistem peringatan dini berbasis AI yang menilai risiko lokasi sebelum dibangun, mendeteksi PLTS padam dari laporan malam operator dan foto satelit panel, memprediksi baterai yang hampir rusak, dan memandu operator desa memperbaikinya, tidak seperti aplikasi pemantau bawaan inverter karena bisa memantau tanpa memasang alat dan berbicara dengan bahasa operator desa.

## 2. Masalah, Pengguna, dan Nilai
- **Pengguna utama & pekerjaannya:**
  - **Pengawas program** (staf Satgas Koperasi Desa Merah Putih, Dinas ESDM provinsi, tim O&M pengembang seperti Pertamina NRE). Pekerjaan: mengetahui PLTS mana yang bermasalah, memprioritaskan penanganan, dan memilih lokasi baru. Kendala: ribuan lokasi tersebar di pulau, tanpa data kondisi; kerusakan baru diketahui dari laporan warga.
  - **Operator koperasi desa** (manajer atau petugas koperasi yang bukan teknisi). Pekerjaan: menjaga PLTS tetap menyala. Kendala: tidak tahu tanda kerusakan, tidak tahu harus berbuat apa, teknisi jauh.
- **Stakeholder lain:** juri Seno Hackathon (menilai TKT 3, kejelasan alur, AI, kesesuaian tema), calon mitra di business matching.
- **Value proposition:** **Sebelum:** PLTS padam berbulan-bulan sebelum ditangani; desa 370 KK kembali ke genset dengan biaya BBM sekitar Rp3,8 juta per hari [riset: perhitungan proposal Bab 4.3]. → **Bagaimana:** status setiap PLTS terlihat di peta, baterai yang akan mencapai akhir umur dalam 6 bulan ditandai (recall 0,468 dan presisi 0,809 pada ambang 0,7, data simulasi; di 77 sel LFP nyata HUST model mengurutkan risiko dengan PR-AUC 0,731 tetapi ambang perlu dikalibrasi) [hasil T4-T5], operator dipandu langkah demi langkah. → **Sesudah:** 13-26 hari padam per kejadian kerusakan baterai dapat dicegah [perhitungan: recall T5 x waktu pengadaan 4-8 minggu, data simulasi].
- **Alternatif saat ini & kelemahannya:**
  - Laporan warga/WhatsApp ke dinas: lambat, tidak terstruktur.
  - Aplikasi pemantau bawaan inverter: satu merek, bahasa teknis, butuh alat dan internet di lokasi.
  - AMMP Technologies: untuk operator profesional, butuh perangkat di tiap lokasi, tidak tercatat di Indonesia [riset: ammp.io/about].
  - Global Solar Atlas: hanya potensi surya, tidak menilai risiko keberlanjutan [riset: World Bank, 2017].
  - Ruang pemantauan Kementerian Koperasi: memantau transaksi dan stok, bukan kondisi PLTS [riset: Bisnis.com, Sep 2025].
- **Ukuran keberhasilan (purwarupa):**
  - Model baterai: metrik terukur di data uji (target recall "gagal dalam 26 minggu" ≥ 0,70 pada ambang 0,5 [asumsi]; hasil model v2: 0,658 di ambang 0,5, 0,468 di ambang 0,7; target belum tercapai) + hasil uji silang di dataset publik dilaporkan (HUST: PR-AUC 0,731, recall 0,078 di ambang 0,7).
  - Klasifikasi keluhan: akurasi ≥ 0,85 di eval set 60 contoh [asumsi].
  - Grafik cahaya malam Parang dan desa uji lain tampil dan dianalisis, semua hasil dilaporkan.
  - Alur demo §4 berjalan tanpa error di tautan online, dibuka dari laptop dan ponsel.

## 4. Alur Inti
> Alur demo dari awal sampai nilai utama tercapai. Hanya fitur di jalur ini yang Must.

1. Pengunjung memilih peran **Pengawas** di halaman awal.
2. Pengawas membuka **Peta Pemantauan** dan melihat PLTS berstatus normal, waspada, dan kritis.
3. Pengawas membuka **Detail PLTS** berstatus kritis (Parang) dan melihat bukti: grafik cahaya malam dan prediksi umur baterai.
4. Pengawas **mengirim peringatan** ke operator koperasi tersebut.
5. Pengunjung beralih ke peran **Operator**, membuka pesan peringatan, lalu menulis keluhan; asisten mengenali jenis masalah dan memberi langkah perbaikan (atau meneruskan ke teknisi bila ragu/berbahaya).
6. Operator menandai **selesai ditangani**; status PLTS di peta pengawas berubah ke "dalam pemulihan" lalu normal.

Alur pendukung (Should): Pengawas membuka **Perencanaan Lokasi** Kab. Jepara, melihat skor kelayakan dan risiko, lalu membuka rincian satu calon lokasi.

## 5. Peta Halaman
> Satu halaman, satu tugas. Disusun dari peran (tamu, pengawas, operator), entitas data, alur inti dan pendukung, halaman standar, dan halaman bukti untuk juri.

**Peran:** tamu (belum memilih peran) / pengawas / operator · **Total:** 17 halaman — Must 9 · Should 6 · Could 2

### 5a. Daftar halaman

**Publik**
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | Pilih Peran | `/` | tamu | Masuk sebagai pengawas atau operator | Dua kartu peran dengan deskripsi tugas | Badge "Data simulasi", tautan Panduan demo | Masuk sebagai Pengawas / Operator | Tentang data | - | Must |

**Pengawas: Pantau**
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P2 | Peta Pemantauan | `/pemantauan` | pengawas | Melihat kondisi semua PLTS dan menemukan yang perlu tindakan | Peta dengan titik berwarna status; 4 kartu metrik (total, normal, waspada, kritis); kartu sorotan PLTS paling kritis | Waktu data terakhir, sumber data per lapisan | Buka detail PLTS kritis | Filter status, ganti lapisan peta | kosong, loading, error peta, data simulasi | Must |
| P3 | Detail PLTS | `/pemantauan/[id]` | pengawas | Memahami kenapa satu PLTS berstatus tertentu dan bertindak | Status + alasan; prediksi minggu tersisa baterai + keyakinan; grafik cahaya malam vs garis dasar | Kapasitas, jumlah KK, koperasi pengelola, riwayat peringatan | Kirim peringatan ke operator | Salin tautan, lihat metodologi | belum ada data satelit, prediksi ragu, error | Must |
| P4 | Daftar PLTS | `/aset` | pengawas | Membandingkan banyak PLTS dalam tabel | Tabel: nama, status, minggu tersisa baterai, hari sejak anomali | Kabupaten, kapasitas, sumber data | Buka detail | Urutkan, filter, ekspor CSV | kosong, loading, error | Should |
| P5 | Peringatan | `/peringatan` | pengawas | Melacak peringatan yang dikirim sampai selesai | Daftar peringatan dengan status (terkirim, dibaca, ditangani, selesai) | Waktu, operator penerima, kategori masalah hasil asisten | Buka percakapan terkait | Filter status | kosong, loading, error | Must |
| P6 | Detail Peringatan | `/peringatan/[id]` | pengawas | Melihat riwayat satu peringatan dan isi percakapan operator | Linimasa status; kategori + keyakinan klasifikasi; langkah yang diberikan | Eskalasi ke teknisi bila ada | Tandai eskalasi ditangani | Buka PLTS terkait | percakapan kosong | Should |

**Pengawas: Rencana**
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P7 | Perencanaan Lokasi | `/perencanaan` | pengawas | Melihat calon lokasi PLTS di daerah tertinggal (demo: Kab. Maluku Barat Daya) | Peta permukiman berwarna keputusan; metrik; calon teratas | Anggaran dan biaya listrik per calon, sumber data | Buka estimasi calon lokasi | Ganti lapisan peta | kosong, loading, error | Should |
| P8 | Rincian Calon Lokasi | `/perencanaan/[sel]` | pengawas | Memahami estimasi satu calon lokasi | Keputusan + alasan risiko; anggaran (rentang 80%) | Ukuran sistem, efektivitas vs genset, akses, asumsi dan sumber | Kembali ke peta | Lihat di OpenStreetMap | id tak dikenal 404 | Should |

**Pengawas: Bukti (untuk juri dan pengawas yang ingin tahu cara kerja)**
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P9 | Analisis Cahaya Malam | `/bukti/cahaya-malam` | pengawas | Melihat hasil uji satelit semua desa uji | Grafik deret waktu per desa; tabel hasil (terdeteksi / tidak) untuk semua desa yang ditetapkan di muka | Metode, tanggal data, desa pembanding | Pilih desa | Unduh data | hasil negatif ditampilkan apa adanya | Must |
| P10 | Model Baterai | `/bukti/baterai` | pengawas | Melihat seberapa akurat model baterai | Metrik (recall, presisi, MAE minggu) di data uji simulasi dan uji silang dataset publik | Parameter simulator + sumbernya, label "data simulasi" | Lihat contoh prediksi | Unduh metrik | - | Must |
| P11 | Metodologi & Sumber | `/bukti/metodologi` | pengawas | Melihat sumber data, asumsi, dan batasan | Daftar sumber dengan tautan; asumsi berlabel | Versi model, tanggal pembaruan | - | - | - | Should |

**Operator** (tampilan seperti aplikasi pesan, mobile-first)
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P12 | Kotak Masuk Operator | `/operator` | operator | Melihat peringatan untuk PLTS koperasinya | Daftar percakapan, peringatan terbaru di atas | Nama PLTS, waktu | Buka percakapan | - | kosong ("Belum ada peringatan") | Must |
| P13 | Percakapan Asisten | `/operator/percakapan/[id]` | operator | Memahami masalah dan memperbaikinya | Pesan peringatan; jawaban asisten berupa langkah bernomor; tombol jawaban cepat | Keyakinan klasifikasi (bahasa awam), label "diteruskan ke teknisi" | Kirim keluhan / Tandai selesai ditangani | Hubungi teknisi | asisten ragu, kategori berbahaya, API tidak tersedia | Must |
| P14 | Panduan Perawatan | `/operator/panduan` | operator | Membaca panduan tanpa menunggu peringatan | Daftar topik perawatan | Tingkat bahaya tiap topik | Buka topik | - | - | Could |

**Sistem**
| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder (menu ⋯) | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P15 | Tidak Ditemukan | `not-found` | semua | Kembali ke halaman yang benar | Pesan singkat | - | Kembali ke beranda peran | - | - | Should |
| P16 | Terjadi Kesalahan | `error` | semua | Pulih dari error | Pesan + kode | - | Coba lagi | Kembali | - | Should |
| P17 | Pengaturan Ambang | `/pengaturan` | pengawas | Melihat dan mengubah ambang status (demo) | Ambang keyakinan dan hari anomali | Nilai bawaan | Simpan | Kembalikan bawaan | - | Could |

### 5b. Struktur navigasi
- **Pengawas (sidebar):**
  - Pantau: Peta Pemantauan (P2), Daftar PLTS (P4), Peringatan (P5)
  - Rencana: Perencanaan Lokasi (P7)
  - Bukti: Analisis Cahaya Malam (P9), Model Baterai (P10), Metodologi & Sumber (P11)
  - Bawah: Panduan demo (dialog) + kartu akun "Pengawas demo" dengan aksi Ganti peran dan Pengaturan Ambang (P17)
- **Operator:** satu layar kotak masuk (P12) dengan header berisi nama koperasi dan tombol Ganti peran; Panduan (P14) dari menu header.
- **Hanya lewat tautan/aksi:** P3 (dari P2/P4/P5), P6 (dari P5), P8 (dari P7), P13 (dari P12).

### 5c. Matriks entitas
| Entitas | Daftar | Detail | Buat | Ubah | Hapus | Catatan |
|---|---|---|---|---|---|---|
| PLTS | P2, P4 | P3 | - | status otomatis dari analisis | - | Data contoh statis; tidak dibuat dari UI (di luar scope) |
| Peringatan | P5 | P6 | P3 (kirim) | status dari P13 | - | Disimpan di API (memori/berkas) untuk demo |
| Percakapan & Pesan | P12 | P13 | P13 | - | - | Satu percakapan per peringatan |
| Calon lokasi (sel) | P7 | P8 | - | - | - | Hasil skrip analisis, statis |
| Deret cahaya malam | P9 | P3, P9 | - | - | - | Hasil skrip, statis |
| Prediksi baterai | P4, P10 | P3 | - | - | - | Hasil model, statis |
| Topik panduan | P14 | P13 | - | - | - | Ditulis tim, ditinjau anggota elektro |

## 6. Titik Keputusan AI *(pola: `docs/AI-PRIMITIVES.md`)*
| Keputusan fuzzy | Rubrik / pertanyaan ke AI (tipe) | Kode yang memutuskan |
|---|---|---|
| Apakah baterai PLTS ini akan mencapai akhir umur dalam 26 minggu? | Model klasifikasi probabilistik: ya/tidak + p, plus regresi minggu tersisa (score) | `p ≥ 0,7` → status waspada + saran kirim peringatan; `p ≥ 0,9` → kritis; di antara 0,5-0,7 → tampil "perlu dicek" tanpa peringatan otomatis |
| Apakah desa ini mengalami dugaan padam? | Deteksi anomali deret waktu: ya/tidak + skor-z terhadap garis dasar | Skor-z ≤ -3 selama ≥ 5 malam berkualitas berturut-turut → kritis "dugaan padam"; data berawan/berkualitas rendah tidak dihitung |
| Keluhan operator ini masalah apa? | Klasifikasi teks: choice (baterai, inverter, panel, kabel/sambungan, beban berlebih, lainnya) + p | `p ≥ 0,8` → tampilkan panduan kategori; `0,5-0,8` → tanyakan konfirmasi dua kandidat teratas; `< 0,5` atau kategori berisiko tegangan tinggi → teruskan ke teknisi |
| Seberapa layak dan berisiko calon lokasi ini? | Tidak memakai AI: skor multikriteria deterministik (bobot di config) | Urutkan sel berdasar skor gabungan; tampilkan 5 teratas |

**Bagian yang memakai LLM generatif (teks bebas):** tidak ada. Jawaban asisten diambil dari panduan tertulis per kategori.

## 7. Fitur
| # | Fitur | Prioritas | Alur / halaman | Kriteria terima |
|---|---|---|---|---|
| F1 | Pilih peran tanpa sandi | Must | Alur 1, 5 / P1 | Pilihan peran tersimpan di sesi; tombol Ganti peran di kedua tampilan |
| F2 | Peta pemantauan dengan status | Must | Alur 2 / P2 | Titik PLTS dari data contoh tampil dengan warna dan label teks status; metrik ringkas cocok dengan jumlah titik |
| F3 | Detail PLTS berbukti | Must | Alur 3 / P3 | Menampilkan grafik cahaya malam (data asli bila tersedia, berlabel) dan prediksi baterai + keyakinan; alasan status tertulis |
| F4 | Kirim dan lacak peringatan | Must | Alur 4, 6 / P3, P5 | Peringatan muncul di P12 operator dan P5; status berubah saat operator membaca dan menandai selesai |
| F5 | Asisten operator | Must | Alur 5 / P13 | Klasifikasi lewat API dengan ambang di config; jawaban dari panduan; eskalasi saat ragu/berbahaya; fallback pesan jelas bila API tidak tersedia |
| F6 | Model prediksi baterai | Must | P3, P10 | Simulator berparameter literatur, model terlatih, metrik di data uji terpisah, uji silang dataset publik, hasil diekspor ke JSON |
| F7 | Analisis cahaya malam | Must | P3, P9 | Skrip unduh Black Marble untuk daftar desa uji yang ditetapkan di muka; deret waktu + deteksi anomali; semua hasil ditampilkan |
| F8 | Eval klasifikasi keluhan | Must | P13 | 60 contoh berlabel; skrip akurasi per kategori; akurasi dicatat di 04-TODO |
| F9 | Estimasi kelayakan, anggaran, dan risiko lokasi | Should | Alur pendukung / P7, P8 | Per permukiman Kab. Maluku Barat Daya: WorldPop, NASA POWER, waktu tempuh Weiss, biaya ESMAP (Monte Carlo); keluaran lokasi.json |
| F10 | Daftar PLTS terurut | Should | P4 | Tabel bisa diurutkan dan difilter; ekspor CSV |
| F11 | Halaman metodologi | Should | P11 | Semua sumber berlabel dan bertautan |
| F12 | Ekspor ringkasan kondisi aset (CSV) | Could | P4 | Satu klik menghasilkan CSV status semua PLTS |
| F13 | Bandingkan dua calon lokasi | Could | P8 | Dua sel berdampingan dengan kriteria yang sama |
| F14 | Filter peta per status | Could | P2 | Toggle status menyembunyikan titik lain |
| F15 | Laporan malam operator | Must | Alur 5 / P12, P3 | Pesan otomatis "Lampu desa menyala malam ini?" dengan jawaban cepat Ya/Tidak; 2 malam berturut "Tidak" atau tanpa balasan menandai dugaan padam di P3; data contoh berlabel |
| F16 | Kondisi panel dari foto satelit siang | Should | P3 | Deret Sentinel-2 di dalam poligon PLTS (OSM): perubahan pantulan dan vegetasi per tahun; semua PLTS bertitik OSM ditampilkan, termasuk yang tidak berubah |
| F17 | Uji SDGSAT-1 malam resolusi tinggi | Could | P9 | Eksplorasi berlabel setelah uji utama: cek ketersediaan data Parang dan Batu Bingkung; hasil tidak menggantikan uji yang dikunci |

## 8. Di Luar Scope
- Integrasi WhatsApp asli (butuh akun Meta/Twilio): tahap setelah lolos.
- Modul sensor fisik dan edge AI: dirancang di proposal, dibangun saat ada anggota elektro dan hardware.
- Login sungguhan, manajemen pengguna, multi-koperasi sungguhan.
- Menambah/mengubah data PLTS dari UI.
- Integrasi API ke Simkopdes sungguhan (hanya dirancang).
- Model berbasis LLM generatif untuk menjawab bebas.
- Aplikasi mobile native.

## 9. Riwayat Perubahan
| Tanggal | Perubahan |
|---|---|
| 30 Okt 2026 | Dokumen awal (setup-project-00) |
| 30 Okt 2026 | Model baterai v2 (fitur kondisi kapasitas saja) setelah uji silang HUST (keputusan user, Q9) |
| 30 Okt 2026 | Horizon prediksi baterai 8 → 26 minggu (keputusan user setelah uji T4: 8 minggu hanya PR-AUC 0,45 untuk LFP) |
