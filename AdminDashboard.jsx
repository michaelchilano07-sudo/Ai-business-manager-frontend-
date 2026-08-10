import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Activity, LogOut, Search } from "lucide-react";
import { api, clearToken } from "../lib/api.js";

const INK = "#161923", PAPER = "#F7F6F2", ACCENT = "#2F6B4F", MUTED = "#8A8578", PANEL = "#FFFFFF";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setOverview(await api.adminOverview());
        const { businesses } = await api.adminBusinesses();
        setBusinesses(businesses);
      } catch (e) {
        setError("Access denied — your logged-in account isn't on the admin list.");
      }
    })();
  }, []);

  function logout() {
    clearToken();
    nav("/login");
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center px-6" style={{ background: PAPER }}>
        <div className="text-center">
          <Shield size={22} color="#B5453F" className="mx-auto mb-2" />
          <p className="text-sm" style={{ color: INK }}>{error}</p>
          <button onClick={logout} className="mt-4 text-xs underline" style={{ color: MUTED }}>Log out</button>
        </div>
      </div>
    );
  }

  const filtered = businesses.filter((b) => b.email.includes(search.toLowerCase()) || (b.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: PAPER, fontFamily: "'Söhne','Helvetica Neue',Arial,sans-serif" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E9E6DE" }}>
        <div className="flex items-center gap-2"><Shield size={16} color={ACCENT} /><span className="font-semibold text-sm" style={{ color: INK }}>Admin console</span></div>
        <button onClick={logout} className="flex items-center gap-1 text-xs" style={{ color: MUTED }}><LogOut size={12} /></button>
      </div>

      <div className="flex px-4 pt-2 gap-1 border-b" style={{ borderColor: "#E9E6DE" }}>
        {[{ id: "overview", label: "Overview", icon: Activity }, { id: "businesses", label: "Businesses", icon: Users }].map((t) => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg"
              style={{ color: active ? ACCENT : MUTED, borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent" }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "overview" && overview && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl" style={{ background: PANEL, border: "1px solid #E9E6DE" }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: MUTED }}>Total businesses</p>
              <p className="text-xl font-semibold mt-1" style={{ color: INK }}>{overview.totalBusinesses}</p>
            </div>
            {Object.entries(overview.byPlan).map(([plan, count]) => (
              <div key={plan} className="p-3.5 rounded-xl" style={{ background: PANEL, border: "1px solid #E9E6DE" }}>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: MUTED }}>{plan}</p>
                <p className="text-xl font-semibold mt-1" style={{ color: INK }}>{count}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "businesses" && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: PANEL, border: "1px solid #E9E6DE" }}>
              <Search size={13} color={MUTED} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses…" className="flex-1 text-xs outline-none bg-transparent" style={{ color: INK }} />
            </div>
            <div className="space-y-2">
              {filtered.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: PANEL, border: "1px solid #E9E6DE" }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: INK }}>{b.name || b.email}</p>
                    <p className="text-[10px]" style={{ color: MUTED }}>{b.email} · {b.usedThisMonth} transactions this month</p>
                  </div>
                  <select
                    value={b.plan}
                    onChange={async (e) => {
                      await api.adminSetPlan(b.id, e.target.value);
                      setBusinesses((prev) => prev.map((x) => (x.id === b.id ? { ...x, plan: e.target.value } : x)));
                    }}
                    className="text-[10px] font-medium px-2 py-1 rounded-full outline-none"
                    style={{ background: "#E7F0EA", color: ACCENT }}
                  >
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="pro">pro</option>
                    <option value="business">business</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
