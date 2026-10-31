"""Uji silang model baterai pada data sel LFP nyata yang independen (T5).

Dataset: HUST, 77 sel LFP/grafit 1,1 Ah diuji pada 30 °C sampai akhir umur
(Ma dkk., 2022; Mendeley Data doi:10.17632/nsc7hnsg4s.2, CC BY 4.0). Sel berbeda dari sel
Sony-Murata yang menjadi dasar simulator, sehingga tidak melingkar.

Pemetaan ke fitur model (ASUMSI, dilaporkan bersama hasil):
- satu siklus uji = satu hari operasi PLTS, sehingga 7 siklus = satu catatan mingguan;
- kapasitas terbaca = kapasitas pengosongan terukur / kapasitas awal sel (median 5 siklus pertama),
  sama seperti SOH di simulator. Kapasitas awal sel HUST sekitar 1,19 Ah, di atas nominal 1,1 Ah.
Uji dipercepat (pengisian 5C) dan kapasitas anjlok di akhir umur, berbeda dari pola simulasi.

Jalankan: python -m baterai.uji_silang  (butuh analisis/data/hust/hust_data.zip)
"""

import io
import json
import pickle
import zipfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import average_precision_score

from . import parameter as P
from .latih import KELUARAN, MODEL, buat_fitur, buat_label, metrik_klasifikasi

HUST = Path(__file__).resolve().parent.parent / "data" / "hust"
ZIP = HUST / "hust_data.zip"
CACHE = HUST / "kapasitas.csv"
SIKLUS_PER_MINGGU = 7


class _UnpicklerTerbatas(pickle.Unpickler):
    """Pickle dari sumber luar bisa menjalankan kode; hanya izinkan kelas data pandas/numpy."""

    def find_class(self, module: str, name: str):
        akar = module.split(".")[0]
        if akar in {"pandas", "numpy"} or (module == "builtins" and name in {"dict", "list", "tuple", "slice", "range"}):
            return super().find_class(module, name)
        raise pickle.UnpicklingError(f"kelas tidak diizinkan: {module}.{name}")


def kapasitas_siklus(data: dict) -> list[tuple[int, float]]:
    """Kapasitas pengosongan (Ah) per siklus dari integrasi arus negatif terhadap waktu."""
    hasil = []
    for siklus in sorted(data):
        df = data[siklus]
        arus = df["Current (mA)"].to_numpy() / 1000
        waktu = df["Time (s)"].to_numpy()
        dt = np.diff(waktu, prepend=waktu[0])
        hasil.append((int(siklus), float(np.sum(np.where(arus < 0, -arus, 0) * dt) / 3600)))
    return hasil


def baca_kapasitas() -> pd.DataFrame:
    if CACHE.exists():
        return pd.read_csv(CACHE)
    baris = []
    with zipfile.ZipFile(ZIP) as z:
        for nama in sorted(n for n in z.namelist() if n.endswith(".pkl")):
            sel = Path(nama).stem
            isi = _UnpicklerTerbatas(io.BytesIO(z.read(nama))).load()
            baris += [(sel, s, q) for s, q in kapasitas_siklus(isi[sel]["data"])]
    df = pd.DataFrame(baris, columns=["sel", "siklus", "kapasitas_ah"])
    df.to_csv(CACHE, index=False)
    return df


def ke_catatan_mingguan(kap: pd.DataFrame) -> pd.DataFrame:
    """Ubah kapasitas per siklus menjadi format catatan mingguan simulator."""
    keluar = []
    for i, (sel, d) in enumerate(kap.groupby("sel", sort=True)):
        d = d.sort_values("siklus")
        awal = float(np.median(d.kapasitas_ah.to_numpy()[:5]))
        soh = d.kapasitas_ah.to_numpy() / awal
        # Median 5 siklus agar satu pembacaan aneh tidak dianggap akhir umur.
        soh_halus = pd.Series(soh).rolling(5, min_periods=1).median().to_numpy()
        lewat = np.flatnonzero(soh_halus <= P.SOH_AKHIR_UMUR)
        hari_gagal = int(d.siklus.iloc[lewat[0]]) if lewat.size else -1
        mingguan = d.iloc[SIKLUS_PER_MINGGU - 1::SIKLUS_PER_MINGGU]
        if hari_gagal >= 0:
            mingguan = mingguan[mingguan.siklus <= hari_gagal]
        keluar.append(pd.DataFrame({
            "baterai": i,
            "sel": sel,
            "hari": mingguan.siklus.to_numpy(),
            "soh_bms": mingguan.kapasitas_ah.to_numpy() / awal,
            "hari_gagal": hari_gagal,
            "sebab_gagal": "aus" if hari_gagal >= 0 else "",
        }))
    return pd.concat(keluar, ignore_index=True)


def main() -> None:
    catatan = ke_catatan_mingguan(baca_kapasitas()).sort_values(["baterai", "hari"]).reset_index(drop=True)
    model = joblib.load(MODEL)
    fitur = buat_fitur(catatan)
    label = buat_label(catatan)
    y = label.gagal_horizon.to_numpy()
    p = model["klasifikasi"].predict_proba(fitur[model["fitur"]])[:, 1]

    hasil = {
        "dataset": "HUST, 77 sel LFP/grafit 1,1 Ah, 30 °C (Ma dkk., 2022; doi:10.17632/nsc7hnsg4s.2, CC BY 4.0)",
        "pemetaan": "1 siklus uji = 1 hari operasi; SOH relatif kapasitas awal sel",
        "jumlah_sel": int(catatan.baterai.nunique()),
        "sel_mencapai_akhir_umur": int((catatan.groupby("baterai").hari_gagal.first() >= 0).sum()),
        "jumlah_catatan": int(len(catatan)),
        "positif": int(y.sum()),
        "pr_auc": round(float(average_precision_score(y, p)), 3) if y.any() else None,
        "per_ambang": metrik_klasifikasi(y, p, label.sebab_gagal.to_numpy()),
        "median_p_pada_positif": round(float(np.median(p[y == 1])), 3) if y.any() else None,
    }
    path = KELUARAN / "metrik.json"
    metrik = json.loads(path.read_text(encoding="utf-8"))
    metrik["uji_silang"] = hasil
    path.write_text(json.dumps(metrik, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(hasil, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
