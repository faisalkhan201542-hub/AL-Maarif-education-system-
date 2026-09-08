import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, Lock, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("+92");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(whatsapp.trim(), password);
      toast.success("Welcome back, Principal!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 md:p-10 border border-white/20">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <Logo size={72} dark={true} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-300 mt-2">Sign in to the principal administration panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label text-slate-200">WhatsApp Number</label>
              <div className="relative">
                <Phone size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-9 bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:bg-slate-800/80 focus:border-primary-400 focus:ring-primary-500/30"
                  placeholder="+923139163732"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label text-slate-200">Password</label>
              <div className="relative">
                <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  className="input pl-9 bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:bg-slate-800/80 focus:border-primary-400 focus:ring-primary-500/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-[15px] mt-2">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8 font-medium">
            Only the Principal (Murad Khalil) can access this system.
          </p>
        </div>
      </div>
    </div>
  );
}
