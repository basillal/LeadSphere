export const hasPermission = (user, permissionName) => {
    if (!user || !user.role) return false;

    // Super Admin Bypass
    if (user.role.isSystemRole && user.role.roleName === 'Super Admin') {
        return true;
    }

    if (!user.role.permissions) return false;

    // Transform permissions array to strings if they are objects
    const userPermissionNames = user.role.permissions.map(p => 
        typeof p === 'string' ? p : p.permissionName
    );

    return userPermissionNames.includes(permissionName);
};

export const hasRole = (user, roleName) => {
    if (!user || !user.role) return false;
    return user.role.roleName === roleName;
};
