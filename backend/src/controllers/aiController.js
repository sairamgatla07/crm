const Lead = require("../models/Lead");
const Activity = require("../models/Activity");
const Task = require("../models/Task");
const { generateSummary } = require("../services/aiService");

// POST /api/leads/:id/summary
exports.getSummary = async (req, res, next) => {
  try {
    console.log("in ai summary ");
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const activities = await Activity.find({ leadId: req.params.id }).sort({
      createdAt: -1,
    });
    const tasks = await Task.find({ leadId: req.params.id }).sort({ dueDate: 1 });

    const result = await generateSummary(lead, activities, tasks);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
