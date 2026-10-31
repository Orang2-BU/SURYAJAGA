# 05 — PITCH & Demo

> Dibuat karena projek dipresentasikan (seleksi berkas, main event Pitch & Award, Demo Day dan business matching Januari 2027). Kerangka dibuat saat setup, diisi final menjelang presentasi.

## 1. Alur Cerita (5 menit) [asumsi durasi]
| Menit | Bagian | Isi |
|---|---|---|
| 0:00 | Hook | "Dusun Parang di Karimunjawa punya PLTS 75 kWp untuk 370 keluarga. Sejak 2019 hampir seluruhnya mati, dan warga kembali ke genset." |
| 0:30 | Masalah | Pemerintah membangun PLTS 80 GW di 80.000 koperasi (sekitar Rp1.449 triliun). Kerusakan baru ketahuan setelah padam; operator bukan teknisi; pengawas tidak punya gambaran. |
| 1:15 | Solusi | SuryaJaga di sepanjang umur PLTS: nilai risiko lokasi sebelum dibangun, prediksi baterai, laporan malam operator, foto satelit kondisi panel, pandu operator. |
| 1:45 | Demo | Alur inti 6 langkah (lihat §2) |
| 3:30 | Bukti | Uji satelit cahaya malam 5 desa (hasil negatif, ditampilkan apa adanya), metrik model baterai, akurasi klasifikasi keluhan |
| 4:15 | Dampak | Biaya genset Rp3,8 juta/hari per desa 370 KK; 13-26 hari padam dicegah per kejadian; 5,7-11,4 ton CO2 per kejadian (angka proposal Bab 4) |
| 4:45 | Langkah berikutnya | Uji coba di 1-2 koperasi bersama pengembang, data baterai nyata, modul sensor semikonduktor |

## 2. Script Demo
| # | Aksi di layar | Kalimat yang diucapkan |
|---|---|---|
| 1 | Buka tautan, pilih "Pengawas" | "Kami masuk sebagai pengawas program PLTS koperasi." |
| 2 | P2 Peta Pemantauan, tunjuk kartu sorotan kritis, ganti lapisan ke "Foto detail" | "Satu peta untuk ribuan PLTS. Setiap status punya bukti: prediksi baterai, laporan malam operator, dan foto satelit kondisi panel." |
| 3 | Buka detail Parang, tunjuk kartu cahaya malam | "Kami juga menguji satelit cahaya malam NASA di 5 desa yang kami tetapkan sebelum melihat data. Hasilnya negatif: desa sekecil Parang terlalu redup untuk terdeteksi. Kami tampilkan apa adanya, dan karena itu SuryaJaga tidak bergantung pada satu sumber." |
| 4 | Kirim peringatan, tunjukkan dialog isi pesan | "Peringatan langsung dikirim ke operator koperasi." |
| 5 | Ganti peran ke Operator, buka pesan, ketik keluhan "lampu inverter merah kedip terus" | "Operator bukan teknisi. Asisten mengenali masalahnya dan memberi langkah, atau meneruskan ke teknisi kalau berisiko." |
| 6 | Tandai selesai, kembali ke peta | "Status langsung berubah di dasbor pengawas." |
| 7 | (bila waktu) Perencanaan Lokasi Jepara | "Sebelum dibangun, kami menilai lokasi mana yang bisa dirawat, bukan hanya yang paling cerah." |

**Cadangan:** video rekaman (T21) · data statis di web sehingga peta dan bukti tetap jalan bila API tidak tersedia · fallback pilih kategori manual di P13.

## 3. Outline Deck
1. SuryaJaga: sistem peringatan dini PLTS desa berbasis AI
2. Masalah: Parang dan risiko 80.000 PLTS koperasi
3. Solusi: satu diagram siklus hidup (sebelum pembangunan, selama operasi)
4. Demo
5. Bukti: satelit, model baterai, klasifikasi keluhan
6. Dampak: biaya genset, hari padam, emisi
7. Pembeda: AMMP, Global Solar Atlas, ruang pemantauan Kemenkop
8. Tim dan langkah berikutnya

## 4. Persiapan Q&A
| Pertanyaan audiens | Jawaban (≤ 30 detik) | Penjawab |
|---|---|---|
| Satelit beresolusi sekitar 500 m bisa melihat desa 200 KK? | Tidak, dan kami sudah membuktikannya: di 5 desa uji yang ditetapkan sebelum data dilihat, semuanya terlalu redup, termasuk desa pembanding yang menyala. Karena itu sinyal padam harian datang dari laporan malam operator, kerusakan panel dari foto Sentinel-2, dan kami sedang menguji satelit malam resolusi 40 m (SDGSAT-1). | Anggota 3 |
| Model baterai dilatih dari data simulasi, bukan data nyata? | Benar dan kami beri label jelas. Parameter simulator dari jurnal, split per baterai agar tidak bocor, dan diuji silang pada 77 sel LFP nyata (HUST). Di sel nyata, model mampu mengurutkan sel paling berisiko (PR-AUC 0,731, tebakan acak 0,108), tetapi ambangnya masih perlu dikalibrasi; karena itu langkah berikutnya data nyata dari mitra pengembang. | Anggota 1 |
| Apa bedanya dengan aplikasi monitoring inverter atau AMMP? | Mereka butuh alat di tiap lokasi dan bahasa teknisi. Kami mulai tanpa alat: prediksi baterai, laporan malam operator lewat pesan singkat, dan foto satelit panel, lalu memandu operator dengan bahasa awam. | Ketua |
| Kenapa tidak pakai Google Earth saja? Fotonya lebih tajam. | Foto siang hanya menunjukkan panel masih terpasang, bukan menyala; PLTS Parang panelnya masih ada tetapi padam sejak 2019. Foto kami pakai untuk memeriksa kerusakan fisik panel (Sentinel-2, tiap 5 hari), sedangkan menyala atau tidak dari laporan malam operator. | Anggota 3 |
| Lisensi peta satelitnya bagaimana kalau dipakai pemerintah? | Purwarupa memakai lapisan gratis non-komersial (Esri, EOxCloudless) dengan atribusi. Versi produksi memakai citra Sentinel-2 langsung dari Copernicus yang bebas dipakai, dan NASA Black Marble yang data terbuka; citra komersial hanya opsi bila diminta. | Ketua |
| Bagaimana kalau dipakai skala besar? | Analisis satelit dan skor lokasi dihitung offline per wilayah dan disimpan statis; klasifikasi keluhan ringan di CPU. | Anggota 4 |
| Privasi & keamanan data? | Purwarupa tidak menyimpan data pribadi; data operator contoh berlabel. Versi produksi mengikuti kebijakan data Kemenkop. | Anggota 4 |
| Seberapa akurat AI-nya, dan bagaimana kalian tahu? | Klasifikasi keluhan [akurasi T12] pada 60 contoh berlabel; model baterai recall 0,468 dan presisi 0,809 (ambang 0,7, horizon 26 minggu) pada 240 baterai uji simulasi, dan PR-AUC 0,731 pada 77 sel LFP nyata. Kami juga menunjukkan model versi awal yang gagal di sel nyata dan kenapa kami menggantinya. Ambang di config: kalau ragu, diteruskan ke teknisi, tidak otomatis. | Anggota 1 |

## 5. Kartu Contekan
**Ide dalam 3 kalimat:**
Pemerintah sedang membangun PLTS di puluhan ribu desa, padahal dulu banyak PLTS desa mati dan dibiarkan karena kerusakan tidak ketahuan dan operatornya tidak tahu harus berbuat apa. SuryaJaga memprediksi baterai yang hampir rusak, menerima laporan malam dari operator, dan memeriksa kondisi panel dari foto satelit, lalu mengirim peringatan dan panduan perbaikan ke operator. Sebelum PLTS dibangun, SuryaJaga juga membantu memilih lokasi yang bisa dirawat.

**Angka kunci:**
| Angka | Nilai | Sumber | Cara menghitung (kalau ditanya) |
|---|---|---|---|
| Aset PLTS koperasi | US$80 miliar / Rp1.449 triliun | Kontan 2025 + JISDOR 26 Okt 2026 | 80 GW x US$1 juta/MW x Rp18.116 |
| Biaya genset desa 370 KK | Rp3,3-4,2 juta/hari | detik 2022, Saputra dkk. 2026, harga Dexlite Okt 2026 | 555 kWh x 0,25-0,32 L/kWh x Rp23.700 |
| Hari padam dicegah | 13-26 hari/kejadian | Recall model v2 (simulasi) + asumsi pengadaan 4-8 minggu | 0,468 x 28-56 hari |
| Emisi dicegah | 5,7-11,4 ton CO2/kejadian | EIA 2024 | liter solar x 2,69 kg/L |
| Akurasi klasifikasi keluhan | [isi setelah T12] | eval set 60 contoh | benar / total |

**Kalau ditanya hal yang tidak kamu tahu:** "Itu asumsi kami berdasarkan {{sumber}}; langkah berikutnya adalah memvalidasinya dengan data mitra pengembang." Jujur lebih baik daripada mengarang.

**Kamus istilah:**
| Istilah | Artinya |
|---|---|
| PLTS | Pembangkit listrik tenaga surya: panel, inverter, baterai |
| kWp / kWh | Kapasitas puncak panel / jumlah energi |
| Mangkrak | Fasilitas dibangun tetapi tidak berfungsi dan dibiarkan |
| Dedieselisasi | Program mengganti pembangkit diesel dengan energi terbarukan |
| Black Marble (VNP46A2) | Data cahaya malam harian dari satelit NASA |
| SFC | Konsumsi bahan bakar per kWh listrik genset |
| TKT | Tingkat Kesiapan Teknologi; TKT 3 = fungsi kritis terbukti secara konsep |
| Skor-z | Seberapa jauh nilai hari ini dari kebiasaannya, diukur dalam simpangan baku |
| Recall | Dari semua baterai yang benar-benar gagal, berapa persen yang berhasil ditandai |
| Confidence | Seberapa yakin AI pada jawabannya |
| Ambang (threshold) | Batas yakin minimal sebelum hasil AI dipakai otomatis; di bawahnya dicek manusia |
| Eval set | Kumpulan contoh dengan jawaban benar, dipakai untuk mengukur akurasi AI |
