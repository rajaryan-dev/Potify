const express = require('express');
const users = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.get('/profile', users.getProfile);
router.patch('/profile', users.updateProfile);

module.exports = router;
