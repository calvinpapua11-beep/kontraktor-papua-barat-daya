import crypto from "crypto";

/**
 * Create JWT for Google Service Account authentication
 */
function createJWT(serviceAccountEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: expiry,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  sign.end();
  const signature = sign.sign(privateKey, "base64url");

  return `${signatureInput}.${signature}`;
}

/**
 * Get access token from Google OAuth2
 */
async function getAccessToken() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!serviceAccountEmail || !privateKey) {
    throw new Error("Missing Google Service Account credentials");
  }

  const jwt = createJWT(serviceAccountEmail, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Append data to Google Sheets
 */
export async function appendToSheet(sheetName, values) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      "Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable",
    );
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: values,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }

  return await response.json();
}

/**
 * Update or create headers in sheet
 */
export async function ensureSheetHeaders(sheetName, headers) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const accessToken = await getAccessToken();

  // Check if sheet exists and has data
  try {
    const checkResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const checkData = await checkResponse.json();

    // If no data or headers don't match, set headers
    if (!checkData.values || checkData.values.length === 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [headers],
          }),
        },
      );
    }
  } catch (error) {
    console.error("Error ensuring headers:", error);
    throw error;
  }
}

/**
 * Format contractor data for Google Sheets
 */
export function formatContractorData(contractor, personnel = []) {
  const row = [
    new Date().toLocaleString("id-ID"),
    contractor.company_name || "",
    contractor.company_address || "",
    contractor.company_phone || "",
    contractor.director_name || "",
    contractor.director_npwp || "",
    contractor.company_npwp || "",
    contractor.email || "",
    contractor.akta_perusahaan_url || "",
    contractor.director_npwp_file_url || "",
    contractor.company_npwp_file_url || "",
    contractor.siujk_file_url || "",
    contractor.smk3_file_url || "",
    contractor.bank_account_file_url || "",
    contractor.bank_name || "",
    contractor.account_number || "",
    contractor.account_holder || "",
    personnel.length,
    contractor.registration_status || "draft",
    contractor.is_verified ? "Ya" : "Tidak",
  ];

  return row;
}

/**
 * Format personnel data for Google Sheets
 */
export function formatPersonnelData(personnel, contractorName) {
  return personnel.map((person) => [
    new Date().toLocaleString("id-ID"),
    contractorName || "",
    person.name || "",
    person.position || "",
    person.expertise || "",
    person.certificate_number || "",
    person.certificate_file_url || "",
  ]);
}
