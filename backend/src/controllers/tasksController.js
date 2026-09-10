const Lead = require("../models/Lead");
const Task = require("../models/Task");

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate("leadId", "name company").sort({
      dueDate: 1,
    });
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { leadId, title, dueDate } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, error: "leadId is required" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, error: "Due date is required" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const task = await Task.create({
      leadId,
      title: title.trim(),
      dueDate: new Date(dueDate),
    });

    await task.populate("leadId", "name company");
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/complete
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true, completedAt: new Date() },
      { new: true }
    ).populate("leadId", "name company");
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/uncomplete
exports.uncompleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: false, completedAt: null },
      { new: true }
    ).populate("leadId", "name company");
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
