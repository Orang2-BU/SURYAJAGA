import type { Metadata } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], display: "swap", variable: "--font-onest" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "SuryaJaga | Peringatan dini PLTS desa", template: "%s | SuryaJaga" },
  description: "Purwarupa sistem peringatan dini berbasis AI agar PLTS desa tidak mangkrak. Data simulasi dan contoh berlabel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body className={`${onest.variable} ${mono.variable}`}>{children}</body></html>;
}
