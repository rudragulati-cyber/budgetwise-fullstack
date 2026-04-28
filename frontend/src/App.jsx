import { useState, useEffect, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Plus, Wallet, TrendingUp, TrendingDown, X, IndianRupee, LayoutDashboard, List, Target, Sparkles, AlertCircle, ArrowUpCircle, ArrowDownCircle, Trash2, LogOut } from "lucide-react";
import { transactionsAPI, budgetsAPI } from "./api";
import AuthPage from "./AuthPage";

const CATEGORIES = ["Food","Transport","Education","Entertainment","Utilities","Health","Shopping","Others"];
const CAT_COLORS = { Food:"#00B4D8", Transport:"#0077B6", Education:"#F59E0B", Entertainment:"#8B5CF6", Utilities:"#10B981", Health:"#EF4444", Shopping:"#EC4899", Others:"#64748B" };
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

function KPICard({ label, value, icon: Icon, color, sub }) {
  return (<div style={{ background:"#fff", borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)", borderLeft:`4px solid ${color}`, display:"flex", flexDirection:"column", gap:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:13, color:"#64748B", fontWeight:500 }}>{label}</span>
      <div style={{ width:36, height:36, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={18} color={color} /></div>
    </div>
    <div style={{ fontSize:26, fontWeight:700, color:"#0A2540" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:"#94A3B8" }}>{sub}</div>}
  </div>);
}

function BudgetBar({ category, limit, spent }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : CAT_COLORS[category] || "#00B4D8";
  return (<div style={{ marginBottom:14 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:13 }}>
      <span style={{ fontWeight:600, color:"#1E293B" }}>{category}</span>
      <span style={{ color:"#64748B" }}>{fmt(spent)} / {fmt(limit)}</span>
    </div>
    <div style={{ height:8, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width 0.5s ease" }} />
    </div>
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontSize:11, color:"#94A3B8" }}>
      <span>{pct.toFixed(0)}% used</span>
      <span style={{ color: pct >= 90 ? "#EF4444" : "#10B981" }}>{pct >= 100 ? "⚠ Exceeded!" : `${fmt(limit - spent)} left`}</span>
    </div>
  </div>);
}

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ type:"expense", amount:"", category:"Food", description:"", date: new Date().toISOString().split("T")[0] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const is = { width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #E2E8F0", fontSize:14, outline:"none", background:"#F8FAFC", boxSizing:"border-box", fontFamily:"inherit", color:"#1E293B" };
  const ls = { fontSize:13, fontWeight:600, color:"#374151", marginBottom:4, display:"block" };
  const handleSubmit = async () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true);
    try {
      const res = await transactionsAPI.create({ ...form, amount: parseFloat(form.amount) });
      onAdd(res.data); onClose();
    } catch (e) { setError(e.response?.data?.detail || "Failed to add"); }
    finally { setLoading(false); }
  };
  return (<div style={{ position:"fixed", inset:0, background:"rgba(10,37,64,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
    <div style={{ background:"#fff", borderRadius:20, padding:"28px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <h3 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0A2540" }}>Add Transaction</h3>
        <button onClick={onClose} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><X size={18} color="#64748B" /></button>
      </div>
      <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, marginBottom:18 }}>
        {["expense","income"].map(t => (<button key={t} onClick={() => setForm(f=>({...f,type:t,category:t==="income"?"Income":"Food"}))} style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", cursor:"pointer", fontWeight:600, fontSize:14, transition:"all 0.2s", background: form.type===t ? (t==="income"?"#10B981":"#EF4444") : "transparent", color: form.type===t ? "#fff" : "#64748B" }}>{t==="income" ? "💰 Income" : "💸 Expense"}</button>))}
      </div>
      <div style={{ display:"grid", gap:14 }}>
        <div><label style={ls}>Amount (₹)</label><input type="number" placeholder="0.00" value={form.amount} onChange={e => { setForm(f=>({...f,amount:e.target.value})); setError(""); }} style={is} /></div>
        <div><label style={ls}>Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={is}>{(form.type==="income" ? ["Income","Freelance","Others"] : CATEGORIES).map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label style={ls}>Description</label><input type="text" placeholder="e.g. Lunch" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={is} /></div>
        <div><label style={ls}>Date</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={is} /></div>
      </div>
      {error && <div style={{ marginTop:12, padding:"8px 12px", background:"#FEF2F2", borderRadius:8, display:"flex", gap:8, alignItems:"center" }}><AlertCircle size={15} color="#EF4444" /><span style={{ fontSize:13, color:"#EF4444" }}>{error}</span></div>}
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop:20, width:"100%", padding:"12px 0", borderRadius:12, background: form.type==="income" ? "#10B981" : "#0077B6", color:"#fff", border:"none", fontSize:15, fontWeight:700, cursor: loading?"wait":"pointer" }}>{loading ? "Adding..." : `Add ${form.type === "income" ? "Income" : "Expense"}`}</button>
    </div>
  </div>);
}

export default function BudgetWise() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({ Food:4000, Transport:1200, Education:2000, Entertainment:800, Utilities:1000, Health:1500, Shopping:2000, Others:600 });
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [txRes, budRes] = await Promise.all([transactionsAPI.getAll(), budgetsAPI.get()]);
      setTransactions(txRes.data);
      if (budRes.data.budgets && Object.keys(budRes.data.budgets).length > 0) setBudgets(budRes.data.budgets);
    } catch (e) { console.error("Load error", e); }
    finally { setDataLoaded(true); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setTransactions([]); setDataLoaded(false); };

  if (!user || !localStorage.getItem("token")) return <AuthPage onLogin={handleLogin} />;

  const income = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const balance = income - expenses;
  const categorySpend = {};
  transactions.filter(t=>t.type==="expense").forEach(t => { categorySpend[t.category] = (categorySpend[t.category]||0) + t.amount; });
  const pieData = Object.entries(categorySpend).map(([name,value])=>({name,value}));
  const filteredTxns = filterCat === "All" ? [...transactions] : transactions.filter(t=>t.category===filterCat);
  const predictions = Object.entries(categorySpend).reduce((acc, [cat, spent]) => { acc[cat] = Math.round(spent * 1.15); return acc; }, {});

  const handleAdd = (tx) => setTransactions(prev => [tx, ...prev]);
  const handleDelete = async (id) => {
    try { await transactionsAPI.delete(id); setTransactions(prev => prev.filter(t=>t.id!==id)); } catch(e) { alert("Failed to delete"); }
  };

  const navItems = [
    { id:"dashboard", icon:LayoutDashboard, label:"Dashboard" },
    { id:"transactions", icon:List, label:"Transactions" },
    { id:"budgets", icon:Target, label:"Budgets" },
    { id:"predictions", icon:Sparkles, label:"Predictions" },
  ];

  if (!dataLoaded) return (<div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F0F4F8", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#0077B6,#00B4D8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"pulse 1.5s infinite" }}><Wallet size={24} color="#fff" /></div>
      <p style={{ color:"#64748B", fontSize:14 }}>Loading your data...</p>
    </div>
  </div>);

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F8", fontFamily:"'Segoe UI', system-ui, sans-serif", display:"flex", flexDirection:"column" }}>
      <header style={{ background:"#0A2540", color:"#fff", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, boxShadow:"0 2px 12px rgba(0,0,0,0.2)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:"#00B4D8", display:"flex", alignItems:"center", justifyContent:"center" }}><Wallet size={18} color="#fff" /></div>
          <span style={{ fontWeight:800, fontSize:20 }}>BudgetWise</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#8FB3CC" }}>Hi, {user.name}</span>
          <button onClick={() => setShowModal(true)} style={{ display:"flex", alignItems:"center", gap:7, background:"#00B4D8", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:14, fontWeight:600, cursor:"pointer" }}><Plus size={16} /> Add</button>
          <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(239,68,68,0.15)", color:"#EF4444", border:"none", borderRadius:10, padding:"8px 12px", fontSize:13, fontWeight:600, cursor:"pointer" }}><LogOut size={14} /> Logout</button>
        </div>
      </header>

      <nav style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", display:"flex", overflowX:"auto", padding:"0 16px" }}>
        {navItems.map(({ id, icon: Icon, label }) => (<button key={id} onClick={() => setTab(id)} style={{ display:"flex", alignItems:"center", gap:7, padding:"14px 18px", border:"none", background:"transparent", cursor:"pointer", whiteSpace:"nowrap", fontSize:14, fontWeight: tab===id ? 700 : 500, color: tab===id ? "#0077B6" : "#64748B", borderBottom: tab===id ? "2px solid #0077B6" : "2px solid transparent", transition:"all 0.2s" }}><Icon size={16} /> {label}</button>))}
      </nav>

      <main style={{ flex:1, padding:"24px 20px", maxWidth:1000, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>
        {tab === "dashboard" && (<div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            <KPICard label="Total Balance" value={fmt(balance)} icon={Wallet} color="#0077B6" sub="All-time net" />
            <KPICard label="Total Income" value={fmt(income)} icon={TrendingUp} color="#10B981" sub="All transactions" />
            <KPICard label="Total Expenses" value={fmt(expenses)} icon={TrendingDown} color="#EF4444" sub="All transactions" />
            <KPICard label="Transactions" value={transactions.length} icon={IndianRupee} color="#F59E0B" sub="Total count" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color:"#0A2540" }}>Spending by Category</h3>
              {pieData.length > 0 ? (<><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">{pieData.map((e) => <Cell key={e.name} fill={CAT_COLORS[e.name] || "#94A3B8"} />)}</Pie><Tooltip formatter={(v) => fmt(v)} /></PieChart></ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center" }}>{pieData.map(d => <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}><div style={{ width:8, height:8, borderRadius:99, background:CAT_COLORS[d.name]||"#94A3B8" }} /><span style={{ color:"#64748B" }}>{d.name}</span></div>)}</div></>) : <p style={{ color:"#94A3B8", textAlign:"center", padding:40 }}>Add expenses to see chart</p>}
            </div>
            <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color:"#0A2540" }}>Recent Transactions</h3>
              {transactions.length === 0 ? <p style={{ color:"#94A3B8", textAlign:"center", padding:40 }}>No transactions yet</p> :
              transactions.slice(0,6).map(tx => (<div key={tx.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:(CAT_COLORS[tx.category]||"#64748B")+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{tx.type==="income"?"💰":"💸"}</div>
                  <div><div style={{ fontSize:14, fontWeight:600, color:"#1E293B" }}>{tx.description || "No desc"}</div><div style={{ fontSize:12, color:"#94A3B8" }}>{tx.category} · {tx.date}</div></div>
                </div>
                <span style={{ fontWeight:700, fontSize:15, color: tx.type==="income"?"#10B981":"#EF4444" }}>{tx.type==="income"?"+":"-"}{fmt(tx.amount)}</span>
              </div>))}
            </div>
          </div>
        </div>)}

        {tab === "transactions" && (<div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"16px 20px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["All", ...CATEGORIES].map(c => (<button key={c} onClick={() => setFilterCat(c)} style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: filterCat===c ? "#0077B6" : "#F1F5F9", color: filterCat===c ? "#fff" : "#64748B" }}>{c}</button>))}
            </div>
          </div>
          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden" }}>
            {filteredTxns.length === 0 && <div style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>No transactions found.</div>}
            {filteredTxns.map((tx, idx) => (<div key={tx.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom: idx < filteredTxns.length-1 ? "1px solid #F8FAFC" : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:(CAT_COLORS[tx.category]||"#64748B")+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>{tx.type==="income" ? <ArrowUpCircle size={20} color="#10B981" /> : <ArrowDownCircle size={20} color={CAT_COLORS[tx.category]||"#64748B"} />}</div>
                <div><div style={{ fontSize:14, fontWeight:600, color:"#1E293B" }}>{tx.description || "No description"}</div><div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}><span style={{ background:(CAT_COLORS[tx.category]||"#64748B")+"18", color: CAT_COLORS[tx.category]||"#64748B", padding:"2px 8px", borderRadius:6, fontWeight:600, fontSize:11 }}>{tx.category}</span><span style={{ marginLeft:8 }}>{tx.date}</span></div></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontWeight:700, fontSize:16, color: tx.type==="income"?"#10B981":"#EF4444" }}>{tx.type==="income"?"+":"-"}{fmt(tx.amount)}</span>
                <button onClick={() => handleDelete(tx.id)} style={{ background:"#FEF2F2", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Trash2 size={14} color="#EF4444" /></button>
              </div>
            </div>))}
          </div>
        </div>)}

        {tab === "budgets" && (<div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
            {CATEGORIES.map(cat => (<div key={cat} style={{ background:"#fff", borderRadius:16, padding:"20px 22px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)", borderTop:`3px solid ${CAT_COLORS[cat]}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:(CAT_COLORS[cat])+"22", display:"flex", alignItems:"center", justifyContent:"center" }}><Target size={16} color={CAT_COLORS[cat]} /></div>
                <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{cat}</span>
              </div>
              <BudgetBar category={cat} limit={budgets[cat] || 1000} spent={categorySpend[cat] || 0} />
            </div>))}
          </div>
          <div style={{ background:"#0A2540", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
            <h3 style={{ margin:"0 0 12px", fontSize:16 }}>📊 Budget Summary</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[{ label:"Total Budget", value: fmt(Object.values(budgets).reduce((a,b)=>a+b,0)), color:"#00B4D8" },{ label:"Total Spent", value: fmt(expenses), color:"#EF4444" },{ label:"Remaining", value: fmt(Object.values(budgets).reduce((a,b)=>a+b,0) - expenses), color:"#10B981" }].map(({ label, value, color }) => (<div key={label}><div style={{ fontSize:12, color:"#8FB3CC", marginBottom:4 }}>{label}</div><div style={{ fontSize:20, fontWeight:700, color }}>{value}</div></div>))}
            </div>
          </div>
        </div>)}

        {tab === "predictions" && (<div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ background:"linear-gradient(135deg,#0A2540,#0077B6)", borderRadius:16, padding:"24px 28px", color:"#fff" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><Sparkles size={22} color="#00B4D8" /><h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>Smart Spending Predictions</h2></div>
            <p style={{ margin:0, color:"#8FB3CC", fontSize:14 }}>Based on your spending patterns, here's your estimated forecast.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
            {Object.entries(predictions).map(([cat, predicted]) => {
              const limit = budgets[cat] || 0; const isOver = limit > 0 && predicted > limit;
              return (<div key={cat} style={{ background:"#fff", borderRadius:16, padding:"20px 22px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)", border: isOver ? "1px solid #FCA5A5" : "1px solid #E2E8F0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{cat}</span>
                  {limit > 0 && (isOver ? <span style={{ background:"#FEF2F2", color:"#EF4444", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>⚠ Over</span> : <span style={{ background:"#F0FDF4", color:"#10B981", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>✓ OK</span>)}
                </div>
                <div style={{ fontSize:24, fontWeight:800, color: isOver?"#EF4444":"#0077B6", marginBottom:4 }}>{fmt(predicted)}</div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>Predicted · Budget: {limit > 0 ? fmt(limit) : "N/A"}</div>
                {limit > 0 && <div style={{ marginTop:12, height:6, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:99, width:`${Math.min((predicted/limit)*100,100)}%`, background: isOver ? "#EF4444" : CAT_COLORS[cat] || "#00B4D8" }} /></div>}
              </div>);
            })}
          </div>
        </div>)}
      </main>
      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
