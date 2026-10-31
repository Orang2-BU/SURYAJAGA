export const PERAN = {
  pengawas: { label: "Pengawas", beranda: "/pemantauan" },
  operator: { label: "Operator desa", beranda: "/operator" },
} as const;

export type Peran = keyof typeof PERAN;

export function bacaPeran(nilai: string | undefined): Peran | null {
  return nilai && nilai in PERAN ? (nilai as Peran) : null;
}
