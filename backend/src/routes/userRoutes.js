const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUser, 
    createUser, 
    updateUser, 
    deleteUser,
    resetPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.use(protect); // Protect all routes

router.route('/')
    .get(checkPermission('USER_MANAGE'), getAllUsers)
    .post(checkPermission('USER_MANAGE'), createUser);

router.route('/:id')
    .get(checkPermission('USER_MANAGE'), getUser)
    .put(checkPermission('USER_MANAGE'), updateUser)
    .delete(checkPermission('USER_MANAGE'), deleteUser);

router.post('/:id/reset-password', checkPermission('USER_MANAGE'), resetPassword);

module.exports = router;