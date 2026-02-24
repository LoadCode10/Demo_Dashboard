const express = require('express');
const router = express.Router();
const emailController = require("../../controllers/emailController.js");

router.route('/')
  .get(emailController.getAllEmails);

router.route('/sendMail')
  .post(emailController.sendMessage);

module.exports = router;