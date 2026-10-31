import { topik } from "@/server/asisten";

export async function GET(_request: Request, ctx: RouteContext<"/api/panduan/[kategori]">) {
  const t = topik((await ctx.params).kategori);
  return t ? Response.json(t) : Response.json({ detail: "Kategori tidak dikenal" }, { status: 404 });
}
