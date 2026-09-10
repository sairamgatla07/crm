import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

const ACTIVITY_TYPES = ["Note", "Call", "Email", "Meeting", "Demo"];

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

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  if (value == null) return "—";
  return "$" + value.toLocaleString();
}

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Activity form state
  const [actType, setActType] = useState("Note");
  const [actContent, setActContent] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [activityMsg, setActivityMsg] = useState("");

  // AI summary state
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const loadLead = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .getLead(id)
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!actContent.trim()) return;
    setSavingActivity(true);
    setActivityMsg("");
    api
      .createActivity(id, actType, actContent)
      .then(() => {
        setActContent("");
        setActType("Note");
        setActivityMsg("Activity added.");
        loadLead();
      })
      .catch((err) => setActivityMsg("Error: " + err.message))
      .finally(() => setSavingActivity(false));
  };

  const handleGenerateSummary = () => {
    if (generating) return;
    setGenerating(true);
    setSummaryError("");
    setSummary(null);
    api
      .getSummary(id)
      .then((result) => {
        setSummary(result);
        setGenerating(false);
      })
      .catch((err) => {
        setSummaryError(err.message);
        setGenerating(false);
      });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!data) return null;

  const { lead, activities, tasks } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="btn-ghost"
        style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4 }}
      >
        ← Back to Leads
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, color: "var(--color-neutral-900)" }}>{lead.name}</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: 14, marginTop: 4 }}>
            {lead.title || "—"} at {lead.company}
          </p>
        </div>
        <span className={stageClass(lead.dealStage)} style={{ fontSize: 13, padding: "5px 14px" }}>
          {lead.dealStage}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Contact info */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-neutral-700)" }}>Contact</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow label="Name" value={lead.name} />
            <InfoRow label="Title" value={lead.title} />
            <InfoRow label="Company" value={lead.company} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Industry" value={lead.industry} />
            <InfoRow label="Company Size" value={lead.companySize != null ? lead.companySize : "—"} />
          </div>
        </div>

        {/* Deal info */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-neutral-700)" }}>Deal</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow label="Deal Value" value={formatCurrency(lead.dealValue)} />
            <InfoRow label="Current Stage" value={<span className={stageClass(lead.dealStage)}>{lead.dealStage}</span>} />
            <InfoRow label="Created" value={formatDate(lead.createdAt)} />
            <InfoRow label="Last Updated" value={formatDate(lead.updatedAt)} />
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, color: "var(--color-neutral-700)" }}>AI Summary</h3>
          <button
            onClick={handleGenerateSummary}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? "Generating summary..." : "Generate AI Summary"}
          </button>
        </div>
        {summaryError && <div className="error-msg" style={{ marginBottom: 12 }}>{summaryError}</div>}
        {summary && (
          <div>
            {summary.fallback && (
              <div className="success-msg" style={{ marginBottom: 12, background: "var(--color-warning-light)", color: "var(--color-warning)" }}>
                AI summary unavailable. Showing a summary based on CRM data.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SummarySection title="Who They Are" content={summary.who_they_are} />
              <SummarySection title="What's Important" items={summary.whats_important} />
              <SummarySection title="What Happened" items={summary.what_happened} />
              <SummarySection title="What's Missing" items={summary.whats_missing} />
            </div>
          </div>
        )}
        {!summary && !summaryError && !generating && (
          <p style={{ color: "var(--color-neutral-400)", fontSize: 14 }}>
            Click "Generate AI Summary" to get an AI-powered overview of this lead.
          </p>
        )}
      </div>

      {/* Activity History + Add Activity */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-neutral-700)" }}>Activity History</h3>
        {activities.length === 0 ? (
          <div className="empty-state">No activities yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {activities.map((act) => (
              <div
                key={act._id}
                style={{
                  padding: "12px 16px",
                  background: "var(--color-neutral-50)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className={stageClass(act.type)} style={{ fontSize: 11 }}>{act.type}</span>
                  <span style={{ fontSize: 12, color: "var(--color-neutral-400)" }}>{formatDateTime(act.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{act.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Activity Form */}
        <form onSubmit={handleAddActivity} style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
          <h4 style={{ fontSize: 14, marginBottom: 12, color: "var(--color-neutral-600)" }}>Add Activity</h4>
          {activityMsg && !activityMsg.startsWith("Error") && (
            <div className="success-msg" style={{ marginBottom: 12 }}>{activityMsg}</div>
          )}
          {activityMsg && activityMsg.startsWith("Error") && (
            <div className="error-msg" style={{ marginBottom: 12 }}>{activityMsg}</div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <select
              value={actType}
              onChange={(e) => setActType(e.target.value)}
              style={{ width: 140 }}
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <textarea
              placeholder="Enter activity content..."
              value={actContent}
              onChange={(e) => setActContent(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={savingActivity || !actContent.trim()} className="btn-primary">
              {savingActivity ? "Saving..." : "Add Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
      <span style={{ color: "var(--color-neutral-400)", minWidth: 100 }}>{label}:</span>
      <span style={{ color: "var(--color-neutral-700)" }}>{value || "—"}</span>
    </div>
  );
}

function SummarySection({ title, content, items }) {
  return (
    <div style={{ padding: 12, background: "var(--color-neutral-50)", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}>
      <h4 style={{ fontSize: 13, color: "var(--color-neutral-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h4>
      {content && <p style={{ fontSize: 14, color: "var(--color-neutral-700)", whiteSpace: "pre-line" }}>{content}</p>}
      {items && (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--color-neutral-700)", paddingLeft: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--color-neutral-400)" }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
