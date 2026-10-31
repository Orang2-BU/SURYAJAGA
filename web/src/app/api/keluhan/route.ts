import { PESAN_MAKS, jawabKeluhan } from "@/server/asisten";

// Klasifikasi keluhan di server (F5). Validasi sama dengan api/app/main.py: teks 1-500 karakter.
export async function POST(request: Request) {
  const isi: unknown = await request.json().catch(() => null);
  const teks = (isi as { teks?: unknown } | null)?.teks;
  if (typeof teks !== "string" || teks.trim().length === 0 || teks.length > PESAN_MAKS)
    return Response.json({ detail: `teks wajib 1-${PESAN_MAKS} karakter` }, { status: 422 });
  return Response.json(jawabKeluhan(teks));
}
