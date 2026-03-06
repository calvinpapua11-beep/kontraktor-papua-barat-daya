import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all personnel for current contractor
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get contractor ID
    const contractorRows = await sql`
      SELECT id FROM contractors WHERE user_id = ${userId} LIMIT 1
    `;

    if (contractorRows.length === 0) {
      return Response.json({ personnel: [] });
    }

    const contractorId = contractorRows[0].id;

    // Get all personnel
    const personnel = await sql`
      SELECT * FROM contractor_personnel 
      WHERE contractor_id = ${contractorId}
      ORDER BY created_at DESC
    `;

    return Response.json({ personnel });
  } catch (err) {
    console.error("GET /api/personnel error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add new personnel
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Get contractor ID
    const contractorRows = await sql`
      SELECT id FROM contractors WHERE user_id = ${userId} LIMIT 1
    `;

    if (contractorRows.length === 0) {
      return Response.json({ error: "Contractor not found" }, { status: 404 });
    }

    const contractorId = contractorRows[0].id;
    const {
      name,
      position,
      expertise,
      certificate_number,
      certificate_file_url,
    } = body;

    const result = await sql`
      INSERT INTO contractor_personnel (
        contractor_id, name, position, expertise, 
        certificate_number, certificate_file_url
      ) VALUES (
        ${contractorId}, ${name}, ${position || null}, ${expertise || null},
        ${certificate_number || null}, ${certificate_file_url || null}
      )
      RETURNING *
    `;

    return Response.json({ personnel: result[0] });
  } catch (err) {
    console.error("POST /api/personnel error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete personnel
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get("id");

    if (!personnelId) {
      return Response.json({ error: "Personnel ID required" }, { status: 400 });
    }

    await sql`DELETE FROM contractor_personnel WHERE id = ${personnelId}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/personnel error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
