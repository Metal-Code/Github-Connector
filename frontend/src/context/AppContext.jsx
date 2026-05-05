import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [repoPath, setRepoPath] = useState("");
  const [branch, setBranch] = useState("main");
  const [filePath, setFilePath] = useState("");
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [pathHistory, setPathHistory] = useState([]);
  const [review, setReview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [page, setPage] = useState("connect"); // connect | browser | review | repos | issues | commits | error
  const [bannerVisible, setBannerVisible] = useState(true);
  const [error, setError] = useState("");

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Parse owner/repo from "owner/repo" string
  function parseRepo() {
    const parts = repoPath.trim().split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  }

  // Colors based on theme
  const colors = {
    bg: isDark ? "#101419" : "#f8fafc",
    headerBg: isDark ? "#0d1117" : "#ffffff",
    sidebarBg: isDark ? "#161b22" : "#ffffff",
    cardBg: isDark ? "#161b22" : "#ffffff",
    cardBgDeep: isDark ? "#0b0e14" : "#f8fafc",
    border: isDark ? "#30363D" : "#e2e8f0",
    borderSubtle: isDark ? "#21262d" : "#f1f5f9",
    textPrimary: isDark ? "#e6edf3" : "#0f172a",
    textMuted: isDark ? "#8b949e" : "#64748b",
    hoverBg: isDark ? "#21262d" : "#f1f5f9",
    inputBorder: isDark ? "#30363D" : "#cbd5e1",
    accent: "#0078D4",
    accentGreen: "#238636",
    accentRed: "#f85149",
    accentOrange: "#d29522",
  };

  return (
    <AppContext.Provider value={{
      theme, isDark, toggleTheme, colors,
      repoPath, setRepoPath,
      branch, setBranch,
      filePath, setFilePath,
      files, setFiles,
      currentPath, setCurrentPath,
      pathHistory, setPathHistory,
      review, setReview,
      fileInfo, setFileInfo,
      page, setPage,
      bannerVisible, setBannerVisible,
      error, setError,
      parseRepo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}