/**
 * @desc    Send any success response
 * @param   {string} message
 * @param   {object | array} results
 * @param   {number} statusCode
 */
exports.successResponse = (res, message, results, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data: results
    });
};

/**
 * @desc    Send any error response
 * @param   {string} message
 * @param   {number} statusCode
 */
exports.errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};
