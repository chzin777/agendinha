import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth/server";
import { NOTEBOOK_COLORS, rowToNotebook, type NotebookRow } from "@/lib/notebookRows";

export async function GET(request: NextRequest) {
  const session = await getSession(request.headers);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await sql`
      SELECT n.id, n.name, n.description, n.color, n.created_at::text, n.updated_at::text,
             COUNT(p.id)::int AS page_count
      FROM notebooks n
      LEFT JOIN notebook_pages p ON p.notebook_id = n.id
      WHERE n.owner_id = ${session.user.id}
      GROUP BY n.id
      ORDER BY n.updated_at DESC
    `;
    return NextResponse.json((rows as unknown as NotebookRow[]).map(rowToNotebook));
  } catch (e) {
    console.error("[GET /api/notebooks]", e);
    return NextResponse.json({ error: "Failed to fetch notebooks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request.headers);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, description, color } = await request.json();
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const safeColor = NOTEBOOK_COLORS.includes(color) ? color : "primary";
    const desc = typeof description === "string" && description.trim() ? description.trim() : null;

    const rows = await sql`
      INSERT INTO notebooks (name, description, color, owner_id)
      VALUES (${trimmed.slice(0, 120)}, ${desc ? desc.slice(0, 500) : null}, ${safeColor}, ${session.user.id})
      RETURNING id, name, description, color, created_at::text, updated_at::text, 0 AS page_count
    `;
    return NextResponse.json(rowToNotebook(rows[0] as unknown as NotebookRow), { status: 201 });
  } catch (e) {
    console.error("[POST /api/notebooks]", e);
    return NextResponse.json({ error: "Failed to create notebook" }, { status: 500 });
  }
}
