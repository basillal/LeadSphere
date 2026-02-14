import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
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
    companies: "Companies",
    // Add more mappings as your app grows
  };

  const getBreadcrumbName = (name) => {
    // Check map first, then Fallback to capitalizing first letter
    return (
      breadcrumbNameMap[name.toLowerCase()] ||
      name.charAt(0).toUpperCase() + name.slice(1)
    );
  };

  return (
    <div className="mb-4 flex items-center text-sm text-gray-500 print:hidden">
      <Link
        to="/"
        className="hover:text-black hover:underline transition-colors"
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        // Skip 'admin' from being displayed
        if (value === "admin") return null;

        let to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        // Custom Overrides
        if (to === "/print/invoice") {
          to = "/billings";
        }

        // Check if path is clickable
        // If it's just "/print", we probably don't want to link anywhere
        const isClickable = to !== "/print" && !isLast;

        return (
          <div key={to} className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            {!isClickable ? (
              <span className="text-black font-medium">
                {getBreadcrumbName(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-black hover:underline transition-colors"
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
