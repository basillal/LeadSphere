const express = require('express');
const router = express.Router();
const { 
    getRoles, 
    getRole, 
    createRole, 
    updateRole, 
    deleteRole 
} = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.use(protect); // Protect all routes

router.route('/')
    .get(checkPermission('ROLE_MANAGE'), getRoles)
    .post(checkPermission('ROLE_MANAGE'), createRole);

router.route('/:id')
    .get(checkPermission('ROLE_MANAGE'), getRole)
    .put(checkPermission('ROLE_MANAGE'), updateRole)
    .delete(checkPermission('ROLE_MANAGE'), deleteRole);

module.exports = router;
