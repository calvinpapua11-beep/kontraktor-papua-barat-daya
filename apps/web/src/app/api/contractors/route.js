import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get contractor data for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT * FROM contractors 
      WHERE user_id = ${userId} 
      LIMIT 1
    `;

    const contractor = rows?.[0] || null;
    return Response.json({ contractor });
  } catch (err) {
    console.error("GET /api/contractors error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create or update contractor data
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const body = await request.json();

    const {
      company_name,
      company_address,
      company_phone,
      director_name,
      director_npwp,
      company_npwp,
      akta_perusahaan_url,
      director_npwp_file_url,
      company_npwp_file_url,
      siujk_file_url,
      smk3_file_url,
      bank_account_file_url,
      bank_name,
      account_number,
      account_holder,
      registration_status,
    } = body;

    // Check if contractor exists
    const existing = await sql`
      SELECT id FROM contractors WHERE user_id = ${userId} LIMIT 1
    `;

    let contractor;
    if (existing.length > 0) {
      // Update existing
      const result = await sql`
        UPDATE contractors SET
          company_name = ${company_name || null},
          company_address = ${company_address || null},
          company_phone = ${company_phone || null},
          director_name = ${director_name || null},
          director_npwp = ${director_npwp || null},
          company_npwp = ${company_npwp || null},
          akta_perusahaan_url = ${akta_perusahaan_url || null},
          director_npwp_file_url = ${director_npwp_file_url || null},
          company_npwp_file_url = ${company_npwp_file_url || null},
          siujk_file_url = ${siujk_file_url || null},
          smk3_file_url = ${smk3_file_url || null},
          bank_account_file_url = ${bank_account_file_url || null},
          bank_name = ${bank_name || null},
          account_number = ${account_number || null},
          account_holder = ${account_holder || null},
          registration_status = ${registration_status || "draft"},
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `;
      contractor = result[0];
    } else {
      // Create new
      const result = await sql`
        INSERT INTO contractors (
          user_id, email, company_name, company_address, company_phone,
          director_name, director_npwp, company_npwp,
          akta_perusahaan_url, director_npwp_file_url, company_npwp_file_url,
          siujk_file_url, smk3_file_url, bank_account_file_url,
          bank_name, account_number, account_holder, registration_status
        ) VALUES (
          ${userId}, ${userEmail}, ${company_name || null}, ${company_address || null}, 
          ${company_phone || null}, ${director_name || null}, ${director_npwp || null}, 
          ${company_npwp || null}, ${akta_perusahaan_url || null}, ${director_npwp_file_url || null},
          ${company_npwp_file_url || null}, ${siujk_file_url || null}, ${smk3_file_url || null},
          ${bank_account_file_url || null}, ${bank_name || null}, ${account_number || null},
          ${account_holder || null}, ${registration_status || "draft"}
        )
        RETURNING *
      `;
      contractor = result[0];
    }

    // Sync to Google Sheets
    try {
      await fetch(`${process.env.APP_URL}/api/sync-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractorId: contractor.id }),
      });
    } catch (syncErr) {
      console.error("Failed to sync to Google Sheets:", syncErr);
      // Continue even if sync fails
    }

    return Response.json({ contractor });
  } catch (err) {
    console.error("POST /api/contractors error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
