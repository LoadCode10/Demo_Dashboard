const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/taskController');


router.route('/')
  .get(taskController.getTasks)
  .post(taskController.creatNewTask)

router.route('/stats')
  .get(taskController.getTaskStatsCount)

router.route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask)

router.route('/:id/memberTasks')
  .get(taskController.getMemberTasks)

// router.route('/')
//   .get(taskController.searchTasksQuery);


module.exports = router;