const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAuditLogs);

module.exports = router;
