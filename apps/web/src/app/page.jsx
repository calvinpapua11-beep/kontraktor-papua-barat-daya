export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <img
            src="https://ucarecdn.com/c80bed10-837b-4c63-91f3-ed5b5203242c/-/format/auto/"
            alt="Logo Papua Barat Daya"
            className="h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Sistem Pendataan Kontraktor
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-2">
            Orang Asli Papua
          </h2>
          <p className="text-lg text-gray-600">
            Dinas Pekerjaan Umum dan Perumahan Rakyat
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Provinsi Papua Barat Daya
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Fitur Sistem
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Pendaftaran akun kontraktor</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Input data profil perusahaan</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Upload dokumen persyaratan</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Sinkronisasi ke Google Sheets</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Dokumen yang Dibutuhkan
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Akta Perusahaan</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>NPWP Direktur & Perusahaan</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>SIUJK (Surat Izin Usaha Jasa Konstruksi)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>SMK3 (Sistem Manajemen K3)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Data Tenaga Ahli/Personil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Rekening Bank Perusahaan</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/account/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors text-center"
            >
              Daftar Akun Baru
            </a>
            <a
              href="/account/signin"
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-medium px-8 py-3 rounded-lg transition-colors text-center"
            >
              Masuk ke Akun
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>© 2024 Dinas PUPR Provinsi Papua Barat Daya</p>
        </div>
      </div>
    </div>
  );
}
