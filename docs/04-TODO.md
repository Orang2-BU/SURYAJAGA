# 04 — TODO: Progres Build

> AI wajib memperbarui file ini setiap status task berubah. ID sama dengan 03-ARCHITECTURE.

**Legenda:** ⬜ Todo · 🟦 In Progress · ✅ Done · ⛔ Blocked · ✂️ Dipotong (scope cut)

**Target:** Alur Must 1-2 minggu [asumsi, menunggu deadline pendaftaran] · **Update terakhir:** 31 Okt 2026

## Task
| ID | Task | Pemilik | Prioritas | Status | Bukti verifikasi / Catatan |
|---|---|---|---|---|---|
| T1 | Fondasi monorepo + starter Soft Op + token + tooling | Anggota 4 | Must | ✅ | 30 Okt: Next 16.4.3 + starter Soft Op, token dari 08-DESIGN, 14 rute kerangka + P1 + 404/error; lint/tsc/vitest 7 passed/knip/build 17 rute hijau; FastAPI `/health` 200, pytest 1 passed, ruff & vulture bersih; shell dicek 1440/768/375 (sidebar 264/76, top bar 85/76, drawer mobile, tanpa scroll horizontal). Analisis: venv siap, belum ada test (mulai T3) |
| T2 | Data PLTS + kunci daftar desa uji | Anggota 3 | Must | ✅ | 30 Okt: `analisis/plts.py` → `web/public/data/plts.json` (5 PLTS laporan bersumber + 2 contoh Karimunjawa berlabel) dan `desa_uji.json` dikunci (3 mangkrak, 2 pembanding); pytest 6 passed, ruff/vulture bersih. Koordinat desa uji = titik pusat pulau/desa dari OSM (tetap, dikunci). 30 Okt: titik peta 4 PLTS laporan dipindah ke poligon PLTS di OSM (Parang, Burung Loe, Sembur, Batu Bingkung; dicek di foto Esri), Lakarama dan 2 contoh tetap pusat desa; `desa_uji.json` tidak berubah. pytest 27 passed |
| T3 | Simulator degradasi baterai | Anggota 1 | Must | ✅ | 30 Okt: model kapasitas LFP NREL BLAST-Lite (data Naumann dkk. 2018/2020, identifikasi Gasper dkk. 2022) ditulis ulang tervektorisasi; dicek terhadap BLAST-Lite asli, selisih kapasitas ≤ 0,001 setelah 3 tahun di 3 kondisi. Dataset 1.200 baterai (838 gagal: 713 aus, 125 mendadak; median umur 10,2 tahun) di `analisis/data/baterai_sim.csv.gz` (dihasilkan ulang lewat `python -m baterai.simulasi`). pytest 13 passed |
| T4 | Model baterai + metrik + ekspor | Anggota 1 | Must | ✅ | 30 Okt: horizon 26 minggu (Q8). 240 baterai uji: PR-AUC 0,811; ambang 0,5 R 0,744/P 0,809; 0,7 R 0,674/P 0,882; 0,9 R 0,497/P 0,946; recall aus 0,769 vs mendadak 0,083 (ambang 0,7); pembanding aturan SOH ≤ 0,82: R 0,902/P 0,240. MAE minggu tersisa 14,2. Ekspor `web/public/data/baterai/{metrik,prediksi}.json` (prediksi simulasi hanya untuk 2 PLTS contoh + Pulau Sembur). pytest 20 passed |
| T5 | Uji silang dataset baterai publik | Anggota 1 | Must | ✅ | 30 Okt: dataset HUST 77 sel LFP nyata (Mendeley, CC BY 4.0, 1,19 GB di `analisis/data/hust/`, tidak masuk git; pickle dibuka dengan unpickler terbatas). v1 gagal (PR-AUC 0,167, recall 0); diganti v2 fitur kondisi (Q9): HUST PR-AUC 0,731 (basis 0,108), recall 0,078/presisi 1,0 @0,7; simulasi PR-AUC 0,701, R 0,468/P 0,809 @0,7. Ambang perlu kalibrasi lapangan. pytest 25 passed |
| T6 | Skrip unduh Black Marble | Anggota 3 | Must | ✅ | 30-31 Okt: `cahaya_malam/unduh.py` (h5py, Q11): 423 ubin VNP46A3 bulanan Jan 2015-Sep 2026 + 234 ubin VNP46A2 harian (88 hari tersedia s.d. 26 Okt 2026), ±17 GB diunduh lalu dibuang, ringkasan per desa di `analisis/data/cahaya/`. Tahan gangguan server (ubin gagal dicatat dan diulang). 6 test |
| T7 | Deteksi anomali + ekspor hasil semua desa uji | Anggota 3 | Must | ✅ | 31 Okt: aturan dikunci sebelum data dilihat (Q11). **Hasil negatif: kelima desa uji (3 mangkrak, 2 pembanding) berstatus sinyal lemah**, garis dasar 2015-2016 0,00-0,15 nW/cm²/sr (< 0,5). Pembanding yang menyala (Batu Bingkung, Sembur) sama redupnya dengan desa mangkrak, jadi satelit tidak membedakan keduanya di desa sekecil ini. Ekspor `web/public/data/cahaya.json` (67,7 KB). 5 test |
| T8 | P1 Pilih Peran + navigasi + placeholder | Anggota 2 | Must | ✅ | 30 Okt: `/masuk?peran=` menyimpan cookie `peran` (30 hari) lalu mengarahkan ke beranda peran; peran tidak dikenal kembali ke `/` (dicek curl: 307 + Set-Cookie). P1 menandai "Terakhir dipakai". Semua rute PRD §5 sudah ada (placeholder untuk yang belum dibangun) |
| T9 | P2 Peta Pemantauan | Anggota 2 | Must | ✅ | 30 Okt: MapLibre 6.16 (v5 punya XSS kritis) + ubin OSM; 4 kartu metrik, kartu sorotan (kritis dengan laporan terbaru: Lakarama), tabel semua PLTS sebagai alternatif keyboard; state memuat/gagal/kosong; popup dibangun dengan DOM (bukan HTML). `src/lib/data.ts` memvalidasi plts.json (14 test). Dicek 1440 dan 375: 7 titik terlihat, tanpa scroll horizontal. Detektor impeccable: 1 peringatan `transition: width` milik shell template (dibiarkan). Catatan: urutan mobile metrik → sorotan → peta, berbeda dari 08-DESIGN (sorotan → metrik) |
| T10 | P3 Detail PLTS | Anggota 2 | Must | ✅ | 30 Okt: `/pemantauan/[id]` pola Telusuri 5/7: kartu status + alasan + sumber, profil PLTS, kartu prediksi baterai (peluang 26 minggu, tingkat dari `lib/ambang.ts`, sisa umur ± MAE 19, grafik riwayat kapasitas SVG, 3 fitur, label Simulasi), menu ⋯ (salin tautan, metodologi), id tak dikenal 404. State kosong: tanpa BMS (Parang, Lakarama, Burung Loe, Batu Bingkung) dan tanpa data satelit. vitest 18 passed, build 25 halaman, lint/tsc/knip/ruff/vulture bersih; dicek 1440/768/375 tanpa scroll horizontal. 31 Okt: grafik cahaya malam SVG (garis dasar, bulan anomali, bulan tanpa data diarsir, skala dipotong di persentil 98 dengan penanda, nilai terbaca lewat hover/sentuh/panah) + ringkasan malam gelap; dicek 1440/375. Tombol Kirim peringatan diaktifkan di T14, riwayat peringatan di T11 |
| T11 | API peringatan | Anggota 4 | Must | ✅ | 31 Okt: FastAPI `POST/GET/PATCH /peringatan` (transisi status dibatasi, riwayat), `POST /laporan-malam` + `GET /laporan-malam/{id}` (dugaan padam 2 malam berturut, `config.py`), simpan berkas JSON atomik, CORS dari `SURYAJAGA_ASAL_WEB`, plts_id divalidasi ke plts.json; test ambang API = web. pytest 17 passed, ruff/vulture bersih |
| T12 | Eval set + model klasifikasi keluhan | Anggota 1 | Must | ✅ | 31 Okt: eval 60 kalimat (10 per kategori: baterai, inverter, panel, kabel, beban, lainnya) ditulis dan dikunci sebelum model; data latih 149 kalimat terpisah (tanpa kalimat sama). TF-IDF n-gram huruf + regresi logistik, C=100 dari validasi silang data latih. **Akurasi 0,95** (dua teratas 0,983; baterai 0,9, kabel 0,8, lainnya 1,0), robustness 60/60. Cabang: 41 panduan (akurasi 1,0), 8 konfirmasi, 11 teknisi. Batas atas: kalimat ditulis tim, bukan pesan operator asli. `python -m eval.keluhan` → `api/eval/hasil.json` |
| T13 | API klasifikasi + panduan + ambang | Anggota 4 | Must | ✅ | 31 Okt: `POST /keluhan` (kategori, p, kandidat kedua, keputusan panduan/konfirmasi/teknisi + alasan), `GET /panduan`, `GET /panduan/{kategori}`; panduan 6 kategori di `api/data/panduan.json` (draf, `ditinjau: false`, menunggu teknisi). Kabel/sambungan wajib teknisi; kata bahaya selalu ke teknisi. Test tiga cabang ambang, wajib teknisi, kata bahaya, validasi 500 karakter. pytest api 33 passed |
| T14 | P5 Peringatan + kirim dari P3 | Anggota 2 | Must | ✅ | 31 Okt: P3 tombol Kirim peringatan membuka dialog (jenis masalah + pesan terisi dari alasan status, maks 500), lalu menampilkan status peringatan aktif + Lacak. P5 daftar semua peringatan dari API, filter per status dengan jumlah, dimuat ulang saat tab aktif kembali; state memuat/kosong/API mati. Dicek: kirim dari P3 tampil di P5, PATCH dibaca tercermin di P5; API mati → pesan + Coba lagi di P5 dan galat di dialog. 375 (baris jadi kartu), 768, 800 tanpa scroll horizontal |
| T15 | P12 Kotak Masuk + P13 Percakapan | Anggota 2 | Must | ✅ | 31 Okt: P13 `/operator/percakapan/[id]`: membuka = dibaca, keluhan → `POST /keluhan` → panduan bernomor (status ditangani) / dua pilihan konfirmasi / diteruskan ke teknisi (eskalasi), tombol Hubungi teknisi dan Tandai selesai (status di P5 ikut berubah), pesan jelas bila API mati. P12 punya tombol Balas dan minta panduan. Dicek 375: keluhan baterai → panduan, "bau gosong" → teknisi, tanpa scroll horizontal |
| T15b | Laporan malam operator (F15) | Anggota 2 | Must | ✅ | 31 Okt: P12 (bingkai pesan 480px) dengan jawaban cepat Ya/Tidak + riwayat 7 malam + daftar peringatan; kartu P3 "Laporan malam operator" (dugaan padam, perlu dipantau, menyala, belum ada, API mati). Dicek: jawab di P12 tercermin di P3; API mati menampilkan pesan + Coba lagi; 375 tanpa scroll horizontal. vitest 22 passed. P12 sisa (percakapan P13, klasifikasi) tetap di T15 |
| T7b | Kondisi panel dari Sentinel-2 (F16) | Anggota 3 | Should | ✅ | 31 Okt: `panel/analisis.py` (pystac-client + rasterio, Planetary Computer; hanya jendela kecil COG yang dibaca), aturan dikunci sebelum data dilihat. Hasil 2017-2026: **Sembur turun 0,71** (NDVI 0,83 → 0,12, cocok dengan pembangunan PLTS Des 2025: cek kewajaran lolos); Burung Loe turun 0,28 (area panel tertutup vegetasi 2018-2020 lalu dibersihkan, sebab belum diketahui); Parang stabil (panel fisik masih ada walau padam: foto siang tidak melihat padam); Batu Bingkung stabil (2026 tanpa adegan cerah). Bug jendela SCL 20 m ditemukan dan diperbaiki sebelum hasil dipakai (hasil putaran salah dibuang). Kartu P3 + state tanpa poligon OSM. pytest 6 test panel |
| T6b | Cek akses SDGSAT-1 (F17) | Anggota 3 | Could | ⛔ | 31 Okt: data Glimmer Imager (cahaya malam 10-40 m) gratis untuk riset lewat SDGSAT-1 Open Science Program (www.sdgsat.ac.cn), terbuka untuk pengguna internasional (106 negara). Akun tim sudah dibuat dan adegan GIU 21 Okt 2026 yang mencakup Parang ditemukan (KX10_GIU_20261021_E110.42_S4.55, ±750 MB), tetapi kuota unduh akun 0. 31 Okt: proposal (SDG 7, 6 bulan, data arsip GIU) dikirim user dan diterima CBAS; peninjauan 2-4 minggu. Draf: `docs/riset/sdgsat-proposal.md` |
| T16 | P9 Cahaya Malam + P10 Model Baterai | Anggota 3 | Must | ✅ | 31 Okt: P10 kesimpulan (urutan risiko tepat, ambang perlu kalibrasi), PR-AUC simulasi vs sel nyata dengan penanda tebakan acak, tabel per ambang (simulasi dan HUST) + pembanding aturan tanpa model, fitur (penurunan PR-AUC bila diacak), data dan metode, unduh metrik. P9 hasil negatif 5/5 sinyal lemah apa adanya, tabel semua desa uji, aturan yang dikunci, grafik kelima desa, unduh data. Dicek 1440/768/375 |
| T17 | Estimasi lokasi (wilayah demo diganti Kab. Maluku Barat Daya, 3T, Q13) | Anggota 3 | Should | ✅ | 31 Okt: `lokasi/unduh.py` (WorldPop 2020 100 m, waktu tempuh Weiss lewat WCS MAP, OSM) + `lokasi/estimasi.py` (permukiman dari WorldPop, kebutuhan 1,5 kWh/KK, panel dari NASA POWER, anggaran Monte Carlo 5.000 sampel sebaran ESMAP 2022 × logistik, biaya Rp/kWh vs bahan bakar genset, risiko berbasis aturan). Total penduduk kotak demo 77.655 (cek kewajaran). 115 permukiman: 10 prioritas, 85 pendampingan, 20 perlu skema perawatan. Semua 1,2-1,4x bahan bakar genset, jadi biaya tidak dipakai sebagai syarat. 13 test |
| T18 | P7 Perencanaan Lokasi + P8 Rincian | Anggota 2 | Should | ✅ | 31 Okt: P7 metrik + peta titik (ukuran = KK, warna = keputusan) + sorotan + 12 calon teratas; P8 risiko + alasan, ukuran sistem, anggaran (rentang 80%), efektivitas vs genset, akses. Dicek 1440 |
| T19 | P4, P6, P11, P15, P16 | Anggota 2 | Should | ✅ | 31 Okt: P4 tabel urut (status, nama, peluang baterai, kapasitas) + filter status + ekspor CSV (F10, F12), status mengikuti peringatan; P6 linimasa status, tandai eskalasi ditangani, pesan, tautan PLTS (isi percakapan belum disimpan server, ditulis terbuka); P11 sumber data bertautan berlabel asli/simulasi/estimasi, versi model, sumber kasus, asumsi, batasan; P5 punya tautan ke P6. P15/P16 dari T1. Dicek 1440/768/375. Perbaikan: `.tabel-gulir` relative agar label sr-only tidak melebarkan halaman |
| T20 | Deploy + uji alur inti online | Anggota 4 | Must | ✅ | 31 Okt: online di https://suryajaga.vercel.app (Vercel, satu deploy, Q14). Diuji di produksi: 10 halaman 200, halaman asing 404, `/api/keluhan` (bau gosong → teknisi, kosong → 422), alur inti 6/6 sampai Parang Dalam pemulihan |
| T21 | Video demo + tangkapan layar + update Tabel 3.3 proposal | Ketua | Must | 🟦 | 31 Okt: tangkapan layar diambil ulang dari versi online (7 gambar Lampiran 2, termasuk peta setelah selesai), tautan web dan repo di subbab 3.6. Sisa: video demo |
| T9b | P2 lapisan peta (Q10) + tautan Copernicus di P3 | Anggota 2 | Should | ✅ | 30 Okt: 4 lapisan (OSM, foto Esri, Sentinel-2 2024 EOX, cahaya malam NASA GIBS 2016) dengan keterangan dan atribusi, proyeksi globe dengan animasi masuk (mati bila reduced-motion); dicek 1440 dan 375, tanpa scroll horizontal. Lisensi non-komersial dicatat di Q10 |
| T22a | F14 Filter peta per status | — | Could | ⬜ | Fitur kecil bernilai besar |
| T22b | F12 Ekspor CSV kondisi aset | — | Could | ✅ | Dikerjakan di P4 (T19) |
| T22c | F13 Bandingkan dua calon lokasi | — | Could | ⬜ | — |
| T22d | P14 Panduan Perawatan + P17 Pengaturan Ambang | — | Could | ⬜ | — |

## Alur Inti Check
| Langkah | Status | Dicek |
|---|---|---|
| 1. Pilih peran Pengawas | ✅ | 30 Okt: `/masuk?peran=pengawas` 307 ke /pemantauan |
| 2. Peta Pemantauan menampilkan status | ✅ | 30 Okt: 7 titik + tabel, tautan ke detail |
| 3. Detail PLTS kritis dengan bukti satelit dan baterai | ✅ | 31 Okt: Parang menampilkan status + alasan + grafik cahaya malam asli (hasil: sinyal lemah); baterai: data BMS tidak ada untuk Parang |
| 4. Kirim peringatan ke operator | ✅ | 31 Okt: kirim dari P3 Parang → muncul di P5 dan kotak masuk operator (P12) |
| 5. Operator membaca, menulis keluhan, dipandu atau dieskalasi | ✅ | 31 Okt: P13, panduan baterai dan eskalasi bau gosong |
| 6. Tandai selesai, status di peta berubah | ✅ | 31 Okt: Tandai selesai di P13 → P2 Parang jadi Dalam pemulihan (metrik, titik abu-abu, tabel, sorotan pindah ke Lakarama). API mati → status dari data + catatan |

## Halaman
> Dari 01-PRD §5. Selesai = halaman jalan dengan data nyata + semua state (kosong, loading, error) + responsif.

| # | Halaman | Prioritas | Status | Catatan |
|---|---|---|---|---|
| P1 | Pilih Peran | Must | ✅ | Cookie peran + tanda terakhir dipakai |
| P2 | Peta Pemantauan | Must | ✅ | Peta, metrik, sorotan, tabel; 1440/375 |
| P3 | Detail PLTS | Must | ✅ | Status, profil, prediksi baterai, grafik cahaya malam; aksi kirim di T14 |
| P4 | Daftar PLTS | Should | ✅ | Urut, filter, ekspor CSV |
| P5 | Peringatan | Must | ✅ | Daftar + filter status; 375/768/1440 |
| P6 | Detail Peringatan | Should | ✅ | Linimasa + eskalasi ditangani |
| P7 | Perencanaan Lokasi | Should | ✅ | Maluku Barat Daya; 1440 |
| P8 | Rincian Calon Lokasi | Should | ✅ | Estimasi lengkap |
| P9 | Analisis Cahaya Malam | Must | ✅ | Hasil negatif apa adanya; 5 grafik |
| P10 | Model Baterai | Must | ✅ | Simulasi + uji silang HUST |
| P11 | Metodologi & Sumber | Should | ✅ | Sumber, versi, asumsi, batasan |
| P12 | Kotak Masuk Operator | Must | ✅ | Laporan malam + peringatan + tautan percakapan |
| P13 | Percakapan Asisten | Must | ✅ | Panduan, konfirmasi, teknisi, selesai; 375 |
| P14 | Panduan Perawatan | Could | ⬜ | — |
| P15 | Tidak Ditemukan | Should | ✅ | Dibuat di T1 (`not-found.tsx`) |
| P16 | Terjadi Kesalahan | Should | ✅ | Dibuat di T1 (`error.tsx`) |
| P17 | Pengaturan Ambang | Could | ⬜ | — |

## Scope Cut
| Fitur/task | Alasan dipotong | Tanggal |
|---|---|---|

## Log
| Tanggal | Ringkasan |
|---|---|
| 30 Okt 2026 | TODO dibuat (setup-project-00) |
| 30 Okt 2026 | Setup selesai (T1). Perbaikan: kartu akun sidebar meluap 21px, diberi ellipsis + peran dipersingkat |
| 30 Okt 2026 | T2 selesai: sumber 5 desa uji diverifikasi (Parang, Lakarama, Burung Loe, Pulau Sembur, Batu Bingkung) dan daftar dikunci |
| 30 Okt 2026 | T3 selesai: simulator baterai berbasis BLAST-Lite + skenario PLTS desa (asumsi berlabel) |
| 30 Okt 2026 | T4 selesai: horizon baterai diubah ke 26 minggu atas persetujuan user |
| 30 Okt 2026 | T5 selesai: uji silang HUST; model baterai diganti v2 (fitur kondisi) atas persetujuan user |
| 30 Okt 2026 | T8 dan T9 selesai: pilih peran dengan cookie, Peta Pemantauan dengan MapLibre |
| 30 Okt 2026 | T10 sebagian: P3 Detail PLTS dibangun; grafik cahaya malam menunggu data satelit (T6-T7), kirim peringatan menunggu T14 |
| 30 Okt 2026 | Lapisan peta satelit (Q10), titik peta ke lokasi PLTS di OSM, kalimat pitch Google Earth vs cahaya malam di 05-PITCH |
| 31 Okt 2026 | T6, T7, T10 selesai. Uji satelit negatif (semua desa uji sinyal lemah), dilaporkan apa adanya; kalimat pitch soal satelit perlu disesuaikan |
| 31 Okt 2026 | Q12: empat sumber bukti pengganti deteksi padam satelit (F15-F17, T15b/T7b/T6b); pitch disesuaikan dengan hasil uji satelit negatif |
| 31 Okt 2026 | T11, T15b (laporan malam), T7b (Sentinel-2) selesai; proposal SDGSAT-1 dikirim (peninjauan 2-4 minggu) |
| 31 Okt 2026 | Proposal lomba direvisi (39 hlm): klaim deteksi padam dari satelit diganti laporan malam operator + Sentinel-2, Subbab 3.5.2 memuat hasil uji Black Marble negatif dan uji Sentinel-2, status Tabel 3.3 diisi, Gambar 3.1 diperbarui, pustaka CBAS dan Planetary Computer ditambah. Versi lama disimpan di snbuild/proposal_sebelum_revisi_satelit.* |
| 31 Okt 2026 | T12, T13, T14 selesai: klasifikasi keluhan (akurasi eval 0,95, batas atas), API keluhan + panduan, kirim dan lacak peringatan (alur inti langkah 4) |
| 31 Okt 2026 | Proposal diringkas jadi 36 hlm: narasi langsung ke sistem sekarang (laporan malam + Sentinel-2, cahaya malam cukup satu kalimat alasan), 3.5.4 asisten ditulis sesuai purwarupa (klasifikasi, tanpa LLM), Tabel 3.3 diperbarui, Gambar PR-AUC v1/v2 dan subbab 2.4 dihapus, regulasi jadi paragraf. Klaim wawancara dihapus: validasi dijadwalkan di bootcamp/main event. Cadangan: snbuild/proposal_sebelum_ringkas.* |
| 31 Okt 2026 | Proposal dipangkas jadi 28 hlm: daftar tabel/gambar dihapus, BAB II dipadatkan (2.1-2.3), 3.3 tanpa daftar langkah, 3.4 Pengguna digabung ke 3.1, BAB IV dipadatkan (nilai aset ke 4.1, emisi jadi paragraf, risiko 6 baris), Tabel 1.1 dua kolom, BAB tidak lagi mulai di halaman baru. Cadangan 36 hlm: snbuild/buat_proposal2_36hlm.py |
| 31 Okt 2026 | T15, T17, T18 selesai. Wilayah demo lokasi diganti ke Kab. Maluku Barat Daya (3T) atas permintaan user; data BPS Jateng terhalang verifikasi bot. 9 tangkapan layar produksi di `D:/Aplikasi/SENO ITS/purwarupa_tangkapan/`, 6 masuk Lampiran 2 proposal (34 hlm). Proposal 3.4.1 ditulis ulang sesuai metode estimasi |
| 31 Okt 2026 | Commit awal dan push ke github.com/Orang2-BU/SURYAJAGA (main). T16 selesai: P9 dan P10 |
| 31 Okt 2026 | Alur inti 6/6: P2 dan kartu status P3 membaca peringatan (`terapkanPeringatan`); peringatan terakhir selesai → Dalam pemulihan. Peta memperbarui titik lewat setData |
| 31 Okt 2026 | T19 selesai: P4, P6, P11; tidak ada lagi tautan buntu dari halaman yang sudah jadi |
| 31 Okt 2026 | Konfigurasi deploy siap (Render + Vercel); akun dibuat tim |
| 31 Okt 2026 | Q14: deploy satu Vercel; model keluhan diekspor dari Python, test kesetaraan 60/60 |
| 31 Okt 2026 | Purwarupa online di suryajaga.vercel.app; alur inti 6/6 diuji di produksi; tautan dan tangkapan online masuk proposal (36 hlm) |
