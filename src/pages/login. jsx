import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api, saveToken } from "../lib/api.js";

const INK = "#182419", PAPER = "#F7F5EF", ACCENT = "#2F6B4F", PANEL = "#FFFFFF", MUTED = "#847E6E";

export default function Login() {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login(email.trim().toLowerCase(), businessName.trim());
      saveToken(token);
      nav("/");
    } catch (e) {
      setError(e.message || "Login failed — check the backend URL is set correctly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center px-6" style={{ background: PAPER, fontFamily: "'Söhne','Helvetica Neue',Arial,sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Sparkles size={20} color={ACCENT} />
          <span className="font-semibold" style={{ color: INK }}>AI Business Manager</span>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: PANEL, border: "1px solid #E5E1D3" }}>
          <label className="text-[11px] font-medium" style={{ color: INK }}>Business email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourshop.com"
            className="w-full mt-1 mb-3 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#F1EFE6", color: INK }}
          />
          <label className="text-[11px] font-medium" style={{ color: INK }}>Business name (optional)</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Grace Boutique"
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#F1EFE6", color: INK }}
          />
          <button onClick={submit} disabled={loading} className="w-full mt-4 py-2 rounded-lg text-sm font-medium" style={{ background: ACCENT, color: "#fff", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Signing in…" : "Enter shop"}
          </button>
          {error && <p className="text-[11px] mt-2" style={{ color: "#B5453F" }}>{error}</p>}
          <p className="text-[10px] mt-3" style={{ color: MUTED }}>
            This connects to your backend at the URL set in VITE_API_URL. Admins log in the same way,
            then visit /#/admin.
          </p>
        </div>
      </div>
    </div>
  );
}
