import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Won"];

function stageClass(stage) {
  return `badge badge-${stage.toLowerCase()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value) {
  if (value == null) return "—";
  return "$" + value.toLocaleString();
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .getLeads(search)
      .then((data) => {
        if (active) {
          setLeads(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, color: "var(--color-neutral-900)" }}>Leads</h1>
        <input
          type="text"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-neutral-50)" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Name</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Company</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Title</th>
                <th style={{ textAlign: "right", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Deal Value</th>
                <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Stage</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{lead.name}</td>
                  <td style={{ padding: "10px 16px", color: "var(--color-neutral-600)" }}>{lead.company}</td>
                  <td style={{ padding: "10px 16px", color: "var(--color-neutral-600)" }}>{lead.title || "—"}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-neutral-600)" }}>{formatCurrency(lead.dealValue)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <span className={stageClass(lead.dealStage)}>{lead.dealStage}</span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--color-neutral-500)" }}>{formatDate(lead.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
