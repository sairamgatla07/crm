const Lead = require("../models/Lead");
const Activity = require("../models/Activity");
const Task = require("../models/Task");

// GET /api/leads?search=...
exports.getLeads = async (req, res, next) => {
  try {
    console.log("in get leads ")
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
        ],
      };
    }
    const leads = await Lead.find(query).sort({ updatedAt: -1 });
    console.log("leads are", leads)
    res.json({ success: true, data: leads });
  } catch (err) {
    next(err);
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    const activities = await Activity.find({ leadId: req.params.id }).sort({
      createdAt: -1,
    });
    const tasks = await Task.find({ leadId: req.params.id }).sort({
      dueDate: 1,
    });
    res.json({ success: true, data: { lead, activities, tasks } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/leads/:id/stage
exports.updateStage = async (req, res, next) => {
  try {
    const validStages = ["New", "Contacted", "Qualified", "Proposal", "Won"];
    const { stage } = req.body;
    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: "Invalid stage. Must be one of: " + validStages.join(", "),
      });
    }
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { dealStage: stage },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};
