import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth/server";
import { MAX_CONTENT_LENGTH, rowToPage, UUID_RE, type PageRow } from "@/lib/notebookRows";

const NOT_FOUND = () => NextResponse.json({ error: "Page not found" }, { status: 404 });

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/pages/[id]">) {
  const session = await getSession(request.headers);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.slice(0, 200) : null;
    const content = typeof body.content === "string" ? body.content : null;

    if (title === null && content === null) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    if (content !== null && content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "Content too large" }, { status: 413 });
    }

    const rows = await sql`
      UPDATE notebook_pages
      SET title = COALESCE(${title}, title),
          content = COALESCE(${content}, content),
          updated_at = now()
      WHERE id = ${id}
        AND EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_pages.notebook_id AND owner_id = ${session.user.id})
      RETURNING id, notebook_id, title, content, position, created_at::text, updated_at::text
    `;
    if (rows.length === 0) return NOT_FOUND();
    const page = rowToPage(rows[0] as unknown as PageRow);
    await sql`UPDATE notebooks SET updated_at = now() WHERE id = ${page.notebookId} AND owner_id = ${session.user.id}`;
    return NextResponse.json(page);
  } catch (e) {
    console.error("[PUT /api/pages/:id]", e);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/pages/[id]">) {
  const session = await getSession(_req.headers);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NOT_FOUND();
  try {
    const rows = await sql`
      DELETE FROM notebook_pages
      WHERE id = ${id}
        AND EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_pages.notebook_id AND owner_id = ${session.user.id})
      RETURNING notebook_id
    `;
    if (rows.length === 0) return NOT_FOUND();
    await sql`UPDATE notebooks SET updated_at = now() WHERE id = ${(rows[0] as { notebook_id: string }).notebook_id} AND owner_id = ${session.user.id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/pages/:id]", e);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
