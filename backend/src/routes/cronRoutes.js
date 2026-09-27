const express = require('express');
const router = express.Router();
const { processCronJob } = require('../controllers/cronController');

// The cron service will hit this endpoint periodically (e.g., POST /api/cron/process)
// It doesn't use the standard protect middleware because cron services can't easily login to get a JWT.
// Instead, it is secured via a custom header or token check inside the controller.
router.post('/process', processCronJob);
router.get('/process', processCronJob); // Allowing GET as well for simple ping cron services

module.exports = router;
