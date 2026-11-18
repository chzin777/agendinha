import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { NOTEBOOK_COLORS, rowToNotebook, UUID_RE, type NotebookRow } from "@/lib/notebookRows";

const NOT_FOUND = () => NextResponse.json({ error: "Notebook not found" }, { status: 404 });

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/notebooks/[id]">) {
  const unauthorized = await requireAuth(_req);
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const rows = await sql`
      SELECT n.id, n.name, n.description, n.color, n.created_at::text, n.updated_at::text,
             (SELECT COUNT(*)::int FROM notebook_pages p WHERE p.notebook_id = n.id) AS page_count
      FROM notebooks n
      WHERE n.id = ${id}
    `;
    if (rows.length === 0) return NOT_FOUND();
    return NextResponse.json(rowToNotebook(rows[0] as unknown as NotebookRow));
  } catch (e) {
    console.error("[GET /api/notebooks/:id]", e);
    return NextResponse.json({ error: "Failed to fetch notebook" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/notebooks/[id]">) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const { name, description, color } = await request.json();
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const safeColor = NOTEBOOK_COLORS.includes(color) ? color : "primary";
    const desc = typeof description === "string" && description.trim() ? description.trim().slice(0, 500) : null;

    const rows = await sql`
      UPDATE notebooks
      SET name = ${trimmed.slice(0, 120)}, description = ${desc}, color = ${safeColor}, updated_at = now()
      WHERE id = ${id}
      RETURNING id, name, description, color, created_at::text, updated_at::text,
                (SELECT COUNT(*)::int FROM notebook_pages p WHERE p.notebook_id = notebooks.id) AS page_count
    `;
    if (rows.length === 0) return NOT_FOUND();
    return NextResponse.json(rowToNotebook(rows[0] as unknown as NotebookRow));
  } catch (e) {
    console.error("[PUT /api/notebooks/:id]", e);
    return NextResponse.json({ error: "Failed to update notebook" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/notebooks/[id]">) {
  const unauthorized = await requireAuth(_req);
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const rows = await sql`DELETE FROM notebooks WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) return NOT_FOUND();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/notebooks/:id]", e);
    return NextResponse.json({ error: "Failed to delete notebook" }, { status: 500 });
  }
}
