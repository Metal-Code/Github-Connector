import { useState } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";
import Icon from "../components/ui/Icon";

const LANG_COLORS = { TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", CSS: "#563d7c", HTML: "#e34c26" };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function ReposPage() {
  const { colors, setRepoPath, setBranch, setPage } = useApp();
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
    <div style={{ height: "calc(100vh - 96px)", overflowY: "auto", padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, margin: "0 0 4px" }}>Repositories</h1>
          <p style={{ margin: 0, fontSize: 13, color: c.textMuted }}>Search a GitHub user to load their public repositories.</p>
        </div>
        <button onClick={() => setPage("connect")} style={{ backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6, padding: "10px 16px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="add" size={14} color="white" /> Connect Repo
        </button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${c.border}`, borderRadius: 6, padding: "8px 14px", backgroundColor: c.cardBg }}>
          <Icon name="search" size={16} color={c.textMuted} />
          <input
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchRepos()}
            placeholder="Enter GitHub username..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.textPrimary, fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}
          />
        </div>
        <button onClick={fetchRepos} disabled={!username || loading} style={{ backgroundColor: !username || loading ? c.border : c.accent, color: !username || loading ? c.textMuted : "white", border: "none", borderRadius: 6, padding: "8px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: !username || loading ? "not-allowed" : "pointer" }}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Stats */}
      {searched && repos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          {[
            { label: "TOTAL REPOS", value: repos.length },
            { label: "LANGUAGES",   value: [...new Set(repos.map(r => r.language).filter(Boolean))].length },
          ].map((stat, i) => (
            <div key={i} style={{ padding: "14px 20px", backgroundColor: c.cardBg, borderRight: i < 1 ? `1px solid ${c.border}` : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.textPrimary, fontFamily: "Inter, sans-serif" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {repos.length > 0 && (
        <div style={{ border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px 100px 80px", backgroundColor: c.cardBg, borderBottom: `1px solid ${c.border}`, padding: "10px 16px" }}>
            {["Repository", "Language", "Branch", "Updated", ""].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {repos.map((repo, i) => {
            const langColor = LANG_COLORS[repo.language] || "#8b949e";
            return (
              <div key={i}
                style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px 100px 80px", padding: "12px 16px", borderBottom: i < repos.length - 1 ? `1px solid ${c.borderSubtle}` : "none", transition: "background 0.1s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = c.hoverBg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.textPrimary, marginBottom: 2 }}>{repo.name}</div>
                  {repo.description && <div style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{repo.description}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {repo.language && (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.textMuted }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: langColor, display: "inline-block", flexShrink: 0 }} />
                      {repo.language}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
                  🌿 {repo.default_branch || "main"}
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 11, color: c.textMuted }}>
                  {timeAgo(repo.updated_at)}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button onClick={() => handleReview(repo)} style={{ backgroundColor: "transparent", color: c.accent, border: `1px solid ${c.accent}`, borderRadius: 4, padding: "4px 12px", fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}>
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {searched && repos.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: 40, color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
          No repositories found for "{username}".
        </div>
      )}
    </div>
  );
}