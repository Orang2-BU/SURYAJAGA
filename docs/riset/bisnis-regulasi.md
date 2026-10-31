# Riset kelayakan implementasi: regulasi, pembayar, dan hilirisasi SuryaJaga

Disusun 30 Okt 2026. Pertanyaan: apakah SuryaJaga mungkin diimplementasikan secara nyata, dengan skema bisnis yang bergantung pada regulasi dan hilirisasi?

**Label bukti** (dipakai di semua tabel):
- **[V]** halaman sumber dibuka dan dibaca langsung.
- **[R]** hanya dari ringkasan hasil pencarian; sumber primer belum dibuka.
- **[A]** analisis atau perhitungan saya dari angka bersumber; bukan fakta dari sumber.
- **[?]** belum diketahui atau belum diverifikasi.

## 1. Kesimpulan

1. **Secara teknis dan biaya jalan, layak.** Biaya variabel per lokasi sangat kecil. Satu pesan WhatsApp utility Rp356,65 (belum PPN 11%) [V, sumber sekunder vendor]; dengan 6 peringatan per lokasi per tahun, biayanya sekitar Rp2.400 per lokasi per tahun [A].
2. **Secara komersial, skema "Kemenkop sebagai pembeli utama" adalah bagian terlemah dari rancangan kita.** Dasar hukum program PLTS 100 GW belum final, pembeli listrik dan pembagian risiko belum diatur, dan koperasi sendiri hampir pasti tidak mampu membayar langganan perangkat lunak.
3. **Pembayar yang paling masuk akal lebih dulu adalah pemilik aset dan operator profesional** (pengembang, EPC, BUMN seperti Pertamina NRE), bukan koperasi dan bukan kementerian. Alasannya: struktur kepemilikan aset PLTS Kopdes sendiri belum seragam dan banyak usulan memisahkan "pemilik aset" dari "koperasi pengelola".
4. **Ada celah nyata:** aturan mainnya belum ada, jadi tidak ada standar pemantauan yang menyaingi kita. Tetapi itu juga berarti belum ada anggaran yang jelas.
5. **Jangan menggantungkan bisnis pada satu program.** Sistemnya tidak terikat Kopdes dan bisa dijual untuk PLTS desa mana pun (PLTS komunal ESDM/Pemda, dedieselisasi PLN, proyek developer).

## 2. Status regulasi dan program (per Sep-Okt 2026)

| Hal | Temuan | Dampak bagi SuryaJaga | Bukti |
|---|---|---|---|
| Perpres PLTS 100 GWp | Masih dalam harmonisasi antar-kementerian; belum ada target terbit (Katadata, 16 Sep 2026) | Pembeli listrik, pendanaan, pengadaan, jaminan proyek belum diatur, jadi belum jelas siapa yang punya anggaran O&M | [V] [Katadata](https://katadata.co.id/ekonomi-hijau/energi-baru/6aaa40b388eda/pemerintah-dikejar-waktu-susun-perpres-plts-100-gwp-sejauh-mana-progresnya) |
| Dasar hukum RUKN/RUPTL | Program 100 GW belum tercantum di RUKN dan RUPTL; dokumennya sedang direvisi (Bloomberg Technoz) | Risiko jadwal; jangan memasukkan angka 80.000 koperasi sebagai pasar pasti | [V] [Bloomberg Technoz](https://www.bloombergtechnoz.com/detail-news/116941/plts-100-gw-tak-ada-di-rukn-dasar-hukum-dinilai-belum-jelas/2) |
| Status eksekusi | Menteri ESDM menyatakan tahap awal sudah disetujui dan groundbreaking segera (pertemuan 28 Jul 2026) | Ada momentum, tapi pelaksana dan skema dana belum disebut | [V] [Listrik Indonesia](https://listrikindonesia.com/detail/20776/listrik-desa-dikebut-plts-100-gw-masuk-tahap-eksekusi) |
| Skema pengadaan PLN | Tender bertahap; PLTS Mentari Nusantara I diluncurkan 30 Apr 2026; enam proyek 4,55 GWp (skala besar, bukan PLTS desa) | Jalur PLN berbeda dari Kopdes; jangan dicampur | [V] [Kontan](https://industri.kontan.co.id/news/pln-matangkan-pengadaan-plts-100-gwp-tender-proyek-dilakukan-bertahap) |
| Peran koperasi | IESR: koperasi bisa jadi pengelola layanan listrik (aset milik pihak ketiga), pemilik aset PLTS + baterai, atau penyedia energi sebagai layanan; "model bisnis tidak bisa disamakan untuk seluruh wilayah" (31 Mei 2026) | Pembeli kita beragam; pemilik aset sering bukan koperasi | [V] [Investor Trust](https://investortrust.id/business/104842/iesr-ungkap-tiga-model-pengelolaan-plts-untuk-desa-indonesia) |
| Usulan kepemilikan | CERAH: aset sebaiknya dimiliki operator profesional/BUMN/IPP/EPC berlisensi, koperasi sebagai pembeli listrik; 80.000 entitas koperasi dinilai membebani regulasi; biaya 1 MW sekitar US$900.000 vs anggaran desa sekitar Rp1 miliar per tahun (13 Des 2025) | Memperkuat jalur B2B ke pemilik aset | [V] [Indonesia Business Post](https://indonesiabusinesspost.com/5809/energy-and-resources/experts-prabowo-s-1-mw-solar-power-program-needs-stronger-rules-financing-reform) |
| Pengakuan koperasi sebagai penyedia listrik | PP 25/2021 mengakui koperasi sebagai pelaku usaha penyediaan listrik, tetapi pengakuan skala desa belum tegas, perizinan rumit, kepastian tarif belum jelas | Risiko klien kita, bukan kewajiban kita; relevan untuk cerita adopsi | [R] ringkasan pencarian (IESR dan kajian hukum) |
| SLO dan SKTTK | UU 30/2009: instalasi harus punya Sertifikat Laik Operasi; tenaga teknik harus punya SKTTK | **Asisten tidak boleh menyuruh operator non-bersertifikat mengerjakan perbaikan listrik.** Rancangan "kategori wajib teknisi" sudah sejalan | [R] |
| Pengadaan pemerintah | Perpres 46/2025 (perubahan kedua Perpres 16/2018, berlaku 30 Apr 2025): e-Katalog diprioritaskan, produk dalam negeri dan usaha kecil diutamakan, harga wajib berdasar rujukan pasar | Menjual ke pemerintah lewat e-Katalog atau pengadaan; ambang nilai **tidak** diverifikasi | [V] [DJPb Kemenkeu](https://djpb.kemenkeu.go.id/kppn/watampone/id/profil/309-artikel/4129-perpres-46-2025-percepat-pengadaan,-transparansi-jadi-kunci.html) |
| PSE lingkup privat | Penyelenggara sistem elektronik privat, termasuk SaaS, wajib terdaftar lewat OSS sebelum dipakai publik; tanpa biaya (Permen Kominfo 5/2021) | Wajib saat layanan dibuka; purwarupa belum | [R] |
| Kebijakan WhatsApp Business | Chatbot AI tujuan umum dilarang di WhatsApp Business Platform sejak 15 Jan 2026; penggunaan AI terbatas untuk layanan pelanggan tetap diizinkan | Asisten kita klasifikasi + jawaban dari panduan (bukan chatbot bebas), jadi sesuai maksud; **teks kebijakan primer Meta belum dibaca** | [R] banyak media; [?] teks resmi |
| Dana Desa 2026 | Permendes PDT 16/2025 menetapkan delapan fokus; termasuk ketahanan energi dan dukungan Kopdes | Mungkin menjadi sumber dana O&M tingkat desa; **belum diketahui apakah boleh untuk langganan perangkat lunak** | [R], [?] |
| UU PDP 27/2022 | Nomor WhatsApp dan nama operator adalah data pribadi saat produksi | Purwarupa tidak menyimpan data pribadi; produksi butuh persetujuan dan kebijakan privasi | [?] tidak diverifikasi di sesi ini (pengetahuan umum) |
| Lisensi data | Black Marble, Global Solar Atlas, OpenStreetMap | Semua butuh atribusi; syarat pastinya | [?] belum diverifikasi |

## 3. Ekonomi satuan: angka nyata dari satu PLTS Kopdes

PLTS Pulau Sembur (proyek percontohan) [V, [Katadata, 11 Mei 2026](https://katadata.co.id/amp/indepth/telaah/6a01d20c3d3a2/mimpi-besar-energi-surya-di-bawah-koperasi-desa-merah-putih)]:
- Belanja modal Rp23 miliar; proyeksi pendapatan Rp4,71 miliar per tahun (cold storage, pabrik es, layanan lain); biaya operasi dan perawatan Rp400 juta per tahun; titik impas tahun ke-5 atau ke-6.
- Hitungan saya: 23 : (4,71 - 0,4) = 5,3 tahun, konsisten dengan proyeksi tersebut [A]. Semuanya **proyeksi**, bukan realisasi.

Posisi harga langganan terhadap angka itu [A]:

| Harga langganan per tahun | Terhadap biaya O&M Rp400 juta | Terhadap pendapatan Rp4,71 miliar |
|---|---|---|
| Rp3 juta (asumsi proposal) | 0,75% | 0,06% |
| Rp10 juta | 2,5% | 0,2% |
| Rp20 juta | 5% | 0,4% |

- Studi JRC pada 49 mini-grid Afrika: pemantauan jarak jauh menurunkan biaya operasional sampai 17% dan balik modal sekitar 1 tahun [V, [JRC 2023](https://publications.jrc.ec.europa.eu/repository/handle/JRC134656)]. Bila berlaku serupa (belum terbukti untuk Indonesia), 17% dari Rp400 juta sekitar Rp68 juta per tahun [A].
- Kesimpulan: **Rp3 juta konservatif**, dan harga di sekitar Rp10-20 juta per lokasi per tahun bisa dibela **bila** nilai tambahnya terbukti. Pembanding komersial menagih per MWp per tahun dengan biaya minimum tahunan; angkanya tidak dipublikasikan [V, [AMMP](https://ammp.io/pricing)]. Satuan harga sebaiknya per kWp, bukan per lokasi.
- Risiko penagihan: kasus PLTS komunal Kepri disebut memiliki dana pemeliharaan dari pemerintah daerah, sementara banyak warga enggan membayar iuran dan tidak ada dana cadangan penggantian peralatan [R lemah: halaman sumber tidak terbuka]. Artinya koperasi dan warga bukan pembayar yang bisa diandalkan.

## 4. Siapa yang bisa membayar

| Calon pembayar | Alasan masuk akal | Hambatan | Bukti |
|---|---|---|---|
| **Pemilik aset/EPC/operator** (Pertamina NRE dan sejenis) | Kontraknya menuntut ketersediaan; sudah berinvestasi pada AI dan drone untuk keandalan PLTS | Mungkin sudah punya sistem sendiri; keputusan di pusat | [R] [Investor Trust](https://investortrust.id/business/63866/pertama-di-indonesia-pertamina-nre-manfaatkan-ai-untuk-keandalan-plts) |
| Kementerian (Kemenkop, ESDM, Kemendes) | Skala program; pengawasan | Dasar hukum belum final; pengadaan lambat; integrasi Simkopdes butuh izin | [V] di atas |
| Pemda/Dinas ESDM provinsi | Memegang aset PLTS komunal lama dan anggaran pemeliharaan | Anggaran kecil; siklus APBD tahunan | [R lemah] |
| Koperasi/BUMDes/warga | Penerima manfaat langsung | Tidak ada dana cadangan; iuran sulit | [R lemah] |
| Lembaga keuangan dan penjamin | Fabby Tumiwa: proyek bisa didanai bila layak; data keandalan mendukung kelayakan | **Hanya hipotesis kita**; tidak ditemukan bukti ada yang membayar untuk ini | [V] [Kontan](https://industri.kontan.co.id/news/rencana-pembangunan-plts-100-gw-di-kopdes-merah-putih-pengamat-ingatkan-pendanaan) untuk kutipan; sisanya [?] |
| Program donor dan hibah | Ada program pendampingan operator ESDM-UNDP/Patriot Energi | Sifatnya hibah proyek, bukan pendapatan berulang | [R] |

## 5. Hilirisasi: dari peringatan sampai dampak

Peringatan tanpa kemampuan menindaklanjuti tidak bernilai. Rantai yang harus dipikirkan [A]:

1. **Deteksi** (SuryaJaga): satelit, prediksi baterai, status.
2. **Peringatan ke operator** (WhatsApp) dengan panduan terbatas yang aman.
3. **Tindak lanjut:** operator lokal bersertifikat atau teknisi. Program yang sudah ada: Patriot Energi mendampingi pemilihan, pelatihan, dan sertifikasi operator lokal (ESDM, kerja sama UNDP ACCESS) [R]; Pertamina membekali sertifikasi operator PLTS bagi 40 warga di satu desa [R]. **Ini calon mitra, bukan pesaing.**
4. **Pembiayaan penggantian baterai:** data umur sisa memungkinkan koperasi atau pemilik aset menyusun dana cadangan. Skema pendanaannya sendiri **belum diteliti**.
5. **Pelaporan:** bukti keandalan untuk pemilik aset dan pendana.

Dampak yang bisa diklaim tanpa mengarang: biaya genset dan emisi yang dihindari saat PLTS tidak mati (perhitungan proposal Bab 4, berlabel simulasi) dan pekerjaan teknisi lokal bila tindak lanjut tersedia. Dampak fiskal dan angka nasional **tidak** boleh diklaim sebelum ada pilot.

Jalur hilirisasi riset kampus yang ada [R]: Kemdiktisaintek mendanai 925 dari 2.488 proposal Hilirisasi Riset Prioritas 2026 dengan total Rp318 miliar (angka dari ringkasan pencarian). Pengumuman ITS untuk skema pengujian menetapkan tenggat 26 Des 2025, sehingga siklus 2026 sudah lewat dan siklus berikutnya belum diketahui; **syarat pengusul (dosen atau mahasiswa) tidak tertera** [V, [ITS DRPM](https://www.its.ac.id/drpm/pengumuman-penerimaan-proposal-program-hilirisasi-riset-pengujian-tahun-anggaran-2026/)]. Detail tindak lanjut Seno Hackathon (pendanaan, inkubasi) **tidak ditemukan** di sumber publik.

## 6. Pesaing dan pengganti

- Portal pemantau bawaan produsen (contoh Victron VRM) **gratis** untuk perangkatnya, tetapi terbatas pada satu ekosistem [R]. Ini pengganti utama; pembeda kita harus lintas merek dan lintas lokasi.
- AMMP: platform komersial per MWp per tahun dengan biaya minimum; harga tidak dipublikasikan [V].
- Pertamina NRE: inspeksi AI dan drone di proyeknya sendiri [R].
- Sistem Kemenkop: memantau transaksi dan stok, bukan PLTS [V, Bisnis.com 2025].

## 7. Penilaian kelayakan

| Pertanyaan | Penilaian | Dasar |
|---|---|---|
| Bisa dibangun dan dijalankan murah? | Ya | Biaya variabel kecil; data satelit terbuka |
| Bisa dijual ke Kemenkop dalam 1-2 tahun? | **Kecil kemungkinannya** | Perpres belum final, tidak ada di RUKN/RUPTL, pengadaan lambat |
| Bisa dijual ke pemilik aset/EPC? | **Mungkin, perlu validasi** | Kepentingan ketersediaan jelas, tetapi belum ada bukti kesediaan membayar |
| Bisa dijual ke koperasi? | Tidak | Tidak ada dana cadangan; iuran sulit |
| Satelit cukup sebagai produk? | **Tidak, sebagai pintu masuk saja** | Akurasi belum teruji; nilai penuh butuh data BMS/inverter, berarti integrasi dan kemitraan |
| Aman dari sisi regulasi di tahap purwarupa? | Ya | Tanpa data pribadi, tanpa perangkat; kewajiban PSE baru saat dibuka untuk publik |

## 8. Langkah validasi sebelum menginvestasikan waktu atau uang

1. **Wawancara 5-8 pihak pembayar** (bukan hanya operator): staf O&M pengembang/EPC, Dinas ESDM provinsi, pendamping Patriot Energi, peneliti IESR. Tanyakan: apa yang sekarang dipakai memantau PLTS, berapa biaya satu hari padam, siapa yang menganggarkan penggantian baterai, apakah mau membayar dan berapa.
2. **Cek akses data:** apakah inverter dan BMS di PLTS Kopdes punya API atau ekspor data yang boleh dipakai pihak ketiga.
3. **Baca teks resmi** kebijakan WhatsApp Business, syarat lisensi data, dan UU PDP.
4. **Satu pilot kecil** dengan satu pemilik aset atau satu Dinas ESDM sebelum membicarakan skala nasional.
5. **Pantau Perpres PLTS 100 GWp**; hasil validasi 1 dan 2 menentukan apakah jalur pemerintah layak dikejar.

## 9. Yang belum diketahui

- Siapa pemilik dan penanggung biaya baterai di PLTS Kopdes yang sudah berjalan (Pulau Sembur): sumber yang dibaca tidak menyebut.
- Ambang pengadaan langsung pada Perpres 46/2025.
- Apakah Dana Desa boleh dipakai untuk langganan perangkat lunak.
- Kesediaan membayar dari pihak mana pun: **belum ada data**, ini hipotesis terbesar.

## 10. Tambahan (30 Okt 2026): jalur alternatif, PLTS atap rumah tangga

Usulan: situs yang menilai apakah rumah cocok dipasangi PLTS, memantaunya, dan listriknya dijual ke PLN. Label bukti sama seperti di atas.

| Hal | Temuan | Bukti |
|---|---|---|
| Jual listrik ke PLN | Permen ESDM 2/2024 menghapus ekspor-impor: kelebihan listrik yang masuk jaringan tidak diperhitungkan; PLTS atap hanya untuk dipakai sendiri. Pengguna lama tetap punya hak ekspor 10 tahun sejak persetujuan. Pencarian saya tidak menemukan revisi 2026 yang memulihkan ekspor (tidak berarti pasti tidak ada) | [V] [ESDM](https://www.esdm.go.id/id/media-center/arsip-berita/revisi-permen-esdm-plts-atap-skema-jual-beli-listrik-dihapuskan-) |
| Kuota | Dibuka dua kali setahun (Januari dan Juli); Januari 2026 tersedia 183 MW setelah 304 MW dicadangkan untuk antrean, dan langsung habis; PLN meminta tambahan 229 MW | [V] [Katadata](https://katadata.co.id/amp/ekonomi-hijau/energi-baru/6a561cff17b08/pln-usulkan-penambahan-229-mw-kuota-plts-atap) |
| Ukuran pasar | 772,9 MWp dari 11.329 pelanggan per Nov 2025 (rumah tangga dan bisnis kecil) | [V] sumber yang sama |
| Hambatan | Birokrasi, teknis, dan regulasi disebut menghambat; realisasi Juni 2025 sekitar separuh target 1 GW | [V] [Listrik Indonesia](https://listrikindonesia.com/detail/17726/surya-bersinar-realisasi-tertatih-pemanfaatan-plts-atap-jauh-dari-harapan) |
| Pesaing langsung | IESR SolarHub (sejak Des 2020): informasi, kalkulator penghematan, dan penghubung ke penyedia pemasangan. Status gratis atau berbayar tidak disebut | [V] [Kontan](https://industri.kontan.co.id/news/iesr-terbitkan-solarhub-kanal-informasi-bagi-penggunaan-plts-atap?page=all) |
| Pemain besar | Xurya: sewa PLTS atap tanpa investasi awal untuk perusahaan, dengan pemantauan IoT; lebih dari 100 pelanggan korporat | [R] |
| Data atap | Open Buildings 2.5D Temporal mencakup Indonesia, tetapi dibuat dengan super-resolusi dari citra Sentinel-2 beresolusi rendah; **tidak cukup untuk merancang atap satu rumah** (penilaian saya) | [R] [Google](https://sites.research.google/gr/open-buildings/temporal) lalu [A] |
| Dampak ke modul kita | Cahaya malam, prediksi baterai, dan asisten operator hampir tidak terpakai untuk rumah; yang terpakai hanya ide penilaian lokasi | [A] |

Penilaian [A]: pembeli rumah tangga terlihat sederhana, tetapi tanpa hak jual ke PLN keekonomiannya lebih lemah, ada antrean kuota, pasarnya kecil, dan sudah ada kalkulator gratis. Jalur yang lebih masuk akal adalah pembeli bisnis yang aset atau kontraknya bergantung pada ketersediaan PLTS (pengembang, EPC, dan IPP, termasuk PLTS atap komersial dan dedieselisasi PLN). Kesediaan membayar mereka belum diuji.

## 11. Keputusan user (30 Okt 2026)
- Tetap di jalur PLTS desa / Kopdes (bukan PLTS atap rumah tangga).
- Posisi pembeli: **hibrida**. Pilot bersama pemerintah untuk legitimasi dan akses data; pendapatan awal dari pemilik aset, pengembang, EPC, operator; B2G berbayar dan integrasi skala program setelah dasar hukum PLTS 100 GW jelas.
- Proposal diperbarui (35 halaman): Bab 1.1 (dasar hukum belum final), 3.1-3.4 (pelanggan awal dan mitra pilot), 4.5 (harga per kWp, pembanding O&M Pulau Sembur), 4.7 (model bisnis dan skenario pendapatan 500/2.000/8.000 lokasi, tanpa klaim 80.000 koperasi), 4.8 (risiko baru), 4.9 baru (Tabel 4.7 regulasi, Tabel 4.8 jalur adopsi), 5.1 (11 pertanyaan wawancara termasuk calon pembayar), jadwal, penutup, pustaka dan lampiran.
- Subbab 4.9 proposal ditulis ulang menjadi "Strategi Menghadapi Ketidakpastian Regulasi": tabel 4 baris (dasar hukum, kepemilikan aset, keselamatan kelistrikan, layanan digital) dengan kolom "cara menyikapi", plus penutup bahwa pilot dapat menghasilkan data bagi pembahasan aturan (dengan kata "pada sumber yang ditelaah").
