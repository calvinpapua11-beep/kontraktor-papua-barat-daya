import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import {
  appendToSheet,
  ensureSheetHeaders,
  formatContractorData,
  formatPersonnelData,
} from "@/app/api/utils/google-sheets";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);

    // Get contractor data
    const contractorResult = await sql`
      SELECT * FROM contractors WHERE user_id = ${userId}
    `;

    if (contractorResult.length === 0) {
      return Response.json({ error: "Contractor not found" }, { status: 404 });
    }

    const contractor = contractorResult[0];

    // Get personnel data
    const personnelResult = await sql`
      SELECT * FROM contractor_personnel WHERE contractor_id = ${contractor.id}
    `;

    // Define headers for both sheets
    const contractorHeaders = [
      "Tanggal Input",
      "Nama Perusahaan",
      "Alamat Perusahaan",
      "Telepon Perusahaan",
      "Nama Direktur",
      "NPWP Direktur",
      "NPWP Perusahaan",
      "Email",
      "Link Akta Perusahaan",
      "Link NPWP Direktur",
      "Link NPWP Perusahaan",
      "Link SIUJK",
      "Link SMK3",
      "Link Rekening Bank",
      "Nama Bank",
      "Nomor Rekening",
      "Atas Nama Rekening",
      "Jumlah Tenaga Ahli",
      "Status Pendaftaran",
      "Terverifikasi",
    ];

    const personnelHeaders = [
      "Tanggal Input",
      "Nama Perusahaan",
      "Nama Personil",
      "Jabatan",
      "Keahlian",
      "Nomor Sertifikat",
      "Link Sertifikat",
    ];

    // Ensure headers exist
    await ensureSheetHeaders("Data Kontraktor", contractorHeaders);
    await ensureSheetHeaders("Data Personil", personnelHeaders);

    // Format and append contractor data
    const contractorRow = formatContractorData(contractor, personnelResult);
    await appendToSheet("Data Kontraktor", [contractorRow]);

    // Format and append personnel data (if any)
    if (personnelResult.length > 0) {
      const personnelRows = formatPersonnelData(
        personnelResult,
        contractor.company_name,
      );
      await appendToSheet("Data Personil", personnelRows);
    }

    return Response.json({
      success: true,
      message: "Data berhasil disinkronkan ke Google Sheets",
      contractorSynced: 1,
      personnelSynced: personnelResult.length,
    });
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    return Response.json(
      {
        error: "Gagal menyinkronkan data ke Google Sheets",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
