const express = require('express');
const router = express.Router();
const { getPermissions, getGroupedPermissions } = require('../controllers/permissionController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.use(protect); // Protect all routes

router.get('/', checkPermission('PERMISSION_MANAGE'), getPermissions);
router.get('/grouped', checkPermission('PERMISSION_MANAGE'), getGroupedPermissions);

module.exports = router;
