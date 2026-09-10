const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");
const leadsController = require("../controllers/leadsController");
const activitiesController = require("../controllers/activitiesController");
const aiController = require("../controllers/aiController");

router.get("/", leadsController.getLeads);
router.get("/:id", validateObjectId, leadsController.getLead);
router.patch("/:id/stage", validateObjectId, leadsController.updateStage);

router.get("/:id/activities", validateObjectId, activitiesController.getActivities);
router.post("/:id/activities", validateObjectId, activitiesController.createActivity);

router.post("/:id/summary", validateObjectId, aiController.getSummary);

module.exports = router;
