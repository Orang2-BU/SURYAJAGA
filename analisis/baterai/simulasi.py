"""Simulator degradasi baterai LFP PLTS desa (T3).

Model kapasitas mengikuti NREL BLAST-Lite (lihat parameter.py): rugi kalender berbentuk sigmoid
terhadap waktu dan rugi siklus berbentuk pangkat terhadap siklus penuh ekuivalen (EFC). Simulasi
berjalan harian dan tervektorisasi untuk banyak baterai sekaligus.

Jalankan: python -m baterai.simulasi  (menulis analisis/data/baterai_sim.csv.gz)
"""

from pathlib import Path

import numpy as np
import pandas as pd

from . import parameter as P

DATA = Path(__file__).resolve().parent.parent / "data"
TITIK_SOC = 5  # titik pada profil SOC harian untuk merata-ratakan laju


def potensial_anoda(soc: np.ndarray) -> np.ndarray:
    xa = P.XA_MIN + soc * (P.XA_MAX - P.XA_MIN)
    return (
        0.6379
        + 0.5416 * np.exp(-305.5309 * xa)
        + 0.044 * np.tanh(-(xa - 0.1958) / 0.1088)
        - 0.1978 * np.tanh((xa - 1.0571) / 0.0854)
        - 0.6875 * np.tanh((xa + 0.0117) / 0.0529)
        - 0.0175 * np.tanh((xa - 0.5692) / 0.0875)
    )


def laju_kalender(suhu_k: np.ndarray, dod: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Rata-rata q1 dan q3 sepanjang profil SOC harian dari 1 turun ke 1 - DoD."""
    frac = np.linspace(0, 1, TITIK_SOC)
    soc = 1 - dod[:, None] * frac[None, :]
    ua = potensial_anoda(soc)
    t = suhu_k[:, None]
    q1 = np.abs(P.Q1_B0 * np.exp(P.Q1_B1 / t**2 * ua**0.5) * np.exp(P.Q1_B2 / t * ua**0.5))
    q3 = np.abs(
        P.Q3_B0
        * np.exp(P.Q3_B1 / t**4 * ua ** (1 / 3))
        * np.exp(P.Q3_B2 * t**3 * ua**0.25)
        * np.exp(P.Q3_B3 / t**3 * ua ** (1 / 3))
        * np.exp(P.Q3_B4 * t**2 * ua**0.25)
    )
    return q1.mean(axis=1), q3.mean(axis=1)


def laju_siklus(dod: np.ndarray, crate: np.ndarray) -> np.ndarray:
    return np.abs(P.Q5_B0 + P.Q5_B1 * dod + P.Q5_B2 * np.exp(dod**2 * crate**3))


def tambah_sigmoid(y0: np.ndarray, dx: float, y_inf: np.ndarray, k: float, p: np.ndarray) -> np.ndarray:
    """Pertambahan state sigmoid y = 2*y_inf*(1/2 - 1/(1 + exp((k x)^p))), versi tervektorisasi BLAST-Lite."""
    awal = 2 * y_inf * (0.5 - 1 / (1 + np.exp((k * dx) ** p)))
    rasio = np.clip(-(2 * y_inf / (np.where(y0 > 0, y0, 1e-12) - y_inf)) - 1, 1 + 1e-12, None)
    x_inv = (1 / k) * np.log(rasio) ** (1 / p)
    z = (k * x_inv) ** p
    lanjut = (2 * y_inf * p * np.exp(z) * z) / (x_inv * (np.exp(z) + 1) ** 2) * dx
    return np.where(y0 > 0, lanjut, awal)


def tambah_pangkat(y0: np.ndarray, dx: np.ndarray, k: np.ndarray, p: float) -> np.ndarray:
    """Pertambahan state pangkat y = (k x)^p, versi tervektorisasi BLAST-Lite."""
    dx_aman = np.where(dx > 0, dx, 1.0)
    awal = (k * dx_aman) ** p
    z = np.where(y0 > 0, y0, 1.0) ** (1 / p) / k
    lanjut = (p * (k * z) ** p) / z * dx_aman
    return np.where(dx > 0, np.where(y0 > 0, lanjut, awal), 0.0)


def simulasi(n: int, seed: int = 7) -> pd.DataFrame:
    """Simulasikan n baterai; kembalikan catatan mingguan sampai akhir umur atau horizon."""
    rng = np.random.default_rng(seed)
    suhu_rata = rng.uniform(*P.SUHU_RATA_C, n)
    dod_rata = rng.uniform(*P.DOD_RATA, n)
    skala = np.exp(rng.normal(np.log(P.SKALA_DEGRADASI_MEDIAN), P.SKALA_DEGRADASI_SD_LOG, n))
    fase = rng.uniform(0, 2 * np.pi, n)

    rugi_kal = np.zeros(n)
    rugi_sik = np.zeros(n)
    efc = np.zeros(n)
    hidup = np.ones(n, dtype=bool)
    hari_gagal = np.full(n, -1)
    sebab = np.full(n, "", dtype=object)
    jendela_suhu = np.zeros((7, n))
    jendela_dod = np.zeros((7, n))
    catatan = []

    for hari in range(P.HARI_SIMULASI):
        suhu = (suhu_rata + P.SUHU_MUSIMAN_C * np.sin(2 * np.pi * hari / 365 + fase)
                + rng.normal(0, P.SUHU_HARIAN_SD_C, n))
        dod = np.clip(dod_rata * (1 + rng.normal(0, P.DOD_HARIAN_SD, n)), 0.05, 1.0)
        crate = dod * (1 / P.JAM_PENGISIAN + 1 / P.JAM_PENGOSONGAN) / 2
        soh = 1 - rugi_kal - rugi_sik

        q1, q3 = laju_kalender(suhu + 273.15, dod)
        q5 = laju_siklus(dod, crate)
        d_efc = dod * soh
        rugi_kal = rugi_kal + hidup * skala * tambah_sigmoid(rugi_kal, 1.0, q1, P.Q2, q3)
        rugi_sik = rugi_sik + hidup * skala * tambah_pangkat(rugi_sik, d_efc, q5, P.Q6)
        efc = efc + hidup * d_efc
        soh = 1 - rugi_kal - rugi_sik

        hazard = (P.HAZARD_DASAR * np.exp(P.HAZARD_KENAIKAN_PER_RUGI * (1 - soh))
                  * P.HAZARD_SUHU_PER_10C ** ((suhu - P.HAZARD_SUHU_REF_C) / 10))
        mendadak = hidup & (rng.random(n) < hazard)
        aus = hidup & (soh <= P.SOH_AKHIR_UMUR)
        gagal = mendadak | aus
        hari_gagal[gagal] = hari
        sebab[aus] = "aus"
        sebab[mendadak & ~aus] = "mendadak"

        jendela_suhu[hari % 7] = suhu
        jendela_dod[hari % 7] = dod
        if hari % 7 == 6:
            aktif = np.flatnonzero(hidup)
            catatan.append(pd.DataFrame({
                "baterai": aktif,
                "hari": hari,
                "soh": soh[aktif],
                "soh_bms": soh[aktif] + rng.normal(0, P.SOH_BMS_SD, aktif.size),
                "suhu_7h": jendela_suhu[:, aktif].mean(axis=0),
                "dod_7h": jendela_dod[:, aktif].mean(axis=0),
                "efc": efc[aktif],
            }))
        hidup &= ~gagal
        if not hidup.any():
            break

    df = pd.concat(catatan, ignore_index=True)
    info = pd.DataFrame({"baterai": np.arange(n), "hari_gagal": hari_gagal, "sebab_gagal": sebab,
                         "suhu_rata": suhu_rata, "dod_rata": dod_rata, "skala": skala})
    return df.merge(info, on="baterai")


def main(n: int = 1200) -> None:
    df = simulasi(n)
    DATA.mkdir(exist_ok=True)
    path = DATA / "baterai_sim.csv.gz"
    df.to_csv(path, index=False)
    per_baterai = df.groupby("baterai").first()
    gagal = per_baterai[per_baterai.hari_gagal >= 0]
    print(f"{n} baterai, {len(df)} catatan mingguan -> {path}")
    print(f"gagal dalam horizon: {len(gagal)} ({gagal.sebab_gagal.value_counts().to_dict()}); "
          f"median umur gagal {gagal.hari_gagal.median() / 365:.1f} tahun")


if __name__ == "__main__":
    main()
