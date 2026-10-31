"""Parameter estimasi kelayakan dan anggaran PLTS desa (F9, 03-ARCHITECTURE Q13).

Setiap angka bersumber atau ditandai ASUMSI. Wilayah demo: Kabupaten Maluku Barat Daya, daerah tertinggal
menurut Perpres 63/2020.
"""

# --- Wilayah demo (batas kotak, derajat) ---
WILAYAH = {"id": "maluku-barat-daya", "nama": "Kabupaten Maluku Barat Daya", "provinsi": "Maluku",
           "barat": 125.6, "timur": 130.0, "selatan": -8.45, "utara": -6.95,
           "sumber_3t": "Perpres 63/2020 tentang Penetapan Daerah Tertinggal 2020-2024, Lampiran no. 29"}

# --- Permukiman ---
# WorldPop 2020 constrained 100 m (Bondarenko dkk., 2020): penduduk hanya di piksel berbangunan.
PENDUDUK_MIN = 150          # ASUMSI: di bawah ini (±33 KK) lebih cocok listrik surya rumahan daripada PLTS komunal
JARAK_GABUNG_PIKSEL = 2     # piksel berpenduduk berjarak ≤ 2 piksel (~200 m) dianggap satu permukiman
ART = 4.52                  # rata-rata anggota rumah tangga Maluku 2023 (BPS, lewat Databoks)
RADIUS_NAMA_KM = 3.0        # nama desa OSM terdekat dalam radius ini

# --- Kebutuhan dan ukuran sistem ---
KWH_PER_KK_HARI = 1.5       # PLTS Parang, Karimunjawa (detik.com, 12 Mar 2022)
PR = 0.75                   # ASUMSI: rasio kinerja sistem off-grid (rugi suhu, kabel, inverter, pengisian)
OTONOMI_HARI = 1.0          # ASUMSI: baterai menanggung kebutuhan 1 hari tanpa matahari
DOD = 0.8                   # ASUMSI: kedalaman pengosongan LFP yang dipakai
FAKTOR_BEBAN = 0.22         # faktor beban mini-grid, ESMAP (2022): beban rata-rata / beban puncak

# --- Biaya (ESMAP, 2022, Mini Grids for Half a Billion People, doi:10.1596/38082) ---
# Survei 53 mini-grid tanpa pencilan > US$8.000: median US$3.908, rata-rata US$4.298 per kW_firm.
# Sebaran lognormal dari median dan rata-rata itu: sigma = sqrt(2 ln(rata-rata / median)).
CAPEX_MEDIAN_USD_KW = 3908.0
CAPEX_RATA_USD_KW = 4298.0
OPEX_USD_PELANGGAN_TAHUN = 80.0      # ESMAP (2022)
BATERAI_USD_KWH = 297.0              # baterai Li-ion mini-grid terbaik 2021, ESMAP (2022)
KURS = 18116.0                       # JISDOR 26 Okt 2026
# ASUMSI: logistik pulau terpencil menaikkan biaya 2% per jam waktu tempuh ke kota, maksimum +50%.
LOGISTIK_PER_JAM = 0.02
LOGISTIK_MAKS = 0.5
SIMULASI = 5000                      # jumlah sampel Monte Carlo
BENIH = 26                           # benih acak tetap agar hasil dapat diulang

# --- Keuangan ---
BUNGA = 0.10                # ASUMSI: tingkat diskonto
UMUR_TAHUN = 20             # ASUMSI: umur proyek (umur panel ±25 tahun)
GANTI_BATERAI_TAHUN = 10    # ASUMSI: baterai LFP diganti sekali di tahun ke-10

# --- Pembanding genset (sama dengan analisis kelayakan proposal) ---
SFC_L_KWH = 0.29            # Saputra dkk. (2026), PLTD Lamahora, nilai tengah 0,25-0,32
HARGA_SOLAR = 23700.0       # Dexlite, 1 Okt 2026 (Investor Trust, 2026c)
KG_CO2_PER_L = 2.69         # 10,19 kg CO2/galon (EIA, 2024)

# --- Risiko mangkrak (aturan, bukan model latih; data PLTS mangkrak per lokasi belum cukup) ---
TEMPUH_SEDANG_JAM = 6.0     # ASUMSI: di atas ini teknisi sulit datang dalam satu hari
TEMPUH_TINGGI_JAM = 12.0    # ASUMSI
KK_KECIL = 60               # ASUMSI: iuran dari < 60 KK sulit menutup penggantian komponen (Duthie dkk., 2023)
JARINGAN_DEKAT_KM = 5.0     # ASUMSI: jaringan PLN sedekat ini dapat membuat PLTS tidak terpakai (EnDev Indonesia, 2017)
