const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

router.post('/', userProfileController.createOrUpdateUserProfile);

module.exports = router;
