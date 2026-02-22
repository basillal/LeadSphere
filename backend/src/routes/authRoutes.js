const express = require('express');
const router = express.Router();
const { login, registerOrganization, logout, refresh, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register-organization', registerOrganization);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
