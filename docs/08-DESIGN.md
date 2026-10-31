---
version: alpha
name: "SuryaJaga"
description: "Tenang, lembut, padat data; dasbor pengawas aset energi yang bisa dipercaya"
colors:
  canvas: "#F4F4F3"
  surface: "#FFFFFF"
  surface-muted: "#ECECEA"
  surface-inverse: "#12272D"
  on-surface: "#141414"
  on-surface-muted: "#6B6B68"
  on-inverse: "#FFFFFF"
  on-inverse-muted: "#A9C3CA"
  border: "#E2E2DF"
  primary: "#0E7490"
  primary-hover: "#0B5E75"
  on-primary: "#FFFFFF"
  accent-fill: "#0891B2"
  accent-soft: "#E6F4F7"
  neutral-fill: "#DCE3E5"
  status-ok: "#146C34"
  status-ok-soft: "#E8F5EC"
  status-warn: "#94580A"
  status-warn-soft: "#FDF4DC"
  status-crit: "#B91C1C"
  status-crit-soft: "#FCE9E9"
  focus: "#1D4ED8"
typography:
  display:
    fontFamily: Onest
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  title:
    fontFamily: Onest
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  metric:
    fontFamily: Onest
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Onest
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 10px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
  panel:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-muted-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label}"
  card-highlight:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-highlight-muted:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse-muted}"
    typography: "{typography.body}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 44px
  chip-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-ok:
    backgroundColor: "{colors.status-ok-soft}"
    textColor: "{colors.status-ok}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-warn:
    backgroundColor: "{colors.status-warn-soft}"
    textColor: "{colors.status-warn}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-crit:
    backgroundColor: "{colors.status-crit-soft}"
    textColor: "{colors.status-crit}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  divider:
    backgroundColor: "{colors.border}"
  chart-fill:
    backgroundColor: "{colors.accent-fill}"
  chart-compare:
    backgroundColor: "{colors.neutral-fill}"
  focus-ring:
    backgroundColor: "{colors.focus}"
---

# SuryaJaga — Design System

> Sumber kebenaran untuk semua kerja UI. Format: [Google DESIGN.md spec](https://github.com/google-labs-code/design.md) (alpha). Token di YAML di atas adalah nilai resmi; jangan pakai warna, ukuran, radius, atau shadow di luar token.
> Status: ✅ ACC 30 Okt 2026 · Kemiripan referensi: belum diukur (tanpa preview) · Lint: 0 error, 0 warning
> Template: **Soft Op Dashboard** (asal K-DASP), warna merek: dipilih AI dari domain (biru petrol, lihat Colors).

## Overview

Tenang, lembut, padat data, dan bisa dipercaya. Pengguna utama adalah pengawas program PLTS koperasi yang membuka dasbor untuk mencari PLTS yang butuh tindakan, lalu memeriksa buktinya sebelum mengirim peringatan. Kesan yang ingin muncul: sistem instansi yang rapi dan jujur soal data, bukan aplikasi promosi. Kepadatan sedang ke padat.

- **Referensi:** template Soft Op Dashboard (`~/.claude/skills/setup-project-00/design-templates/soft-ops-dashboard/`), layar acuan `preview/monitor.png`, `preview/telusuri.png`.
- **Dihindari:** gradien ungu-biru, kuning/oranye "energi surya" klise, ikon emoji, ilustrasi dekoratif panel surya, warna status dipakai untuk dekorasi.
- **Mode:** light.

## Colors

Satu warna merek biru petrol untuk aksi dan aksen; warna kuat lain hanya dari status kondisi PLTS.

- **Primary (#0E7490):** tombol utama (maks satu per layar), teks aksen kecil, tautan. Kontras dengan putih ≥ 4,5:1.
- **Primary-hover (#0B5E75):** hover tombol utama.
- **Accent-fill (#0891B2):** garis grafik cahaya malam, batang metrik, ikon besar, sel skor lokasi tertinggi. Tidak untuk teks di bawah 18px.
- **Accent-soft (#E6F4F7):** baris terpilih, chip sumber data, latar sel peta yang dipilih.
- **Surface-inverse (#12272D) / on-inverse-muted (#A9C3CA):** satu kartu sorotan gelap per layar (mis. PLTS paling kritis di P2, kesimpulan uji satelit di P9).
- **Neutral-fill (#DCE3E5):** garis dasar dan pembanding di grafik (periode sebelum, desa pembanding).
- **Canvas (#F4F4F3) / Surface (#FFFFFF) / Surface-muted (#ECECEA):** kanvas, kartu putih, panel pengelompok.
- **On-surface (#141414) / On-surface-muted (#6B6B68):** teks utama / pendukung. **Border (#E2E2DF):** garis halus.
- **Status:** ok (#146C34) = normal, warn (#94580A) = waspada/baterai melemah, crit (#B91C1C) = kritis/dugaan padam. Selalu disertai teks, tidak pernah warna saja. Merek tidak pernah berarti "berhasil" atau "bahaya" (hue merek 192°, jauh dari hue status).
- Warna masuk lewat data (status, skor, grafik), bukan lewat tombol atau ikon dekoratif.

## Typography

Onest untuk semua teks, JetBrains Mono untuk ID PLTS, kode sel, dan nilai teknis. Dimuat lewat `next/font` (self-host) dengan `display: swap`. Angka memakai fitur tabular (`font-variant-numeric: tabular-nums`) di metrik dan tabel.

- **Display 32px:** judul halaman (h1).
- **Title 18px:** judul kartu dan panel.
- **Metric 28px:** angka kunci (jumlah PLTS kritis, minggu tersisa baterai, skor lokasi).
- **Body 14px** di desktop, minimal 16px di mobile; **Label 12px** untuk keterangan, header tabel, badge; **Mono 12px** untuk ID.

## Layout

- **Frame:** penuh layar tanpa margin dan sudut membulat; kanvas `canvas`; padding konten 32px desktop, 16px mobile; `min-h-[100dvh]`.
- **Sidebar pengawas** (dari `starter/src/components/shell/app-shell.tsx`): 264px, sticky, ciut 76px otomatis di 768-1199px; grup "Pantau", "Rencana", "Bukti" sesuai 01-PRD §5b; bawah: Panduan demo + kartu akun "Pengawas demo" (aksi Ganti peran).
- **Top bar 85px:** tombol ciut, breadcrumb "SuryaJaga / Halaman", badge "Data simulasi", tombol periode "Snapshot 30 Okt 2026", notifikasi berangka (peringatan baru), avatar.
- **Grid:** 12 kolom, gap 16px. Panel `surface-muted` radius 24px padding 20px mengelompokkan 2-4 kartu putih.
- **Breakpoint & navigasi:**

| Nama | Lebar | Grid | Navigasi |
|---|---|---|---|
| Mobile | < 768px | 1 kolom, gutter 16px | Tombol menu 44×44 + drawer `<dialog>` |
| Tablet | 768–1199px | 2 kolom | Sidebar ciut 76px |
| Desktop | ≥ 1200px | 12 kolom | Sidebar 264px |

- **Drawer:** kiri, ≤ 85vw, backdrop 40% + blur; tutup via backdrop/close/Esc/pilih item; fokus masuk, terkunci, kembali ke tombol; scroll terkunci.
- **Urutan konten mobile P2:** kartu sorotan kritis → metrik → peta (tinggi 60dvh) → daftar ringkas.
- **Target sentuh:** ≥ 44px di bawah 1200px. Tanpa scroll horizontal di 360px; tabel jadi daftar kartu di mobile.
- **Tampilan operator (P12-P14):** tanpa sidebar; bingkai `solo-frame` lebar maks 480px di tengah, meniru aplikasi pesan: header nama koperasi + Ganti peran, gelembung pesan, input bawah sticky.

| Jenis halaman / layar | Tugas | Pola layout | Info utama (besar) | Info pendukung (kecil) |
|---|---|---|---|---|
| Pilih peran (P1) | Masuk | `solo-frame`, dua kartu putih berdampingan (bertumpuk di mobile) | Nama peran + tugasnya | Badge data simulasi |
| Monitor (P2) | Menemukan masalah | Pola **Monitor**: 4 kartu metrik → panel peta (8 kol) + kartu sorotan kritis (4 kol) → daftar ringkas | Jumlah kritis, peta status | Waktu snapshot, sumber lapisan |
| Detail (P3, P6, P8) | Memahami dan bertindak | Pola **Telusuri**: kiri 5 kol status + alasan + aksi; kanan 7 kol bukti (grafik, prediksi) | Status + alasan, minggu tersisa | Sumber, metodologi |
| Daftar (P4, P5) | Membandingkan | Tabel di kartu putih, filter pill di atas, angka rata kanan | Status, minggu tersisa | Kabupaten, waktu |
| Rencana (P7) | Memilih lokasi | Pola **Rencana**: toggle skor (kelayakan/risiko/gabungan) → peta sel (8 kol) + 5 teratas (4 kol) | Skor gabungan | Bobot, sumber |
| Bukti (P9-P11) | Meyakinkan | Kartu sorotan kesimpulan → grafik per desa → tabel semua hasil | Kesimpulan + angka | Metode, tanggal data |
| Percakapan (P13) | Memperbaiki | Gelembung pesan; langkah bernomor; jawaban cepat pill | Langkah perbaikan | Keyakinan dalam bahasa awam |
| Placeholder / sistem (P14-P17) | Kembali | Placeholder template | Judul + deskripsi | Badge "Belum tersedia" |

## Elevation & Depth

Kedalaman dari lapisan warna (kanvas → panel → kartu), bukan bayangan. Satu-satunya bayangan: dialog dan drawer memakai backdrop, popover peta memakai garis `border`.

## Shapes

- **Radius:** sm 10px (blok kecil, sel), md 16px (kartu akun, input), lg 24px (kartu, panel), full (tombol, badge, chip).
- **Ikon:** lucide-react, outline, stroke 1.75, 19px di navigasi, 16px di badge. Tanpa emoji sebagai ikon.
- **Penanda peta:** lingkaran 14px berwarna status dengan garis putih 2px, label teks di popover; tanpa ikon panel surya kartun.
- **Gambar/ilustrasi:** tidak dipakai.

## Components

- **Implementasi acuan:** `~/.claude/skills/setup-project-00/design-templates/soft-ops-dashboard/starter/` (salin `src/`, ikuti `starter/README.md` langkah 1-6). Sumber komponen = kelas CSS template + `starter/src/components/ui` (Icon, Badge, Modal). **Bukan shadcn, bukan sidebar-21st, tanpa framer-motion.** Pola kartu metrik, sorotan, tabel, toggle dari `starter/reference/kdasp-globals.css`.
- **Kartu metrik:** ikon dalam lingkaran 36px + label; angka `metric`; delta dengan arti (naik jumlah kritis = `status-crit`).
- **Kartu sorotan (gelap):** satu per layar. P2: "PLTS Parang: dugaan padam 41 malam" + 3 poin bukti + tombol "Buka detail". P9: kesimpulan uji satelit.
- **Badge status:** pill bertitik: "Normal", "Waspada", "Kritis", "Dalam pemulihan", "Data contoh", "Simulasi".
- **Grafik deret cahaya malam:** SVG; garis `accent-fill`, garis dasar `neutral-fill` putus-putus, titik anomali `status-crit`, area awan diarsir; sumbu tanggal; nilai terbaca saat hover/fokus.
- **Prediksi baterai:** peluang mencapai akhir umur dalam 26 minggu + perkiraan minggu tersisa dengan rentang ± MAE (19 minggu); nilai ≥ 100 ditampilkan "lebih dari 2 tahun"; grafik riwayat kapasitas; tiga fitur utama.
- **Chip sumber:** `mono` di `accent-soft`, bisa diklik ke P11.
- **Tombol:** pill 44px; satu primary per layar ("Kirim peringatan" di P3). State: hover `primary-hover` 150ms ease-out, active sedikit lebih gelap + `translate-y-px` hanya di `motion-safe`, focus ring 2px `focus` offset 2px, disabled opacity 0.5, loading spinner + label tetap.
- **Dialog keputusan (kirim peringatan):** dialog native; ringkasan isi pesan yang akan diterima operator ditampilkan sebelum kirim (konsekuensi terlihat).
- **Gelembung pesan operator:** asisten di `surface`, operator di `accent-soft`; langkah bernomor; label "Diteruskan ke teknisi" berstatus warn.
- **Motion:** 150–250ms ease-out; hormati `prefers-reduced-motion`.

## Do's and Don'ts

**Prinsip UX (wajib, semua layar)**

| # | Prinsip | Penerapan di projek ini |
|---|---|---|
| 1 | Desain untuk sistem | Nama desa panjang dipotong dengan tooltip; P2 diuji dengan 3 titik dan 300 titik; P9 menampilkan desa tanpa data berkualitas |
| 2 | Konsisten | Satu grid 12 kolom, Onest, lucide stroke 1.75, satu gaya badge status di semua halaman |
| 3 | Hierarki | Angka kunci (`metric`) lebih besar dari label; status selalu di kiri atas detail |
| 4 | Info di titik keputusan | Di P3, bukti (grafik + prediksi) berdampingan dengan tombol "Kirim peringatan"; keyakinan model tampil di samping prediksi |
| 5 | Konsekuensi terlihat sebelum aksi | Dialog kirim peringatan memperlihatkan isi pesan dan penerima; "Tandai selesai" menjelaskan status peta akan berubah |
| 6 | Kurangi hambatan | Jawaban cepat di P13; tombol aksi utama tetap terlihat saat scroll di mobile |
| 7 | Hapus yang berlebihan | Tanpa sapaan, tanpa kartu promosi; ID teknis kecil `mono` |
| 8 | Detail premium | Divider `border` halus, spacing menyatakan hubungan, angka tabular |
| 9 | Aksi utama jelas tapi tidak agresif | Satu primary pill per layar; aksi lain secondary atau menu ⋯ |

**Anti tampilan AI (Standar UI A1-A13)**
- A1: ikon hanya lucide; tanpa emoji di tombol, label, pesan asisten.
- A2: hanya token di atas; warna kuat hanya status dan grafik.
- A3: P2 hanya memantau; analisis mendalam di P3/P9, bukan ditumpuk di peta.
- A4: sidebar hanya 7 halaman inti; Pengaturan Ambang lewat kartu akun.
- A5: aksi sekunder (salin tautan, ekspor) di menu ⋯; angka rata kanan.
- A6: tanpa kartu atau badge yang tidak melakukan apa-apa.
- A7: kirim peringatan memakai dialog, bukan panel samping kosong.
- A8: perbandingan desa uji di tabel yang bisa diurutkan + grafik deret waktu, bukan grafik batang generik.
- A9: tanpa em-dash di teks UI; rentang memakai tanda hubung ("2015-2026").
- A10: nama tempat nyata (Parang, Pulau Sembur, Karimunjawa); nama orang contoh realistis dan berlabel contoh (mis. "Sutrisno, Koperasi Desa Merah Putih Parang (contoh)"); angka tidak dibulatkan rapi.
- A11: `min-h-[100dvh]`, font lewat `next/font`.
- A13: semua elemen yang bisa diklik punya hover, active, focus-visible dengan transisi 150-250ms; elemen yang tidak bisa diklik tanpa panah/kursor pointer.

**Aturan template**
- Satu primary per layar; satu kartu sorotan gelap per layar.
- Warna hanya dari token; tidak ada hex di komponen.
- Setiap klaim sistem punya sumber yang bisa diklik; data simulasi dan contoh diberi chip label.

**Aksesibilitas**
- Do: kontras teks ≥ 4,5:1; focus ring selalu terlihat; peta punya daftar alternatif yang bisa dinavigasi keyboard; `aria-label` untuk ikon tanpa teks; status tidak hanya warna.
- Don't: menyampaikan status hanya lewat warna titik peta.

**Checklist review UI**
- [ ] Hanya memakai token dari file ini
- [ ] Semua state komponen ada (hover, focus, disabled, loading, empty, error)
- [ ] Responsif di 375px, 768px, 1440px tanpa scroll horizontal
- [ ] Lulus Prinsip UX 1–9 dan Anti tampilan AI
- [ ] `lint` 0 error dan tanpa warning `contrast-ratio`
- [ ] Shell lolos verifikasi berdampingan dengan `preview/` template (1440, 768, 375)

## Deviations from Reference

| Aspek | Referensi | Di sini | Alasan |
|---|---|---|---|
| Warna merek | Oranye K-DASP #C2410C | Biru petrol #0E7490 | Domain energi; oranye dekat warna status waspada dan klise "surya" |
| Layar operator | Tidak ada | Tampilan pesan `solo-frame` 480px | Kebutuhan PRD P12-P13 (simulasi WhatsApp) |
| Panel graph | Graph node | Peta MapLibre | Data PRD berbasis lokasi |

## Implementation

Token tidak ditulis ulang di kode; hasilkan dari file ini:

```bash
npx -p @google/design.md designmd lint docs/08-DESIGN.md
npx -p @google/design.md designmd export --format css-tailwind docs/08-DESIGN.md > web/src/styles/theme.css
```

Setelah export, lepas token spacing yang bentrok dengan Tailwind v4 di `globals.css` (`@theme inline { --spacing-xs: initial; ... --spacing-2xl: initial; }`), sesuai TEMPLATE.md §3a. Preview dan penyamaan ≥ 95% bisa dijalankan nanti lewat skill `project-design`.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 30 Okt 2026 | Dokumen awal dari template Soft Op Dashboard, kemiripan belum diukur. Lint: 0 error, 0 warning |
