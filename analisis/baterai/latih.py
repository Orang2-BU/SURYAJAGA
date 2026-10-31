"""Latih dan evaluasi model prediksi akhir umur baterai (T4).

Primitif AI (03-ARCHITECTURE §5): ya/tidak gagal dalam 26 minggu + p, dan perkiraan minggu tersisa.
Versi 2 hanya memakai fitur kondisi kapasitas. Versi 1 (ditambah suhu, DoD, siklus, umur) unggul di
simulasi tetapi gagal di sel LFP nyata HUST (PR-AUC 0,167) karena menghafal laju penuaan simulator;
pilihan ini dibuat setelah melihat hasil HUST (keputusan Q9, 03-ARCHITECTURE).
Split per baterai agar catatan satu baterai tidak bocor ke data latih dan uji sekaligus.
Ambang status tidak ditentukan di sini; web/api yang memutuskan dari p.

Jalankan: python -m baterai.latih  (butuh analisis/data/baterai_sim.csv.gz dari baterai.simulasi)
"""

import hashlib
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import average_precision_score, mean_absolute_error, precision_score, recall_score
from sklearn.model_selection import GroupShuffleSplit

from . import parameter as P
from plts import PLTS

ANALISIS = Path(__file__).resolve().parent.parent
DATA_SIM = ANALISIS / "data" / "baterai_sim.csv.gz"
MODEL = ANALISIS / "models" / "baterai-v2.joblib"
KELUARAN = ANALISIS.parent / "web" / "public" / "data" / "baterai"

FITUR = ["soh_bms", "tren_soh", "proyeksi_minggu"]
NAMA_FITUR = {
    "soh_bms": "Kapasitas terbaca BMS (rata-rata 26 minggu)",
    "tren_soh": "Laju penurunan kapasitas (52 minggu)",
    "proyeksi_minggu": "Proyeksi minggu sampai kapasitas 80%",
}
# Jendela panjang karena kapasitas LFP turun lebih pelan daripada derau baca BMS per minggu.
JENDELA_SOH = 26    # minggu
JENDELA_TREN = 52   # minggu
PROYEKSI_MAKS = 520  # minggu
AMBANG_LAPORAN = (0.5, 0.7, 0.9)  # titik evaluasi, bukan ambang status
SEED = 11


def buat_fitur(df: pd.DataFrame) -> pd.DataFrame:
    """Fitur per catatan mingguan, hanya dari masa lalu baterai itu sendiri. df harus terurut baterai, hari."""
    def rol(s: pd.Series, jendela: int) -> pd.Series:
        return s.groupby(df.baterai).transform(lambda v: v.rolling(jendela, min_periods=4).mean())

    x = df.hari / 7
    y = df.soh_bms
    soh = rol(y, JENDELA_SOH).fillna(y)
    # Kemiringan regresi SOH terhadap minggu dalam jendela bergulir: cov(x, y) / var(x).
    cov = rol(x * y, JENDELA_TREN) - rol(x, JENDELA_TREN) * rol(y, JENDELA_TREN)
    var = rol(x * x, JENDELA_TREN) - rol(x, JENDELA_TREN) ** 2
    tren = (cov / var.replace(0, np.nan)).fillna(0.0)
    proyeksi = ((soh - P.SOH_AKHIR_UMUR) / np.maximum(-tren, 1e-5)).clip(0, PROYEKSI_MAKS)
    return pd.DataFrame({
        "baterai": df.baterai,
        "hari": df.hari,
        "soh_bms": soh,
        "tren_soh": tren,
        "proyeksi_minggu": proyeksi,
        "umur_hari": df.hari,
    })


def buat_label(df: pd.DataFrame) -> pd.DataFrame:
    sisa_hari = np.where(df.hari_gagal >= 0, df.hari_gagal - df.hari, np.inf)
    return pd.DataFrame({
        "gagal_horizon": (sisa_hari <= P.HORIZON_HARI).astype(int),
        "minggu_tersisa": sisa_hari / 7,
        "sebab_gagal": df.sebab_gagal,
    })


def metrik_klasifikasi(y: np.ndarray, p: np.ndarray, sebab: np.ndarray) -> list[dict]:
    hasil = []
    for ambang in AMBANG_LAPORAN:
        prediksi = p >= ambang
        baris = {
            "ambang": ambang,
            "recall": round(float(recall_score(y, prediksi, zero_division=0)), 3),
            "presisi": round(float(precision_score(y, prediksi, zero_division=0)), 3),
        }
        for jenis in ("aus", "mendadak"):
            pilih = (y == 1) & (sebab == jenis)
            baris[f"recall_{jenis}"] = round(float(prediksi[pilih].mean()), 3) if pilih.any() else None
        hasil.append(baris)
    return hasil


def pilih_contoh(kondisi: np.ndarray) -> int:
    """Indeks baris pertama (urut baterai, hari) yang memenuhi kondisi; deterministik."""
    kandidat = np.flatnonzero(kondisi)
    if kandidat.size == 0:
        raise RuntimeError("tidak ada catatan uji yang cocok untuk contoh prediksi")
    return int(kandidat[0])


def prediksi_plts(mentah, fitur, p, minggu, uji_idx) -> list[dict]:
    """Prediksi untuk setiap PLTS di plts.json dari lintasan baterai simulasi yang kondisinya sesuai laporan.

    Tidak ada PLTS yang punya data BMS sungguhan. PLTS contoh memang fiktif; untuk PLTS kasus nyata, lintasan
    simulasi dipakai untuk peragaan dan diberi catatan agar tidak dibaca sebagai pengukuran PLTS tersebut.
    Setiap PLTS memakai baterai simulasi yang berbeda.
    """
    p_uji, umur = p[uji_idx], fitur.umur_hari.to_numpy()[uji_idx]
    baterai_uji = mentah.baterai.to_numpy()[uji_idx]
    syarat = {
        # Kasus nyata: baterai rusak atau PLTS mangkrak bertahun-tahun -> dekat akhir umur.
        "parang": (p_uji >= 0.9) & (umur > 4 * 365),
        "lakarama": (p_uji >= 0.9) & (umur > 4 * 365),
        "burung-loe": (p_uji >= 0.9) & (umur > 4 * 365),
        # Menyala setelah perbaikan 2022 (sekitar 4 tahun) dan PLTS baru Desember 2025.
        "batu-bingkung": (p_uji < 0.1) & (umur > 3 * 365) & (umur < 5 * 365),
        "sembur": (p_uji < 0.05) & (umur < 365) & (umur > 200),
        "karimunjawa-contoh": (p_uji >= 0.7) & (p_uji < 0.9),
        "genting-contoh": (p_uji < 0.2) & (umur > 4 * 365),
    }
    terpakai: set[int] = set()
    keluar = []
    for plts in PLTS:
        i = uji_idx[pilih_contoh(syarat[plts.id] & ~np.isin(baterai_uji, list(terpakai)))]
        terpakai.add(int(mentah.baterai[i]))
        riwayat = mentah[(mentah.baterai == mentah.baterai[i]) & (mentah.hari <= mentah.hari[i])].tail(104)
        baris = {
            "plts_id": plts.id,
            "tersedia": True,
            "label_data": "simulasi",
            "p_gagal_26_minggu": round(float(p[i]), 3),
            "minggu_tersisa": round(float(minggu[i]), 1),
            "fitur": {f: round(float(fitur.at[i, f]), 4) for f in FITUR},
            "riwayat_soh": [{"hari": int(h), "soh_bms": round(float(s), 4)}
                            for h, s in zip(riwayat.hari, riwayat.soh_bms)],
        }
        if plts.label_data == "laporan":
            baris["catatan"] = ("PLTS ini tidak punya data BMS. Riwayat kapasitas diambil dari simulator untuk peragaan, "
                                "dipilih sesuai kondisi di laporan, bukan pengukuran baterai PLTS ini.")
        keluar.append(baris)
    return keluar


def main() -> None:
    mentah = pd.read_csv(DATA_SIM)
    mentah["sebab_gagal"] = mentah.sebab_gagal.fillna("")
    mentah = mentah.sort_values(["baterai", "hari"]).reset_index(drop=True)
    fitur = buat_fitur(mentah)
    label = buat_label(mentah)
    X, y, grup = fitur[FITUR], label.gagal_horizon.to_numpy(), fitur.baterai.to_numpy()

    latih_idx, uji_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(X, y, grup))
    klasifikasi = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, random_state=SEED)
    klasifikasi.fit(X.iloc[latih_idx], y[latih_idx])
    p = klasifikasi.predict_proba(X)[:, 1]

    # Minggu tersisa hanya dilatih pada baterai yang benar-benar gagal dalam horizon simulasi.
    gagal = np.isfinite(label.minggu_tersisa.to_numpy())
    target = np.minimum(label.minggu_tersisa.to_numpy(), 104)
    regresi = HistGradientBoostingRegressor(max_iter=300, learning_rate=0.05, random_state=SEED)
    regresi.fit(X.iloc[latih_idx[gagal[latih_idx]]], target[latih_idx[gagal[latih_idx]]])
    minggu = regresi.predict(X)
    uji_r = uji_idx[gagal[uji_idx] & (label.minggu_tersisa.to_numpy()[uji_idx] <= 26)]

    sebab_uji = label.sebab_gagal.to_numpy()[uji_idx]
    # Pembanding sederhana tanpa ML: kapasitas BMS sudah dekat ambang akhir umur.
    aturan = (fitur.soh_bms.to_numpy()[uji_idx] <= P.SOH_AKHIR_UMUR + 0.02).astype(float)
    sampel = np.random.default_rng(SEED).choice(uji_idx, size=min(40_000, uji_idx.size), replace=False)
    penting = permutation_importance(klasifikasi, X.iloc[sampel], y[sampel], scoring="average_precision",
                                     n_repeats=3, random_state=SEED)

    metrik = {
        "model": "baterai-v2 (HistGradientBoosting, scikit-learn 1.8, fitur kondisi kapasitas saja)",
        "catatan_metode": ("Versi 1 (ditambah suhu, DoD, siklus, umur): PR-AUC simulasi 0,811 tetapi 0,167 di sel nyata "
                           "HUST. Versi 2 dipilih setelah melihat hasil HUST, sehingga HUST bukan lagi uji buta. "
                           "Ambang status adalah ambang awal yang wajib dikalibrasi dengan data lapangan."),
        "data": "Simulasi berbasis literatur (bukan data lapangan)",
        "hash_data": hashlib.sha256(DATA_SIM.read_bytes()).hexdigest()[:12],
        "horizon_minggu": P.HORIZON_HARI // 7,
        "jumlah_baterai": {"latih": int(np.unique(grup[latih_idx]).size), "uji": int(np.unique(grup[uji_idx]).size)},
        "jumlah_catatan_uji": int(uji_idx.size),
        "positif_uji": int(y[uji_idx].sum()),
        "pr_auc": round(float(average_precision_score(y[uji_idx], p[uji_idx])), 3),
        "per_ambang": metrik_klasifikasi(y[uji_idx], p[uji_idx], sebab_uji),
        "pembanding_tanpa_ml": {
            "aturan": f"kapasitas BMS (rata-rata 26 minggu) <= {P.SOH_AKHIR_UMUR + 0.02:.2f}",
            **{k: v for k, v in metrik_klasifikasi(y[uji_idx], aturan, sebab_uji)[0].items() if k != "ambang"},
        },
        "mae_minggu_tersisa": {"nilai": round(float(mean_absolute_error(target[uji_r], minggu[uji_r])), 2),
                               "cakupan": "catatan uji dari baterai yang gagal dalam 26 minggu"},
        "fitur_penting": [
            {"fitur": f, "nama": NAMA_FITUR[f], "kontribusi": round(float(v), 4)}
            for f, v in sorted(zip(FITUR, penting.importances_mean), key=lambda t: -t[1])
        ],
        "batas_minggu_tersisa": 104,
        "uji_silang": None,
    }

    MODEL.parent.mkdir(exist_ok=True)
    joblib.dump({"klasifikasi": klasifikasi, "regresi": regresi, "fitur": FITUR}, MODEL)
    KELUARAN.mkdir(parents=True, exist_ok=True)
    tulis = lambda nama, isi: (KELUARAN / nama).write_text(  # noqa: E731
        json.dumps(isi, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tulis("metrik.json", metrik)
    tulis("prediksi.json", prediksi_plts(mentah, fitur, p, minggu, uji_idx))
    print(json.dumps({k: metrik[k] for k in ("pr_auc", "per_ambang", "pembanding_tanpa_ml", "mae_minggu_tersisa")},
                     ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
