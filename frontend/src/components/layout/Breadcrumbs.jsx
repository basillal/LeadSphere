import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map for readable names (optional: extend this as needed)
  const breadcrumbNameMap = {
    leads: "Leads Management",
    dashboard: "Dashboard",
    settings: "Settings",
    reports: "Reports",
    activities: "Activities",
    contacts: "Contacts",
    about: "About",
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
    <div className="mb-4 flex items-center text-sm text-gray-500">
      <Link
        to="/"
        className="hover:text-black hover:underline transition-colors"
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={to} className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            {isLast ? (
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
