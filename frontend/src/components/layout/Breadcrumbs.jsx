import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission, hasRole } from "../auth/permissionUtils";
import { menuConfig } from "../auth/menuConfig";
import HomeIcon from "@mui/icons-material/Home";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();
  const pathnames = location.pathname.split("/").filter((x) => x);

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
    "follow-ups": "Follow-ups",
    user: "User",
    organizations: "Organizations",
    billings: "Billing",
    expenses: "Expenses",
    roles: "Roles",
    users: "Users",
    "audit-logs": "Audit Logs",
    "organization-profile": "Organization Profile",
  };

  const getBreadcrumbName = (name) =>
    breadcrumbNameMap[name.toLowerCase()] ||
    name.charAt(0).toUpperCase() + name.slice(1);

  const checkAccess = (path) => {
    const configItem = menuConfig.find((item) => item.path === path);
    if (!configItem) return true;
    if (configItem.permission && !hasPermission(user, configItem.permission)) return false;
    if (configItem.role && !hasRole(user, configItem.role)) return false;
    return true;
  };

  const homeAllowed = checkAccess("/");

  return (
    <div
      className="print:hidden"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.125rem",
        marginBottom: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      {/* Home crumb */}
      {homeAllowed ? (
        <Link
          to="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            fontSize: "0.78rem", fontWeight: 500, color: "#64748B",
            textDecoration: "none", padding: "0.25rem 0.5rem",
            borderRadius: "6px", transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F1F5F9";
            e.currentTarget.style.color = "#0F172A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748B";
          }}
        >
          <HomeIcon style={{ fontSize: 14 }} />
          Home
        </Link>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "#64748B", padding: "0.25rem 0.5rem" }}>
          <HomeIcon style={{ fontSize: 14 }} />
          Home
        </span>
      )}

      {pathnames.map((value, index) => {
        if (value === "admin") return null;

        let to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        if (to === "/print/invoice") to = "/billings";

        const isAllowed = checkAccess(to);
        const isClickable = to !== "/print" && !isLast && isAllowed;
        const displayName = getBreadcrumbName(value);

        return (
          <React.Fragment key={to}>
            <ChevronRightIcon style={{ fontSize: 14, color: "#CBD5E1", flexShrink: 0 }} />
            {!isClickable ? (
              <span style={{
                fontSize: "0.78rem", fontWeight: 600, color: "#0F172A",
                padding: "0.25rem 0.5rem",
              }}>
                {displayName}
              </span>
            ) : (
              <Link
                to={to}
                style={{
                  fontSize: "0.78rem", fontWeight: 500, color: "#64748B",
                  textDecoration: "none", padding: "0.25rem 0.5rem",
                  borderRadius: "6px", transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
