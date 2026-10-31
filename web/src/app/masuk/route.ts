import { NextResponse, type NextRequest } from "next/server";
import { PERAN, type Peran } from "@/lib/peran";

// Pilih peran tanpa sandi (01-PRD F1): simpan di cookie lalu arahkan ke beranda peran.
export function GET(request: NextRequest) {
  const peran = request.nextUrl.searchParams.get("peran");
  if (!peran || !(peran in PERAN)) return NextResponse.redirect(new URL("/", request.url));
  const respons = NextResponse.redirect(new URL(PERAN[peran as Peran].beranda, request.url));
  respons.cookies.set("peran", peran, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return respons;
}
