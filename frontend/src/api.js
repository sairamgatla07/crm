const API_BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data.data;
}

export const api = {
  // Leads
  getLeads: (search = "") =>
    request(`/leads${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  getLead: (id) => request(`/leads/${id}`),

  updateStage: (id, stage) =>
    request(`/leads/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),

  // Activities
  getActivities: (leadId) => request(`/leads/${leadId}/activities`),

  createActivity: (leadId, type, content) =>
    request(`/leads/${leadId}/activities`, {
      method: "POST",
      body: JSON.stringify({ type, content }),
    }),

  // Tasks
  getTasks: () => request(`/tasks`),

  createTask: (leadId, title, dueDate) =>
    request(`/tasks`, {
      method: "POST",
      body: JSON.stringify({ leadId, title, dueDate }),
    }),

  completeTask: (id) =>
    request(`/tasks/${id}/complete`, { method: "PATCH" }),

  uncompleteTask: (id) =>
    request(`/tasks/${id}/uncomplete`, { method: "PATCH" }),

  // AI
  getSummary: (leadId) =>
    request(`/leads/${leadId}/summary`, { method: "POST" }),
};
