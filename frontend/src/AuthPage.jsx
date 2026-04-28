import { useState } from "react";
import { authAPI } from "./api";
import {
  Wallet, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles
} from "lucide-react";

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = isLogin
        ? await authAPI.login(payload)
        : await authAPI.register(payload);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12,
    border: "1px solid #E2E8F0", fontSize: 14, outline: "none",
    background: "#F8FAFC", boxSizing: "border-box", fontFamily: "inherit",
    color: "#1E293B", transition: "border 0.2s",
  };

  const InputIcon = ({ icon: Icon }) => (
    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
      <Icon size={16} color="#94A3B8" />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0A2540 0%, #0D3B66 40%, #0077B6 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20,
    }}>
      {/* Decorative circles */}
      <div style={{
        position: "fixed", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,180,216,0.15) 0%, transparent 70%)",
        top: -100, right: -100, pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        bottom: -50, left: -50, pointerEvents: "none",
      }} />

      <div style={{
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
        borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420,
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)", position: "relative",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #0077B6, #00B4D8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,119,182,0.3)",
          }}>
            <Wallet size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0A2540", letterSpacing: "-0.5px" }}>
            BudgetWise
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748B" }}>
            {isLogin ? "Welcome back! Sign in to your account" : "Create your free account"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: "flex", background: "#F1F5F9", borderRadius: 14, padding: 4, marginBottom: 24,
        }}>
          {["Sign In", "Sign Up"].map((label, i) => {
            const active = i === 0 ? isLogin : !isLogin;
            return (
              <button key={label} onClick={() => { setIsLogin(i === 0); setError(""); }}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 14, transition: "all 0.25s",
                  background: active ? "#0077B6" : "transparent",
                  color: active ? "#fff" : "#64748B",
                  boxShadow: active ? "0 4px 12px rgba(0,119,182,0.3)" : "none",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <div style={{ position: "relative" }}>
              <InputIcon icon={User} />
              <input placeholder="Full Name" value={form.name} required
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle} />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <InputIcon icon={Mail} />
            <input type="email" placeholder="Email address" value={form.email} required
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <InputIcon icon={Lock} />
            <input type={showPw ? "text" : "password"} placeholder="Password" value={form.password}
              required minLength={6}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
              }}>
              {showPw ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
            </button>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "#FEF2F2", borderRadius: 10,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <AlertCircle size={15} color="#EF4444" />
              <span style={{ fontSize: 13, color: "#EF4444" }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: "13px 0", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700,
            cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, transition: "all 0.25s",
            background: loading ? "#94A3B8" : "linear-gradient(135deg, #0077B6, #00B4D8)",
            color: "#fff", boxShadow: "0 4px 16px rgba(0,119,182,0.3)",
          }}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 20, textAlign: "center", fontSize: 12, color: "#94A3B8",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        }}>
          <Sparkles size={12} /> Smart budgeting for students
        </div>
      </div>
    </div>
  );
}
