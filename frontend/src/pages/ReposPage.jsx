import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";

const LANG_COLORS = { TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", default: "#8b949e" };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function ReposPage() {
  const { colors, setRepoPath, setBranch, setPage, parseRepo } = useApp();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [searched, setSearched] = useState(false);
  const c = colors;

  async function fetchRepos() {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/repos/user?username=${username}`);
      const data = await res.json();
      if (res.ok) { setRepos(data.repositories || []); setSearched(true); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleReview(repo) {
    setRepoPath(`${username}/${repo.name}`);
    setBranch(repo.default_branch || "main");
    setPage("browser");
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 96px)", overflow: "hidden" }}>

      {/* Left sidebar */}
      <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${c.border}`, padding: "20px 16px", backgroundColor: c.cardBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: "#3178c6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚙</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.textPrimary, fontFamily: "JetBrains Mono, monospace" }}>{username || "No user"}</div>
            <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>V2.4.0-STABLE</div>
          </div>
        </div>
        {[{ icon: "📁", label: "Repositories", active: true }, { icon: "⚠", label: "Issues" }, { icon: "🔄", label: "Commits" }, { icon: "🧠", label: "AI Analysis" }].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 6, marginBottom: 4, cursor: "pointer",
            backgroundColor: item.active ? "rgba(0,120,212,0.1)" : "transparent",
            color: item.active ? c.accent : c.textMuted, fontSize: 13,
          }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${c.border}`, marginTop: 32 }}>
          {[{ icon: "📖", label: "Docs" }, { icon: "⚙", label: "Settings" }].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, marginBottom: 4, cursor: "pointer", color: c.textMuted, fontSize: 13 }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, margin: "0 0 4px" }}>Repositories</h1>
            <p style={{ margin: 0, fontSize: 13, color: c.textMuted }}>Manage and review your connected projects from GitHub.</p>
          </div>
          <button onClick={() => setPage("connect")} style={{
            backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6,
            padding: "10px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11,
            fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>+ Connect Repository</button>
        </div>

        {/* Username input */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchRepos()}
            placeholder="Enter GitHub username to load repos..."
            style={{ flex: 1, backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 6, padding: "10px 14px", color: c.textPrimary, fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none" }}
          />
          <button onClick={fetchRepos} disabled={!username || loading} style={{
            backgroundColor: !username || loading ? "#21262d" : c.accent,
            color: !username || loading ? c.textMuted : "white",
            border: "none", borderRadius: 6, padding: "10px 20px",
            fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase", cursor: !username || loading ? "not-allowed" : "pointer",
          }}>{loading ? "Loading..." : "Load Repos"}</button>
        </div>

        {/* Stats bar */}
        {searched && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            {[
              { label: "TOTAL REPOS", value: repos.length },
              { label: "AI COVERAGE", value: "92%", color: c.accent },
              { label: "PENDING REVIEWS", value: "08", color: "#d29522" },
              { label: "AVG. HEALTH SCORE", value: "84/100" },
            ].map((stat, i) => (
              <div key={i} style={{ padding: "16px 20px", backgroundColor: c.cardBg, borderRight: i < 3 ? `1px solid ${c.border}` : "none" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color || c.textPrimary, fontFamily: "Inter, sans-serif" }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Repos table */}
        {repos.length > 0 && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 140px 100px", backgroundColor: c.cardBg, borderBottom: `1px solid ${c.border}`, padding: "10px 16px" }}>
              {["Repository", "Primary Language", "Branch", "Last Updated", "Action"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>
            {repos.map((repo, i) => {
              const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 160px 160px 140px 100px",
                  padding: "14px 16px", borderBottom: i < repos.length - 1 ? `1px solid ${c.borderSubtle}` : "none",
                  transition: "background 0.1s", cursor: "pointer",
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = c.hoverBg}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.textPrimary, fontFamily: "JetBrains Mono, monospace" }}>{repo.name}</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>github.com/{username}/{repo.name}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {repo.language && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: c.textMuted }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: langColor, display: "inline-block" }} />
                      {repo.language}
                    </span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
                    🌿 {repo.default_branch || "main"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: c.textMuted }}>
                    {timeAgo(repo.updated_at)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => handleReview(repo)} style={{
                      backgroundColor: "transparent", color: c.accent,
                      border: `1px solid ${c.accent}`, borderRadius: 4,
                      padding: "4px 14px", fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                      textTransform: "uppercase", cursor: "pointer",
                    }}>Review</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { icon: "✦", title: "Enable Auto-Review", desc: "Automatically trigger AI reviews on every new pull request to maintain high code quality standards.", cta: "Learn More →", color: "#1a2744" },
            { icon: "⬛", title: "CLI Integration", desc: "Run reviews directly from your terminal using our official CLI tool for local development workflows.", cta: "View Docs →", color: "#1a2744" },
          ].map((card, i) => (
            <div key={i} style={{ border: `1px solid ${c.border}`, borderRadius: 8, padding: 24, backgroundColor: c.cardBg }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: "#21262d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>{card.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: c.textPrimary }}>{card.title}</h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>{card.desc}</p>
              <a href="#" style={{ fontSize: 12, fontWeight: 700, color: c.accent, textDecoration: "none", fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{card.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}