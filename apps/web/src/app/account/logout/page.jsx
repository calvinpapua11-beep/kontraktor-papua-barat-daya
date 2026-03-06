import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              src="https://ucarecdn.com/c80bed10-837b-4c63-91f3-ed5b5203242c/-/format/auto/"
              alt="Logo Papua Barat Daya"
              className="h-20 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">Keluar Akun</h1>
            <p className="text-sm text-gray-600 mt-2">Yakin ingin keluar?</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
