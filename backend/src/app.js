const express = require("express");
const cors = require("cors");
const leadsRoutes = require("./routes/leads");
const tasksRoutes = require("./routes/tasks");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/leads", leadsRoutes);
app.use("/api/tasks", tasksRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
