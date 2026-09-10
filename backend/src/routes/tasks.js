const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");
const tasksController = require("../controllers/tasksController");

router.get("/", tasksController.getTasks);
router.post("/", tasksController.createTask);
router.patch("/:id/complete", validateObjectId, tasksController.completeTask);
router.patch("/:id/uncomplete", validateObjectId, tasksController.uncompleteTask);

module.exports = router;
