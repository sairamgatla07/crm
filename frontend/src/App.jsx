import { Routes, Route, NavLink } from "react-router-dom";
import LeadsPage from "./pages/LeadsPage.jsx";
import LeadDetailsPage from "./pages/LeadDetailsPage.jsx";
import PipelinePage from "./pages/PipelinePage.jsx";
import TasksPage from "./pages/TasksPage.jsx";

const navItems = [
  { to: "/", label: "Leads", end: true },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/tasks", label: "Tasks" },
];

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 32,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--color-neutral-900)" }}>
          Sales CRM
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: "6px 14px",
                borderRadius: "var(--radius)",
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? "var(--color-primary)" : "var(--color-neutral-500)",
                background: isActive ? "var(--color-primary-light)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: "24px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}
