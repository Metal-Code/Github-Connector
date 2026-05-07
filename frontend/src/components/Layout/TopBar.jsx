import { useApp } from "../../context/AppContext";
import Icon from "../ui/Icon";

export default function TopBar() {
  // const { colors, isDark, toggleTheme, setPage, page } = useApp();
  const { colors, isDark, toggleTheme, setPage, page, files } = useApp();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 48,
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", zIndex: 50,
    }}>
      {/* Logo */}
      <div onClick={() => setPage("connect")} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: colors.textPrimary, cursor: "pointer" }}>
        <Icon name="terminal" size={20} color="#0078D4" />
        CodeReview AI
      </div>

      {/* Nav — only real pages */}
      <nav style={{ display: "flex", alignItems: "center", gap: 24, height: "100%" }}>
        {[
          // { label: "DASHBOARD",  active: ["connect","browser","review","error"].includes(page), onClick: () => setPage("connect") },
          { label: "DASHBOARD", active: ["connect","browser","review","error"].includes(page), onClick: () => setPage(files.length > 0 ? "browser" : "connect") },
          { label: "REPOSITORIES", active: page === "repos",   onClick: () => setPage("repos") },
          { label: "ISSUES",     active: page === "issues",   onClick: () => setPage("issues") },
          { label: "COMMITS",    active: page === "commits",  onClick: () => setPage("commits") },
        ].map(item => (
          <a key={item.label} href="#"
            onClick={e => { e.preventDefault(); item.onClick(); }}
            style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", textDecoration: "none",
              color: item.active ? colors.textPrimary : colors.textMuted,
              borderBottom: item.active ? "2px solid #0078D4" : "2px solid transparent",
              paddingBottom: 2, height: "100%", display: "flex", alignItems: "center",
              marginTop: 2, transition: "color 0.15s", cursor: "pointer",
            }}
          >{item.label}</a>
        ))}
      </nav>

      {/* Right — only theme toggle and settings */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggleTheme} title="Toggle theme"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#161b22" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Icon name={isDark ? "light_mode" : "dark_mode"} size={20} color={colors.textMuted} />
        </button>
        {/* <button title="Settings"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#161b22" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Icon name="settings" size={20} color={colors.textMuted} />
        </button> */}
      </div>
    </header>
  );
}