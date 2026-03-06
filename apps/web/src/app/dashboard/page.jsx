"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  const [contractor, setContractor] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    director_name: "",
    director_npwp: "",
    company_npwp: "",
    bank_name: "",
    account_number: "",
    account_holder: "",
    akta_perusahaan_url: "",
    director_npwp_file_url: "",
    company_npwp_file_url: "",
    siujk_file_url: "",
    smk3_file_url: "",
    bank_account_file_url: "",
  });

  // Personnel form
  const [personnelForm, setPersonnelForm] = useState({
    name: "",
    position: "",
    expertise: "",
    certificate_number: "",
    certificate_file_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/contractors");
      const data = await res.json();
      if (data.contractor) {
        setContractor(data.contractor);
        setFormData({
          company_name: data.contractor.company_name || "",
          company_address: data.contractor.company_address || "",
          company_phone: data.contractor.company_phone || "",
          director_name: data.contractor.director_name || "",
          director_npwp: data.contractor.director_npwp || "",
          company_npwp: data.contractor.company_npwp || "",
          bank_name: data.contractor.bank_name || "",
          account_number: data.contractor.account_number || "",
          account_holder: data.contractor.account_holder || "",
          akta_perusahaan_url: data.contractor.akta_perusahaan_url || "",
          director_npwp_file_url: data.contractor.director_npwp_file_url || "",
          company_npwp_file_url: data.contractor.company_npwp_file_url || "",
          siujk_file_url: data.contractor.siujk_file_url || "",
          smk3_file_url: data.contractor.smk3_file_url || "",
          bank_account_file_url: data.contractor.bank_account_file_url || "",
        });
      }

      const pRes = await fetch("/api/personnel");
      const pData = await pRes.json();
      setPersonnel(pData.personnel || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const { url, error } = await upload({ base64 });

        if (error) {
          setMessage({ type: "error", text: "Gagal upload file" });
          return;
        }

        setFormData((prev) => ({ ...prev, [fieldName]: url }));
        setMessage({ type: "success", text: "File berhasil di-upload" });
        setTimeout(() => setMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Gagal upload file" });
    }
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/sync-sheets", {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || "Failed to sync");
      }

      const data = await res.json();
      setMessage({
        type: "success",
        text: `Berhasil disinkronkan! ${data.contractorSynced} kontraktor dan ${data.personnelSynced} personil terkirim ke Google Sheets.`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      setMessage({
        type: "error",
        text: `Gagal sinkronisasi: ${error.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, registration_status: "submitted" }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setContractor(data.contractor);

      await fetchData();

      setMessage({
        type: "success",
        text: "Data berhasil disimpan!",
      });
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Gagal menyimpan data" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPersonnel = async () => {
    if (!personnelForm.name) {
      setMessage({ type: "error", text: "Nama tenaga ahli wajib diisi" });
      return;
    }

    try {
      const res = await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personnelForm),
      });

      if (!res.ok) throw new Error("Failed to add");

      setPersonnelForm({
        name: "",
        position: "",
        expertise: "",
        certificate_number: "",
        certificate_file_url: "",
      });

      await fetchData();
      setMessage({ type: "success", text: "Tenaga ahli berhasil ditambahkan" });
    } catch (error) {
      console.error("Add personnel error:", error);
      setMessage({ type: "error", text: "Gagal menambahkan tenaga ahli" });
    }
  };

  const handleDeletePersonnel = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      await fetch(`/api/personnel?id=${id}`, { method: "DELETE" });
      await fetchData();
      setMessage({ type: "success", text: "Data berhasil dihapus" });
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ type: "error", text: "Gagal menghapus data" });
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://ucarecdn.com/c80bed10-837b-4c63-91f3-ed5b5203242c/-/format/auto/"
                alt="Logo"
                className="h-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Kontraktor
                </h1>
                <p className="text-sm text-gray-600">
                  Dinas PUPR Papua Barat Daya
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <a
                href="/account/logout"
                className="text-xs text-red-600 hover:text-red-700"
              >
                Keluar
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        {/* Data Perusahaan */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Data Perusahaan
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Perusahaan *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PT. Contoh Nama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon *
              </label>
              <input
                type="text"
                value={formData.company_phone}
                onChange={(e) =>
                  setFormData({ ...formData, company_phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08123456789"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Perusahaan *
              </label>
              <textarea
                value={formData.company_address}
                onChange={(e) =>
                  setFormData({ ...formData, company_address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Alamat lengkap perusahaan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Direktur *
              </label>
              <input
                type="text"
                value={formData.director_name}
                onChange={(e) =>
                  setFormData({ ...formData, director_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nama lengkap direktur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPWP Direktur
              </label>
              <input
                type="text"
                value={formData.director_npwp}
                onChange={(e) =>
                  setFormData({ ...formData, director_npwp: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPWP Perusahaan
              </label>
              <input
                type="text"
                value={formData.company_npwp}
                onChange={(e) =>
                  setFormData({ ...formData, company_npwp: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
              />
            </div>
          </div>
        </div>

        {/* Upload Dokumen */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Upload Dokumen
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Akta Perusahaan", field: "akta_perusahaan_url" },
              { label: "NPWP Direktur", field: "director_npwp_file_url" },
              { label: "NPWP Perusahaan", field: "company_npwp_file_url" },
              { label: "SIUJK", field: "siujk_file_url" },
              { label: "SMK3", field: "smk3_file_url" },
              { label: "Rekening Bank", field: "bank_account_file_url" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, field)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {formData[field] && (
                  <a
                    href={formData[field]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block"
                  >
                    Lihat file
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Bank */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Data Rekening Bank
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Bank
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bank Mandiri"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({ ...formData, account_number: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atas Nama
              </label>
              <input
                type="text"
                value={formData.account_holder}
                onChange={(e) =>
                  setFormData({ ...formData, account_holder: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PT. Nama Perusahaan"
              />
            </div>
          </div>
        </div>

        {/* Tenaga Ahli */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tenaga Ahli / Personil
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
            <div>
              <input
                type="text"
                value={personnelForm.name}
                onChange={(e) =>
                  setPersonnelForm({ ...personnelForm, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nama Lengkap *"
              />
            </div>
            <div>
              <input
                type="text"
                value={personnelForm.position}
                onChange={(e) =>
                  setPersonnelForm({
                    ...personnelForm,
                    position: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <input
                type="text"
                value={personnelForm.expertise}
                onChange={(e) =>
                  setPersonnelForm({
                    ...personnelForm,
                    expertise: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Keahlian"
              />
            </div>
            <div>
              <input
                type="text"
                value={personnelForm.certificate_number}
                onChange={(e) =>
                  setPersonnelForm({
                    ...personnelForm,
                    certificate_number: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nomor Sertifikat"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const { url } = await upload({ base64: reader.result });
                      setPersonnelForm({
                        ...personnelForm,
                        certificate_file_url: url,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleAddPersonnel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                + Tambah Tenaga Ahli
              </button>
            </div>
          </div>

          {personnel.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Jabatan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Keahlian
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      No. Sertifikat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {personnel.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.position || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.expertise || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.certificate_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeletePersonnel(p.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading || syncing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {saving
                ? "Menyimpan..."
                : uploading
                  ? "Mengupload..."
                  : "💾 Simpan Data"}
            </button>

            <button
              onClick={handleSyncToSheets}
              disabled={saving || uploading || syncing || !contractor}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {syncing ? "Menyinkronkan..." : "📊 Kirim ke Google Sheets"}
            </button>
          </div>

          {!contractor && (
            <p className="mt-4 text-sm text-gray-600 text-center">
              💡 Simpan data terlebih dahulu sebelum mengirim ke Google Sheets
            </p>
          )}

          {contractor?.registration_status === "submitted" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-medium">
                ✓ Data telah tersimpan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
