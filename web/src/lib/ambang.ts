// Ambang prediksi baterai (03-ARCHITECTURE §5). Nilainya harus sama dengan api/app/config.py.
// Ambang awal dari data simulasi: di 77 sel LFP nyata HUST (Ma dkk., 2022) peluang model jauh lebih rendah
// (median 0,045 pada sel yang akan aus), jadi wajib dikalibrasi dengan data lapangan saat pilot.
export const AMBANG_BATERAI = { kritis: 0.9, waspada: 0.7, perlu_dicek: 0.5 } as const;

export type TingkatBaterai = "kritis" | "waspada" | "perlu_dicek" | "normal";

/** p = peluang baterai mencapai akhir umur dalam 26 minggu. */
export function tingkatBaterai(p: number): TingkatBaterai {
  if (p >= AMBANG_BATERAI.kritis) return "kritis";
  if (p >= AMBANG_BATERAI.waspada) return "waspada";
  if (p >= AMBANG_BATERAI.perlu_dicek) return "perlu_dicek";
  return "normal";
}
