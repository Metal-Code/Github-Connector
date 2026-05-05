import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";
import { useState } from "react";
import Icon from "../components/ui/Icon";

export default function ConnectPage() {
  const { colors, repoPath, setRepoPath, branch, setBranch, setPage, setFiles, setCurrentPath, setPathHistory, setError, parseRepo } = useApp();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const c = colors;

  async function handleBrowse() {
    const parsed = parseRepo();
    if (!parsed) { setLocalError("Please enter in owner/repo format e.g. torvalds/linux"); return; }
    setLoading(true);
    setLocalError("");
    try {
      const res = await fetch(`${API_BASE}/review/repo/files?owner=${parsed.owner}&repo=${parsed.repo}&branch=${branch}&path=`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Repository not found");
      setFiles(data.items);
      setCurrentPath("");
      setPathHistory([]);
      setPage("browser");
    } catch (e) {
      setLocalError(e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: "calc(100vh - 96px)" }}>
      <div style={{ maxWidth: 640, width: "100%" }}>

        {/* Terminal header */}
        <div style={{
          backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
          borderBottom: "none", borderRadius: "8px 8px 0 0",
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f56", "#ffbd2e", "#27c93f"].map(col => (
              <div key={col} style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: col }} />
            ))}
          </div>
          <span style={{ flex: 1, textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Connect Repository
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          backgroundColor: c.cardBgDeep, border: `1px solid ${c.border}`,
          borderRadius: "0 0 8px 8px", padding: 40,
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Initialize Analysis
            </h1>
            <p style={{ fontSize: 14, color: c.textMuted, margin: 0 }}>
              Connect your repository to begin automated code review and deep diagnostics.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            {/* Repo input */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: c.textMuted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                Repository Path
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: "#0078D4", fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700 }}>$</span>
                <input
                  value={repoPath} onChange={e => setRepoPath(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBrowse()}
                  placeholder="owner/repo"
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${c.inputBorder}`, padding: "8px 0 8px 20px", fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: c.textPrimary, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderBottomColor = "#0078D4"}
                  onBlur={e => e.target.style.borderBottomColor = c.inputBorder}
                />
              </div>
            </div>

            {/* Branch input */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: c.textMuted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                Branch / Ref
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <Icon name="account_tree" size={16} color={c.textMuted} />
                </span>
                <input
                  value={branch} onChange={e => setBranch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBrowse()}
                  placeholder="main"
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${c.inputBorder}`, padding: "8px 0 8px 24px", fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: c.textPrimary, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderBottomColor = "#0078D4"}
                  onBlur={e => e.target.style.borderBottomColor = c.inputBorder}
                />
              </div>
            </div>
          </div>

          {localError && (
            <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid #f85149", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#f85149", marginBottom: 16, fontFamily: "JetBrains Mono, monospace" }}>
              ✕ {localError}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
            <button onClick={handleBrowse} disabled={!repoPath || loading} style={{
              backgroundColor: !repoPath || loading ? "#21262d" : "#0078D4",
              color: !repoPath || loading ? c.textMuted : "white",
              border: "none", borderRadius: 8, padding: "16px",
              fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              cursor: !repoPath || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
              <Icon name="rocket_launch" size={16} color={!repoPath || loading ? c.textMuted : "white"} />
              {loading ? "Loading..." : "Browse Files"}
            </button>

            <button disabled style={{
              backgroundColor: "transparent", border: `1px solid ${c.border}`,
              color: c.textMuted, borderRadius: 8, padding: "16px",
              fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              cursor: "not-allowed", opacity: 0.6,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span style={{ width: 14, height: 14, border: `2px solid ${c.textMuted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
              Analyzing...
            </button>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9L7wALVu4CYLWZ445skH6KAQ7DiZGUyOTvN9nWKRf4XXPbMYdwUz6SfoYmmp8IozLNVi0Q6yxvyvgqT31PTeovfMI9g6-KG8Pv4VpUeRvomm3mrWJa3seqf5lN1USolQbVRE3JB5xiOprR4CTh_9IWR8RnPWhZheI3uClXouUUlzT0E-lAzWTuKinManUeHAspRGz9qzkajq7J1pXne6uaSO3R0Wi-ysks-AmCGlfzWJxq7V_RwCgtZqadQ2B82Tpaj0MUnOEv2R",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAqwyJzgFmtmG2KE9xmZtxidb_iodpww1iZRtAmhj8liBoWC0RIYPVfj-gUwqG0B8_eYbwLzEUg07xzMlUVjU7l_zD0_NffFfZH2h-GDzi4MIFQwbiuSJYsTljHeX1qchqpmfKTg-Ab49HrcYBTiURGsKyLAlyrn1fCi0e3mR9Z-zbv-AlClfwYpNp7bj3tz9_lrs4mkeL7rZSdovaGfXvNglS5qAYIqBFdhoZcAg4B7T5HxyeFacLklefnzCQN0OhDhk9nK0xJ5_Fd"
              ].map((src, i) => (
                <img key={i} src={src} alt="user" style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${c.cardBgDeep}`, marginLeft: i > 0 ? -8 : 0, objectFit: "cover" }} />
              ))}
              <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#30363D", border: `2px solid ${c.cardBgDeep}`, marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: c.textMuted }}>
                +12
              </div>
            </div>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: c.textMuted }}>
              Trusted by teams at Vercel, Stripe, and Railway.
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}