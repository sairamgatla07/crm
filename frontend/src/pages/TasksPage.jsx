import { useState, useEffect } from "react";
import { api } from "../api.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [leadId, setLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getTasks(), api.getLeads()])
      .then(([taskData, leadData]) => {
        setTasks(taskData);
        setLeads(leadData);
        if (leadData.length > 0) setLeadId(leadData[0]._id);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!leadId || !title.trim() || !dueDate) {
      setFormError("All fields are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    setFormSuccess("");
    api
      .createTask(leadId, title, dueDate)
      .then(() => {
        setTitle("");
        setDueDate("");
        setFormSuccess("Task created.");
        loadData();
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setSaving(false));
  };

  const handleToggle = (task) => {
    if (task.completed) {
      api.uncompleteTask(task._id).then(() => loadData()).catch((err) => setError(err.message));
    } else {
      api.completeTask(task._id).then(() => loadData()).catch((err) => setError(err.message));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, color: "var(--color-neutral-900)" }}>Tasks</h1>

      {error && <div className="error-msg">{error}</div>}

      {/* Create Task Form */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-neutral-700)" }}>Create Follow-up Task</h3>
        {formError && <div className="error-msg" style={{ marginBottom: 12 }}>{formError}</div>}
        {formSuccess && <div className="success-msg" style={{ marginBottom: 12 }}>{formSuccess}</div>}
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>Lead</label>
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} — {l.company}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>Task Title</label>
            <input
              type="text"
              placeholder="e.g. Follow up with customer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
            <label style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Create Task"}
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="card" style={{ overflow: "hidden" }}>
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-neutral-50)" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Task</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Lead / Company</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Due Date</th>
                <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Status</th>
                <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 600, color: "var(--color-neutral-600)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.completed);
                return (
                  <tr key={task._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 500, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "var(--color-neutral-400)" : "var(--color-neutral-700)" }}>
                      {task.title}
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--color-neutral-600)" }}>
                      {task.leadId ? `${task.leadId.name} — ${task.leadId.company}` : "—"}
                    </td>
                    <td style={{ padding: "10px 16px", color: overdue ? "var(--color-error)" : "var(--color-neutral-600)", fontWeight: overdue ? 600 : 400 }}>
                      {formatDate(task.dueDate)}{overdue ? " (overdue)" : ""}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      {task.completed ? (
                        <span className="badge badge-won">Done</span>
                      ) : (
                        <span className="badge badge-new">Open</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggle(task)}
                        className={task.completed ? "btn-secondary" : "btn-success"}
                        style={{ fontSize: 13, padding: "5px 12px" }}
                      >
                        {task.completed ? "Uncomplete" : "Complete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
