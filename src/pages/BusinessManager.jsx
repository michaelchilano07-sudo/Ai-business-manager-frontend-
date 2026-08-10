import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, TrendingUp, Package, Users, LayoutDashboard, Sparkles, LogOut, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { api, clearToken } from "../lib/api.js";

const INK = "#182419", PAPER = "#F7F5EF", ACCENT = "#2F6B4F", ACCENT_SOFT = "#E7F0EA", MUTED = "#847E6E", PANEL = "#FFFFFF";
const CURRENCY = "K";
const fmt = (n) => `${CURRENCY}${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function BusinessManager() {
  const [tab, setTab] = useState("entry");
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [plan, setPlan] = useState(null);
  const scrollRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => { refresh(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [log, loading]);

  async function refresh() {
    try { setSnapshot(await api.snapshot()); } catch {}
    try { setPlan(await api.plan()); } catch {}
  }

  function logout() {
    clearToken();
    nav("/login");
  }

  async function submitEntry() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setLog((l) => [...l, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await api.entry(text);
      if (!res.recorded) {
        setLog((l) => [...l, { role: "ai", text: res.message }]);
      } else {
        const p = res.parsed;
        const debt = p.type === "sale" ? (p.total - p.amount_paid) : 0;
        setLog((l) => [...l, { role: "ai", text: `Recorded: ${p.type} — ${p.item || "item"}${p.quantity ? ` x${p.quantity}` : ""} — ${fmt(p.total)}${debt > 0 ? `, ${fmt(debt)} owed by ${p.customer_name || "customer"}` : ""}` }]);
        refresh();
      }
    } catch (e) {
      setLog((l) => [...l, { role: "ai", text: e.message }]);
    }
    setLoading(false);
  }

  async function askQuestion() {
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const res = await api.ask(question);
      setAnswer(res.answer);
    } catch (e) {
      setAnswer(e.message);
    }
    setLoading(false);
  }

  const snap = snapshot || { week: {}, month: {}, topProducts: [], debts: [], inventory: [] };
  const TABS = [
    { id: "entry", label: "Record", icon: Send },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "debts", label: "Debts", icon: Users },
    { id: "inventory", label: "Stock", icon: Package },
    { id: "ask", label: "Ask", icon: TrendingUp },
  ];

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: PAPER, fontFamily: "'Söhne','Helvetica Neue',Arial,sans-serif" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E5E1D3" }}>
        <div className="flex items-center gap-2"><Sparkles size={16} color={ACCENT} /><span className="font-semibold text-sm" style={{ color: INK }}>AI Business Manager</span></div>
        <div className="flex items-center gap-3">
          {plan && <span className="text-[10px]" style={{ color: MUTED }}>{plan.plan} · {plan.used}/{plan.limit === null ? "∞" : plan.limit}</span>}
          <button onClick={logout} className="flex items-center gap-1 text-xs" style={{ color: MUTED }}><LogOut size={12} /></button>
        </div>
      </div>

      <div className="flex px-2 pt-2 gap-1 border-b overflow-x-auto" style={{ borderColor: "#E5E1D3" }}>
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap"
              style={{ color: active ? ACCENT : MUTED, borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent" }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "entry" && (
          <div className="flex flex-col h-full">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {log.length === 0 && <p className="text-xs text-center mt-8" style={{ color: MUTED }}>Try: "I sold 3 shirts at K150 each, customer Grace paid K300"</p>}
              {log.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm" style={{ background: m.role === "user" ? INK : ACCENT_SOFT, color: m.role === "user" ? "#fff" : INK }}>{m.text}</div>
                </div>
              ))}
              {loading && <p className="text-xs" style={{ color: MUTED }}>Reading that…</p>}
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "#E5E1D3" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitEntry()}
                placeholder="I sold 2 shirts at K150 each..." className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: ACCENT_SOFT, color: INK }} />
              <button onClick={submitEntry} disabled={loading || !input.trim()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ACCENT, opacity: !input.trim() ? 0.5 : 1 }}>
                <Send size={15} color="#fff" />
              </button>
            </div>
          </div>
        )}

        {tab === "dashboard" && (
          <div className="p-4 grid grid-cols-2 gap-3">
            <StatCard label="This week — profit" value={fmt(snap.week.profit)} up={snap.week.profit >= 0} />
            <StatCard label="This week — sales" value={fmt(snap.week.sales)} up />
            <StatCard label="This month — profit" value={fmt(snap.month.profit)} up={snap.month.profit >= 0} />
            <StatCard label="This month — sales" value={fmt(snap.month.sales)} up />
            <div className="col-span-2 p-3.5 rounded-xl" style={{ background: PANEL, border: "1px solid #E5E1D3" }}>
              <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: MUTED }}>Top-selling products</p>
              {snap.topProducts.length === 0 && <p className="text-xs" style={{ color: MUTED }}>No sales recorded yet.</p>}
              {snap.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-xs py-1" style={{ color: INK }}><span>{p.item}</span><span style={{ color: MUTED }}>{p.qty} sold · {fmt(p.revenue)}</span></div>
              ))}
            </div>
          </div>
        )}

        {tab === "debts" && (
          <div className="p-4 space-y-2">
            {snap.debts.length === 0 && <p className="text-xs" style={{ color: MUTED }}>Nobody owes you money right now.</p>}
            {snap.debts.map((d, i) => (
              <div key={i} className="flex justify-between p-3 rounded-lg" style={{ background: PANEL, border: "1px solid #E5E1D3" }}>
                <span className="text-sm" style={{ color: INK }}>{d.name}</span><span className="text-sm font-medium" style={{ color: "#B5453F" }}>{fmt(d.total_debt)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "inventory" && (
          <div className="p-4 space-y-2">
            {snap.inventory.length === 0 && <p className="text-xs" style={{ color: MUTED }}>No stock recorded yet.</p>}
            {snap.inventory.map((s, i) => (
              <div key={i} className="flex justify-between p-3 rounded-lg" style={{ background: PANEL, border: "1px solid #E5E1D3" }}>
                <span className="text-sm" style={{ color: INK }}>{s.item}</span><span className="text-sm" style={{ color: s.quantity <= 3 ? "#B5453F" : MUTED }}>{s.quantity} left</span>
              </div>
            ))}
          </div>
        )}

        {tab === "ask" && (
          <div className="p-4">
            <div className="flex gap-2 mb-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                placeholder="Who owes me money? / How much did I make this week?" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: ACCENT_SOFT, color: INK }} />
              <button onClick={askQuestion} disabled={loading || !question.trim()} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: ACCENT, color: "#fff" }}>Ask</button>
            </div>
            {loading && <p className="text-xs" style={{ color: MUTED }}>Checking your numbers…</p>}
            {answer && <div className="p-3.5 rounded-xl text-sm leading-relaxed" style={{ background: PANEL, border: "1px solid #E5E1D3", color: INK }}>{answer}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, up }) {
  return (
    <div className="p-3.5 rounded-xl" style={{ background: PANEL, border: "1px solid #E5E1D3" }}>
      <p className="text-[10px] uppercase tracking-wide" style={{ color: MUTED }}>{label}</p>
      <div className="flex items-center gap-1 mt-1">
        <p className="text-lg font-semibold" style={{ color: INK }}>{value}</p>
        {up ? <ArrowUpRight size={13} color={ACCENT} /> : <ArrowDownRight size={13} color="#B5453F" />}
      </div>
    </div>
  );
}
