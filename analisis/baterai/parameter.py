"""Parameter simulator degradasi baterai LFP (T3).

Model kapasitas: sel LFP-grafit Sony-Murata 3 Ah dari NREL BLAST-Lite (BSD-3-Clause),
berkas blast/models/lfp_gr_SonyMurata3Ah_2018.py (Paul Gasper, NREL).
- Data penuaan kalender: Naumann dkk. (2018), J. Energy Storage 17, doi:10.1016/j.est.2018.01.019
- Data penuaan siklus: Naumann dkk. (2020), J. Power Sources 451, doi:10.1016/j.jpowsour.2019.227666
- Identifikasi model kapasitas: Gasper dkk. (2022), J. Electrochem. Soc., doi:10.1149/1945-7111/ac86a8
Batas model menurut sumbernya: siklus hanya diuji pada 25 dan 45 °C, dan suhu tidak memengaruhi
laju degradasi siklus. Nilai di bawah disalin apa adanya.

Parameter skenario PLTS desa (bagian bawah) adalah ASUMSI purwarupa, bukan hasil pengukuran,
dan ditampilkan sebagai asumsi di halaman Model Baterai (P10).
"""

# --- Model kapasitas BLAST-Lite (disalin, jangan diubah) ---
Q1_B0 = 0.989687151293590
Q1_B1 = -2881067.56019324
Q1_B2 = 8742.06309157261
Q2 = 0.000130510034211874
Q3_B0 = 0.000332850281062177
Q3_B1 = 734553185711.369
Q3_B2 = -2.82161575620780e-06
Q3_B3 = -3284991315.45121
Q3_B4 = 0.00127227593657290
Q5_B0 = -6.81260579372875e-06
Q5_B1 = 2.59615973160844e-05
Q5_B2 = 2.11559710307295e-06
Q6 = 1.12847759334355

# Potensial anoda grafit dari SOC: Safari & Delacourt (2011), J. Electrochem. Soc. 158(5) A562,
# seperti dipakai BLAST-Lite (blast/models/degradation_model.py, _get_Ua).
XA_MIN, XA_MAX = 8.5e-3, 0.78

# --- Ambang ---
# Akhir umur = kapasitas 80% dari awal (definisi umum untuk baterai stasioner).
SOH_AKHIR_UMUR = 0.80
# Horizon label prediksi = 26 minggu. Uji 30 Okt 2026: untuk LFP yang menua pelan, horizon 8 minggu
# (Aitio & Howey 2021, baterai timbal-asam) hanya mencapai PR-AUC 0,45; 26 minggu memberi waktu
# koperasi untuk menganggarkan dan mengadakan baterai pengganti.
HORIZON_HARI = 182

# --- Skenario PLTS desa: ASUMSI ---
HARI_SIMULASI = 15 * 365            # horizon simulasi per baterai
SUHU_RATA_C = (27.0, 38.0)          # suhu rata ruang baterai tropis tanpa pendingin, seragam
SUHU_MUSIMAN_C = 2.0                # amplitudo variasi tahunan
SUHU_HARIAN_SD_C = 1.0              # variasi acak harian
DOD_RATA = (0.40, 0.95)             # kedalaman pengosongan harian rata-rata, seragam
DOD_HARIAN_SD = 0.12                # variasi relatif harian (hari mendung lebih dalam)
JAM_PENGISIAN = 6.0                 # jam matahari efektif
JAM_PENGOSONGAN = 12.0              # beban malam
# Pengali laju degradasi per baterai = variasi mutu antarsel. Median 1 (model sumber apa adanya);
# dengan skenario di atas median umur sekitar 10 tahun.
SKALA_DEGRADASI_MEDIAN = 1.0
SKALA_DEGRADASI_SD_LOG = 0.35
# Kerusakan mendadak (sel/BMS) yang tidak terlihat dari tren kapasitas: hazard harian dasar,
# naik saat kapasitas turun dan suhu tinggi. Dikalibrasi agar sekitar 20% kegagalan bersifat mendadak.
HAZARD_DASAR = 3e-6
HAZARD_KENAIKAN_PER_RUGI = 15.0     # pengali eksponensial terhadap (1 - SOH)
HAZARD_SUHU_REF_C = 30.0
HAZARD_SUHU_PER_10C = 2.0           # hazard berlipat 2 tiap +10 °C
# Pembacaan SOH oleh BMS tidak sempurna.
SOH_BMS_SD = 0.01
