# Panduan Logo SuryaJaga

> Salinan di repo hanya berisi master utama. Kit lengkap (semua varian, ikon web, papan presentasi, skrip) ada di folder `logo/kit` di luar repo.

**Empat Penjaga.** Empat kuadran menjaga satu titik cahaya. Bintang empat sudut di pusat adalah matahari, takik di tiap sisi adalah penjaga yang mengarah ke dalam.

## Isi kit

| Folder | Isi |
|---|---|
| `master/` | `simbol.svg` (warna), `simbol-kecil.svg` (untuk 32 px ke bawah), varian `-black`, `-white`, `-mono-0e7490`, `-square`, `-app-icon`; lockup horizontal dan bertumpuk dalam versi `warna`, `hitam`, `putih`, `terbalik`; `wordmark.svg`; PNG 512 dan 1024 |
| `web/` | `favicon.ico`, `favicon.svg`, PNG 16/32/48, `apple-touch-icon.png`, `icon-192/512.png`, `maskable-512.png`, `site.webmanifest`, `head-snippet.html` |
| `presentasi/` | `papan-presentasi.html` dan `slide-01..05.png` (makna, ukuran kecil, mockup) |
| `sumber/` | `buat_kit.py` (membangun ulang semua master), `konsep.py` (geometri), `onest-latin.woff2`, `presentasi.json` |

Bangun ulang: `cd sumber && python buat_kit.py`.

## Versi mana dipakai di mana

- **Lockup horizontal warna:** default (kepala web, kop surat, sampul proposal).
- **Lockup bertumpuk:** ruang sempit dan tinggi (poster, spanduk vertikal, stiker).
- **Simbol saja:** bila nama SuryaJaga sudah tertulis di dekatnya (ikon aplikasi, avatar media sosial, papan lokasi PLTS).
- **Simbol kecil:** semua tampilan 32 px ke bawah (favicon, ikon di tabel atau peta). Celah dan takiknya lebih lebar supaya tidak menutup.
- **Terbalik (putih):** di atas latar gelap `#12272D` atau foto gelap.
- **Hitam:** cetak satu warna, stempel, fotokopi.

## Warna

| Nama | HEX | RGB | CMYK (perkiraan) | Pakai untuk |
|---|---|---|---|---|
| Primer | `#0E7490` | 14, 116, 144 | 90, 19, 0, 44 | Simbol |
| Tinta | `#141414` | 20, 20, 20 | 0, 0, 0, 92 | Wordmark |
| Gelap | `#12272D` | 18, 39, 45 | 60, 13, 0, 82 | Latar versi terbalik |
| Putih | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Versi terbalik |

Kontras primer di atas putih 5,4:1 (lolos WCAG AA). Untuk cetak offset, cocokkan dulu ke kipas warna Pantone. Nilai Pantone belum ditetapkan.

## Huruf

Wordmark memakai **Onest SemiBold (600)**, tracking -2%, dengan kerning optis pada `ya`, `aJ` dan `Ja`. Teksnya sudah diubah jadi path, jadi tidak butuh font terpasang. Onest berlisensi SIL Open Font License, jadi boleh dipakai untuk logo. Teks pendamping memakai Onest, sama dengan web.

## Ruang bebas dan ukuran minimum

- **Ruang bebas** di semua sisi minimal **1/4 diameter cakram**. Di dalamnya tidak boleh ada teks, garis atau tepi kertas.
- **Simbol:** minimal 16 px di layar (pakai simbol kecil sampai 32 px) dan 6 mm di cetak.
- **Lockup horizontal:** minimal 120 px lebar di layar dan 30 mm di cetak.
- **Lockup bertumpuk:** minimal 64 px lebar di layar dan 18 mm di cetak.

## Latar yang boleh

Putih, `#ECECEA`, dan foto terang memakai versi warna atau hitam. `#12272D`, `#0E7490` penuh, dan foto gelap memakai versi putih.

## Jangan

- Memutar simbol selain kelipatan 90° (simetrinya terlihat miring).
- Mengubah warna simbol di luar palet, atau memberi gradien, bayangan atau garis tepi.
- Meregangkan, memampatkan, atau mengubah jarak dan ukuran simbol terhadap wordmark.
- Mengetik ulang "SuryaJaga" dengan font lain sebagai pengganti wordmark.
- Mengisi celah atau takik, atau menaruh simbol di dalam bentuk lain (perisai, lingkaran tambahan).
- Memakai simbol biasa di bawah 32 px. Pakai simbol kecil.

## Catatan

- Simbol ini dibuat orisinal untuk SuryaJaga. Pengecekan merek dagang (PDKI Indonesia, pencarian gambar terbalik) belum dilakukan. Lakukan sebelum dipakai di luar lomba.
- Hasil uji: audit SVG simbol 100/100, lockup 97/100 (hanya catatan ukuran file). Favicon 16 dan 32 px sudah dirender dan dicek.
