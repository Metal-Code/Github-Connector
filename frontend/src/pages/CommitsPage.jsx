import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

function DiffBar({ additions = 0, deletions = 0 }) {
  const total = additions + deletions || 1;
  const addPct = Math.round((additions / total) * 5);
  const delPct = 5 - addPct;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "#3fb950", fontFamily: "JetBrains Mono, monospace" }}>+{additions}</span>
      <span style={{ fontSize: 11, color: "#f85149", fontFamily: "JetBrains Mono, monospace" }}>-{deletions}</span>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: i < addPct ? "#3fb950" : i < addPct + delPct ? "#f85149" : "#30363D" }} />
        ))}
      </div>
    </div>
  );
}

export default function CommitsPage() {
  const { colors, repoPath, branch, parseRepo } = useApp();
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

  return (
    <div style={{ display: "flex", height: "calc(100vh - 96px)", overflow: "hidden" }}>

      {/* Left sidebar */}
      <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${c.border}`, padding: "20px 16px", backgroundColor: c.cardBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚙</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.textPrimary, fontFamily: "JetBrains Mono, monospace" }}>{repoPath || "No repo"}</div>
            <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>V2.4.0-STABLE</div>
          </div>
        </div>
        {[{ icon: "📁", label: "Repositories", page: "repos" }, { icon: "⚠", label: "Issues", page: "issues" }, { icon: "🔄", label: "Commits", page: "commits", active: true }, { icon: "🧠", label: "AI Analysis", page: "review" }].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 6, marginBottom: 4, cursor: "pointer",
            backgroundColor: item.active ? "rgba(0,120,212,0.1)" : "transparent",
            color: item.active ? c.accent : c.textMuted, fontSize: 13,
          }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, margin: "0 0 4px" }}>Commit History</h1>
            <p style={{ margin: 0, fontSize: 13, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
              Tracking {branch} branch in <span style={{ color: c.accent }}>{repoPath}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ backgroundColor: c.cardBg, color: c.textPrimary, border: `1px solid ${c.border}`, borderRadius: 6, padding: "8px 16px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              ≡ Filter
            </button>
            <button onClick={fetchCommits} style={{ backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              ↺ Fetch Origin
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>Loading commits...</div>
        ) : commits.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
            {repoPath ? "No commits found." : "Connect a repository first."}
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 1, backgroundColor: c.border }} />

            {commits.map((commit, i) => (
              <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, position: "relative" }}>
                {/* Timeline dot */}
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${i === 0 ? c.accent : c.border}`, backgroundColor: c.cardBgDeep, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  {i > 0 && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: c.border }} />}
                </div>

                {/* Commit card */}
                <div style={{ flex: 1, border: `1px solid ${c.border}`, borderRadius: 8, padding: "16px 20px", backgroundColor: c.cardBg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <code style={{ backgroundColor: c.cardBgDeep, color: c.accent, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>{commit.sha}</code>
                      <span style={{ fontSize: 12, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{timeAgo(commit.date)}</span>
                    </div>
                    <DiffBar additions={20} deletions={8} />
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 500, color: c.textPrimary, lineHeight: 1.4 }}>{commit.message}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#30363D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>👤</div>
                    <span style={{ fontSize: 12, color: c.textMuted }}>{commit.author}</span>
                    <span style={{ color: c.border }}>·</span>
                    <span style={{ fontSize: 11, color: "#3fb950" }}>✓ Verified Commit</span>
                    <button style={{ marginLeft: "auto", backgroundColor: c.cardBgDeep, color: c.textPrimary, border: `1px solid ${c.border}`, borderRadius: 6, padding: "6px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      👁 Review Commit
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={fetchCommits} style={{ display: "block", margin: "20px auto 0", backgroundColor: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, borderRadius: 6, padding: "10px 32px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}>
              Load Older Commits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}