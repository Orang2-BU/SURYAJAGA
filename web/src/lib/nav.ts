import {
  Bell,
  BellRing,
  BookOpenCheck,
  BatteryWarning,
  Map,
  MapPinned,
  MoonStar,
  SlidersHorizontal,
  SunMedium,
  TableProperties,
  type LucideIcon,
} from "lucide-react";

// Peta halaman area pengawas dari docs/01-PRD.md §5a-5b.

export interface PageInfo {
  /** ID halaman di 01-PRD §5a. */
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  /** Satu kalimat tugas halaman. */
  description: string;
  /** Halaman yang sudah dibangun (tanpa titik placeholder di sidebar). */
  core?: boolean;
  /** Langkah alur inti 01-PRD §4 sisi pengawas. */
  step?: FlowStep;
  /** Halaman induk untuk tombol kembali di placeholder. */
  parent?: string;
}

export const FLOW_STEPS = ["Pantau", "Telusuri", "Peringatkan"] as const;
export type FlowStep = (typeof FLOW_STEPS)[number];

const PAGE_MAP = {
  "/pemantauan": { id: "P2", label: "Peta Pemantauan", group: "Pantau", icon: Map, core: true, step: "Pantau", description: "Melihat kondisi semua PLTS dan menemukan yang perlu tindakan." },
  "/pemantauan/[id]": { id: "P3", label: "Detail PLTS", group: "Pantau", icon: SunMedium, core: true, step: "Telusuri", parent: "/pemantauan", description: "Memahami kenapa satu PLTS berstatus tertentu, lalu mengirim peringatan." },
  "/aset": { id: "P4", label: "Daftar PLTS", group: "Pantau", icon: TableProperties, description: "Membandingkan banyak PLTS dalam tabel yang bisa diurutkan." },
  "/peringatan": { id: "P5", label: "Peringatan", group: "Pantau", icon: BellRing, step: "Peringatkan", description: "Melacak peringatan yang dikirim sampai selesai ditangani." },
  "/peringatan/[id]": { id: "P6", label: "Detail peringatan", group: "Pantau", icon: Bell, parent: "/peringatan", description: "Melihat riwayat satu peringatan dan isi percakapan operator." },
  "/perencanaan": { id: "P7", label: "Perencanaan Lokasi", group: "Rencana", icon: MapPinned, description: "Melihat calon lokasi PLTS di daerah tertinggal: kelayakan, anggaran, efektivitas, dan risiko mangkrak." },
  "/perencanaan/[sel]": { id: "P8", label: "Rincian calon lokasi", group: "Rencana", icon: MapPinned, parent: "/perencanaan", description: "Memahami estimasi kebutuhan, anggaran, efektivitas, dan risiko satu calon lokasi." },
  "/bukti/cahaya-malam": { id: "P9", label: "Analisis Cahaya Malam", group: "Bukti", icon: MoonStar, description: "Melihat hasil uji satelit untuk semua desa uji, termasuk yang tidak terdeteksi." },
  "/bukti/baterai": { id: "P10", label: "Model Baterai", group: "Bukti", icon: BatteryWarning, description: "Melihat seberapa akurat model prediksi umur baterai." },
  "/bukti/metodologi": { id: "P11", label: "Metodologi & Sumber", group: "Bukti", icon: BookOpenCheck, description: "Melihat sumber data, asumsi, dan batasan sistem." },
  "/pengaturan": { id: "P17", label: "Pengaturan Ambang", group: "Sistem", icon: SlidersHorizontal, description: "Melihat ambang keyakinan dan hari anomali yang menentukan status." },
} satisfies Record<string, PageInfo>;

export type PageRoute = keyof typeof PAGE_MAP;
export const PAGES: Record<PageRoute, PageInfo> = PAGE_MAP;

/** Menu sidebar pengawas (01-PRD §5b); Pengaturan Ambang lewat kartu akun. */
export const NAVIGATION: { group: string; routes: PageRoute[] }[] = [
  { group: "Pantau", routes: ["/pemantauan", "/aset", "/peringatan"] },
  { group: "Rencana", routes: ["/perencanaan"] },
  { group: "Bukti", routes: ["/bukti/cahaya-malam", "/bukti/baterai", "/bukti/metodologi"] },
];

export const HOME_ROUTE: PageRoute = "/pemantauan";

/** Link menu aktif untuk halaman itu sendiri dan semua sub-halamannya. */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Cocokkan URL nyata (mis. /pemantauan/parang) ke rute di PAGES. */
export function matchPage(pathname: string): PageInfo | undefined {
  const parts = pathname.split("/").filter(Boolean);
  const dynamicCount = (key: string) => (key.match(/\[/g) ?? []).length;
  const matches = (Object.keys(PAGES) as PageRoute[]).filter((key) => {
    const pattern = key.split("/").filter(Boolean);
    return (
      pattern.length === parts.length &&
      pattern.every((seg, i) => seg.startsWith("[") || seg === parts[i])
    );
  });
  // Segmen statis menang atas param dinamis.
  matches.sort((a, b) => dynamicCount(a) - dynamicCount(b));
  return matches[0] ? PAGES[matches[0]] : undefined;
}
