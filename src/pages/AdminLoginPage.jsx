import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [id, setId]       = useState("");
  const [pass, setPass]   = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const adminId   = import.meta.env.VITE_ADMIN_ID;
    const adminPass = import.meta.env.VITE_ADMIN_PASS;

    if (!adminId || !adminPass) {
      setError("Admin credentials not configured. Add VITE_ADMIN_ID and VITE_ADMIN_PASS to your Secrets.");
      return;
    }
    if (id === adminId && pass === adminPass) {
      sessionStorage.setItem("rc_admin", "1");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin ID or password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      <div className="w-full max-w-md relative">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to site
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">RoboCraft Technologies</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Admin ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter admin ID"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-orange-500 to-orange-600 rounded-xl font-semibold text-sm hover:from-orange-400 hover:to-orange-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
