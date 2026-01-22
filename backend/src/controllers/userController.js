const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { successResponse } = require('../utils/responseHandler');

exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    successResponse(res, 'Users retrieved successfully', users);
});

exports.createUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    // Create user (Mongoose will handle validation for required fields & unique email)
    const newUser = await User.create({ name, email });
    successResponse(res, 'User created successfully', newUser, 201);
});