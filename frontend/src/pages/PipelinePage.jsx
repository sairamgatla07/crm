import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Won"];

function formatCurrency(value) {
  if (value == null) return "—";
  return "$" + value.toLocaleString();
}

export default function PipelinePage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

  const loadLeads = () => {
    setLoading(true);
    api
      .getLeads()
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStageChange = (leadId, newStage) => {
    setUpdating((prev) => ({ ...prev, [leadId]: true }));
    api
      .updateStage(leadId, newStage)
      .then(() => {
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, dealStage: newStage } : l))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating((prev) => ({ ...prev, [leadId]: false })));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, color: "var(--color-neutral-900)", marginBottom: 20 }}>Pipeline</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
          gap: 16,
        }}
      >
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.dealStage === stage);
          return (
            <div key={stage} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "var(--color-neutral-100)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-neutral-700)" }}>{stage}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-400)" }}>{stageLeads.length}</span>
              </div>
              {stageLeads.length === 0 ? (
                <div style={{ color: "var(--color-neutral-400)", fontSize: 13, textAlign: "center", padding: 16 }}>
                  No leads
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="card"
                    style={{ padding: 14, cursor: "pointer" }}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{lead.name}</div>
                    <div style={{ fontSize: 13, color: "var(--color-neutral-500)", marginBottom: 8 }}>{lead.company}</div>
                    <div style={{ fontSize: 13, color: "var(--color-neutral-600)", marginBottom: 10 }}>
                      {formatCurrency(lead.dealValue)}
                    </div>
                    <select
                      value={lead.dealStage}
                      disabled={updating[lead._id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStageChange(lead._id, e.target.value)}
                      style={{ width: "100%", fontSize: 13 }}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
