import { useApp } from "./context/AppContext";
import TopBar from "./components/Layout/TopBar";
import Sidebar from "./components/Layout/Sidebar";
import Footer from "./components/Layout/Footer";
import Banner from "./components/Banner";
import ConnectPage from "./pages/ConnectPage";
import ErrorPage from "./pages/ErrorPage";
import BrowserPage from "./pages/BrowserPage";
import ReviewPage from "./pages/ReviewPage";
import IssuesPage from "./pages/IssuesPage";
import CommitsPage from "./pages/CommitsPage";
import ReposPage from "./pages/ReposPage";

function PageContent() {
  const { page } = useApp();
  switch (page) {
    case "connect":  return <ConnectPage />;
    case "error":    return <ErrorPage />;
    case "browser":  return <BrowserPage />;
    case "review":   return <ReviewPage />;
    case "issues":   return <IssuesPage />;
    case "commits":  return <CommitsPage />;
    case "repos":    return <ReposPage />;
    default:         return <ConnectPage />;
  }
}

export default function App() {
  const { colors, isDark } = useApp();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bg,
      backgroundImage: `radial-gradient(${isDark ? "#30363D" : "#cbd5e1"} 0.5px, transparent 0.5px)`,
      backgroundSize: "24px 24px",
      fontFamily: "Inter, sans-serif",
      color: colors.textPrimary,
      overflow: "hidden",
    }}>
      <TopBar />
      <Sidebar />
      <main style={{ marginLeft: 64, paddingTop: 48, paddingBottom: 24, minHeight: "100vh" }}>
        <Banner />
        <PageContent />
      </main>
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #404752; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </div>
  );
}