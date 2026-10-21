import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import type { CalendarEvent, EventType } from "@/types";

const VALID_TYPES: EventType[] = [
  "exam",
  "project",
  "studio",
  "critique",
  "lecture",
  "other",
];

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  type: string;
  notified: boolean;
  created_at: string;
}

function rowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date.slice(0, 10), // DATE comes as YYYY-MM-DD already, but ensure format
    time: row.time ? row.time.slice(0, 5) : undefined, // TIME comes as HH:mm:ss
    type: row.type as EventType,
    notified: row.notified,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, title, description, date::text, time::text, type, notified, created_at::text
      FROM events
      ORDER BY date ASC, time ASC NULLS LAST
    `;
    const events = (rows as unknown as EventRow[]).map(rowToEvent);
    return NextResponse.json(events);
  } catch (e) {
    console.error("[GET /api/events]", e);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, time, type } = body;

    if (!title || !date || !type) {
      return NextResponse.json({ error: "title, date and type are required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid event type: ${type}` }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO events (title, description, date, time, type)
      VALUES (${title}, ${description ?? null}, ${date}, ${time ?? null}, ${type})
      RETURNING id, title, description, date::text, time::text, type, notified, created_at::text
    `;
    const event = rowToEvent(rows[0] as unknown as EventRow);
    return NextResponse.json(event, { status: 201 });
  } catch (e) {
    console.error("[POST /api/events]", e);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const allowedFields = ["title", "description", "date", "time", "type", "notified"];
    const sets: string[] = [];
    const vals: unknown[] = [];

    for (const f of allowedFields) {
      if (f in updates) {
        sets.push(`${f} = $${sets.length + 1}`);
        vals.push(updates[f]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    vals.push(id);
    const query = `UPDATE events SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING id, title, description, date::text, time::text, type, notified, created_at::text`;

    const rows = await sql.query(query, vals) as unknown as EventRow[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = rowToEvent(rows[0]);
    return NextResponse.json(event);
  } catch (e) {
    console.error("[PUT /api/events]", e);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
    }

    const rows = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
    if ((rows as unknown[]).length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/events]", e);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}