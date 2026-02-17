const asyncHandler = require('express-async-handler');

/**
 * Middleware to enforce multi-tenancy rules.
 * Ensures that operations are scoped to the user's organization.
 * 
 * Logic:
 * 1. Super Admin: Can access everything.
 *    - If 'organization' query param is present, scope to that organization.
 * 2. Organization Admin: Scoped to req.user.organization.
 *    - Cannot access other organizations' data.
 * 3. Organization User: Scoped to req.user.organization.
 *    - May have additional restrictions (own data only) enforced by controller or additional middleware.
 */
const tenantFilter = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const organizationId = req.user.organization?._id;

    // Attach organization isolation logic/filter to request object for controllers to use
    if (isSuperAdmin) {
        // Super Admin can see all, or filter by specific organization
        const contextOrganization = req.headers['x-organization-context'];

        if (contextOrganization) {
            req.organizationFilter = { organization: contextOrganization };
            // Inject into body for creation/updates if present
            if (req.method === 'POST' || req.method === 'PUT') {
                 if (!req.body.organization) {
                    req.body.organization = contextOrganization;
                 }
            }
        } else if (req.query.organization) {
             req.organizationFilter = { organization: req.query.organization };
        } else {
            req.organizationFilter = {}; // No filter, see all
        }

        // IMPORTANT FOR REFERRER CREATION: If Super Admin is creating and no organization in body or context,
        // we should probably warn or require it. Referrer model REQUIRES it.
        if (req.method === 'POST' && !req.body.organization) {
             // For now, let it fall through to Mongoose validation which gives 400.
             // OR default to a system organization if desired.
        }
    } else {
        // Regular users/admins MUST be isolated to their organization
        if (!organizationId) {
            res.status(403);
            throw new Error('User does not belong to any organization');
        }
        req.organizationFilter = { organization: organizationId };
        
        // Also enforce that any CREATION attempts use this organization ID
        if (req.method === 'POST') {
             req.body.organization = organizationId;
        }
    }

    next();
});

module.exports = { tenantFilter };
