import { useApp } from "../../context/AppContext";
import Icon from "../ui/Icon";

export default function TopBar() {
  const { colors, isDark, toggleTheme, page, setPage } = useApp();

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

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: 24, height: "100%" }}>
        {[
          { label: "DASHBOARD",     active: ["connect","browser","review","error"].includes(page) },
          { label: "PULL REQUESTS", active: false },
          { label: "BENCHMARKS",    active: false },
        ].map((item) => (
          <a key={item.label} href="#" onClick={e => e.preventDefault()} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            color: item.active ? colors.textPrimary : colors.textMuted,
            borderBottom: item.active ? "2px solid #0078D4" : "2px solid transparent",
            paddingBottom: 2, height: "100%", display: "flex", alignItems: "center",
            marginTop: 2, transition: "color 0.15s",
          }}>{item.label}</a>
        ))}
      </nav>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: isDark ? "#161b22" : "#f1f5f9",
          border: `1px solid ${colors.border}`,
          borderRadius: 4, padding: "4px 10px",
          fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: colors.textMuted,
        }}>
          <Icon name="search" size={16} color={colors.textMuted} />
          <span>Jump to...</span>
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#161b22" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Icon name={isDark ? "light_mode" : "dark_mode"} size={20} color={colors.textMuted} />
        </button>

        {/* Settings */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#161b22" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Icon name="settings" size={20} color={colors.textMuted} />
        </button>

        {/* Account */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#161b22" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Icon name="account_circle" size={20} color={colors.textMuted} />
        </button>
      </div>
    </header>
  );
}