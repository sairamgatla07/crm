const Lead = require("../models/Lead");
const Activity = require("../models/Activity");

const VALID_TYPES = ["Note", "Call", "Email", "Meeting", "Demo"];

// GET /api/leads/:id/activities
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ leadId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
};

// POST /api/leads/:id/activities
exports.createActivity = async (req, res, next) => {
  try {
    const { type, content } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid activity type. Must be one of: " + VALID_TYPES.join(", "),
      });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const activity = await Activity.create({
      leadId: req.params.id,
      type,
      content: content.trim(),
    });

    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};
