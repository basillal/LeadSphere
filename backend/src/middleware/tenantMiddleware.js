const asyncHandler = require('express-async-handler');

/**
 * Middleware to enforce multi-tenancy rules.
 * Ensures that operations are scoped to the user's company.
 * 
 * Logic:
 * 1. Super Admin: Can access everything.
 *    - If 'company' query param is present, scope to that company.
 * 2. Company Admin: Scoped to req.user.company.
 *    - Cannot access other companies' data.
 * 3. Company User: Scoped to req.user.company.
 *    - May have additional restrictions (own data only) enforced by controller or additional middleware.
 */
const tenantFilter = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id;

    // Attach company isolation logic/filter to request object for controllers to use
    if (isSuperAdmin) {
        // Super Admin can see all, or filter by specific company if passed in query
        if (req.query.company) {
            req.companyFilter = { company: req.query.company };
        } else {
            req.companyFilter = {}; // No filter, see all
        }
    } else {
        // Regular users/admins MUST be isolated to their company
        if (!companyId) {
            res.status(403);
            throw new Error('User does not belong to any company');
        }
        req.companyFilter = { company: companyId };
        
        // Also enforce that any CREATION attempts use this company ID
        if (req.method === 'POST') {
             req.body.company = companyId;
        }
    }

    next();
});

module.exports = { tenantFilter };
