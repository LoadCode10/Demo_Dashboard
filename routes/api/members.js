const express = require('express');
const router = express.Router();
const memberController = require('../../controllers/memberController');



router.route('/')
  .get(memberController.getMembers)
  .post(memberController.creatNewMember)

router.route('/:id')
  .delete(memberController.deleteMember)
  .put(memberController.updateMember)
  .get(memberController.getMemberById)

router.route('/:memberId/tasks')
  .get(memberController.getMemberTasks);

module.exports = router;