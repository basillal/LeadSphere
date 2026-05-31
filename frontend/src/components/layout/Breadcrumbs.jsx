import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission, hasRole } from "../auth/permissionUtils";
import { menuConfig } from "../auth/menuConfig";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map for readable names (optional: extend this as needed)
  const breadcrumbNameMap = {
    leads: "Leads",
    dashboard: "Dashboard",
    settings: "Settings",
    reports: "Reports",
    activities: "Activities",
    contacts: "Contacts",
    about: "About",
    referrers: "Referrers",
    services: "Services",
    followups: "Follow-ups",
    user: "User",
    organizations: "Organizations",
    // Add more mappings as your app grows
  };

  const getBreadcrumbName = (name) => {
    // Check map first, then Fallback to capitalizing first letter
    return (
      breadcrumbNameMap[name.toLowerCase()] ||
      name.charAt(0).toUpperCase() + name.slice(1)
    );
  };

  const checkAccess = (path) => {
    const configItem = menuConfig.find((item) => item.path === path);
    if (!configItem) return true; // Allow access if not explicitly restricted in menuConfig

    if (configItem.permission && !hasPermission(user, configItem.permission)) {
      return false;
    }
    if (configItem.role && !hasRole(user, configItem.role)) {
      return false;
    }
    return true;
  };

  const homeAllowed = checkAccess("/");

  return (
    <div className="mb-4 flex items-center gap-2 text-sm sm:text-base text-slate-600 print:hidden flex-wrap">
      {homeAllowed ? (
        <Link
          to="/"
          className="chip-soft hover:bg-white transition-colors"
        >
          Home
        </Link>
      ) : (
        <span className="chip-soft">Home</span>
      )}

      {pathnames.map((value, index) => {
        // Skip 'admin' from being displayed
        if (value === "admin") return null;

        let to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        // Custom Overrides
        if (to === "/print/invoice") {
          to = "/billings";
        }

        const isAllowed = checkAccess(to);

        // Check if path is clickable
        // If it's just "/print", we probably don't want to link anywhere
        const isClickable = to !== "/print" && !isLast && isAllowed;

        return (
          <div key={to} className="flex items-center">
            <span className="mx-1 text-slate-400">/</span>
            {!isClickable ? (
              <span className="text-slate-900 font-semibold">
                {getBreadcrumbName(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-900 transition-colors"
              >
                {getBreadcrumbName(value)}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
