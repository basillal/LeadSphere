const express = require('express');
const router = express.Router();
const { login, registerCompany, logout, refresh, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register-company', registerCompany);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
