import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { rowToPage, UUID_RE, type PageRow } from "@/lib/notebookRows";

const NOT_FOUND = () => NextResponse.json({ error: "Notebook not found" }, { status: 404 });

/** Lists the pages of a notebook (content included, pages are small rich text). */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/notebooks/[id]/pages">) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const rows = await sql`
      SELECT id, notebook_id, title, content, position, created_at::text, updated_at::text
      FROM notebook_pages
      WHERE notebook_id = ${id}
      ORDER BY position ASC, created_at ASC
    `;
    return NextResponse.json((rows as unknown as PageRow[]).map(rowToPage));
  } catch (e) {
    console.error("[GET /api/notebooks/:id/pages]", e);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/notebooks/[id]/pages">) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";

    const rows = await sql`
      INSERT INTO notebook_pages (notebook_id, title, position)
      SELECT ${id}, ${title}, COALESCE(MAX(position) + 1, 0)
      FROM notebook_pages
      WHERE notebook_id = ${id}
      RETURNING id, notebook_id, title, content, position, created_at::text, updated_at::text
    `;
    await sql`UPDATE notebooks SET updated_at = now() WHERE id = ${id}`;
    return NextResponse.json(rowToPage(rows[0] as unknown as PageRow), { status: 201 });
  } catch (e) {
    // FK violation -> notebook does not exist
    if ((e as { code?: string }).code === "23503") return NOT_FOUND();
    console.error("[POST /api/notebooks/:id/pages]", e);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
