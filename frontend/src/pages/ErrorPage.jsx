import { useApp } from "../context/AppContext";

export default function ErrorPage() {
  const { colors, error, setPage, repoPath } = useApp();
  const c = colors;

  const isFileTooLarge = error?.includes("too large") || error?.includes("100KB");
  const isNotFound = !isFileTooLarge;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 96px)" }}>

      {/* Left panel — file tree skeleton */}
      <div style={{ width: 240, borderRight: `1px solid ${c.border}`, padding: 16, flexShrink: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Workspace</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.accent, fontFamily: "JetBrains Mono, monospace" }}>
            🌿 main-branch
          </div>
        </div>
        {/* Skeleton rows */}
        {[80, 140, 100, 120, 100, 80].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c.border, flexShrink: 0 }} />
            <div style={{ height: 10, width: w, borderRadius: 4, backgroundColor: c.border }} />
          </div>
        ))}
      </div>

      {/* Center — error state */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        {isNotFound && (
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.6 }}>🔍</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary, margin: "0 0 16px" }}>Repo Not Found</h2>
            <p style={{ fontSize: 14, color: c.textMuted, margin: "0 0 32px", lineHeight: 1.6 }}>
              We couldn't locate the repository "<strong style={{ color: c.textPrimary }}>{repoPath}</strong>". It might have been deleted, renamed, or you may lack necessary permissions.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setPage("connect")} style={{
                backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6,
                padding: "10px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11,
                fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
              }}>Try Reconnecting</button>
              <button onClick={() => setPage("connect")} style={{
                backgroundColor: "transparent", color: c.textMuted,
                border: `1px solid ${c.border}`, borderRadius: 6,
                padding: "10px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11,
                fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
              }}>Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel — file too large warning */}
      {isFileTooLarge && (
        <div style={{ width: 420, borderLeft: `1px solid ${c.border}`, padding: 24 }}>
          <div style={{
            border: "1px solid #f85149", borderRadius: 8, padding: 20,
            backgroundColor: "rgba(248,81,73,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f85149", fontFamily: "JetBrains Mono, monospace" }}>
                File Too Large for Analysis
              </span>
            </div>
            <div style={{ backgroundColor: c.cardBgDeep, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              <span style={{ color: "#f85149", fontWeight: 700 }}>ERROR: </span>
              <span style={{ color: c.textMuted }}>{error}</span>
              <br />
              <span style={{ color: c.textMuted }}>Max allowed size: 100.0 KB</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Instructions:</div>
              <ul style={{ margin: 0, paddingLeft: 16, color: c.textMuted, fontSize: 13, lineHeight: 2 }}>
                <li>Exclude binary files using the <code style={{ backgroundColor: c.border, padding: "1px 6px", borderRadius: 3, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>.ai-ignore</code> configuration.</li>
                <li>Split large source files into smaller modules for precise analysis.</li>
                <li>Use the CLI to skip individual large assets during the review process.</li>
              </ul>
            </div>
            <button onClick={() => setPage("browser")} style={{
              backgroundColor: "#f85149", color: "white", border: "none", borderRadius: 6,
              padding: "10px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
            }}>Bypass Analysis</button>
          </div>
        </div>
      )}
    </div>
  );
}