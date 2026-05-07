import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";
import Icon from "../components/ui/Icon";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function CommitsPage() {
  const { colors, repoPath, branch, parseRepo, setPage } = useApp();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const c = colors;

  useEffect(() => { if (repoPath) fetchCommits(); }, [repoPath]);

  async function fetchCommits() {
    const parsed = parseRepo();
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/commits/list?owner=${parsed.owner}&repo=${parsed.repo}&branch=${branch}`);
      const data = await res.json();
      if (res.ok) setCommits(data.commits || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (!repoPath) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 96px)" }}>
      <div style={{ textAlign: "center" }}>
        <Icon name="account_tree" size={40} color={c.border} />
        <p style={{ marginTop: 16, fontSize: 14, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>No repository connected.</p>
        <button onClick={() => setPage("connect")} style={{ marginTop: 12, backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Connect Repository
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 96px)", overflowY: "auto", padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, margin: "0 0 4px" }}>Commit History</h1>
          <p style={{ margin: 0, fontSize: 12, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
            Tracking <span style={{ color: c.accent }}>{branch}</span> branch in <span style={{ color: c.accent }}>{repoPath}</span>
          </p>
        </div>
        <button onClick={fetchCommits} style={{ backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="sync" size={14} color="white" /> Fetch Origin
        </button>
      </div>

      {/* Commits */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>Loading commits...</div>
      ) : commits.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>No commits found.</div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 1, backgroundColor: c.border }} />
          {commits.map((commit, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 16, position: "relative" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${i === 0 ? c.accent : c.border}`, backgroundColor: c.cardBgDeep, flexShrink: 0, zIndex: 1 }} />
              <div style={{ flex: 1, border: `1px solid ${c.border}`, borderRadius: 8, padding: "14px 18px", backgroundColor: c.cardBg }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <code style={{ backgroundColor: c.cardBgDeep, color: c.accent, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>{commit.sha}</code>
                    <span style={{ fontSize: 12, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{timeAgo(commit.date)}</span>
                  </div>
                  <a href={commit.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: c.accent, textDecoration: "none", fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="open_in_new" size={12} color={c.accent} /> View
                  </a>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: c.textPrimary, lineHeight: 1.5 }}>{commit.message}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: c.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="person" size={12} color={c.textMuted} />
                  </div>
                  <span style={{ fontSize: 12, color: c.textMuted }}>{commit.author}</span>
                  <span style={{ fontSize: 12, color: c.textMuted }}>·</span>
                  <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{commit.author_username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}