import React from "react";
import { Link, useLocation } from "react-router-dom";

import { menuConfig } from "../auth/menuConfig.jsx";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission, hasRole } from "../auth/permissionUtils";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

/* ─────────────────────────────────────────────────────────
   LeadSphere Logo SVG inline
───────────────────────────────────────────────────────── */
const LeadSphereLogo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#lg1)" />
    <path d="M9 22L16 10L23 22H9Z" fill="white" fillOpacity="0.9" />
    <circle cx="16" cy="14" r="3" fill="white" />
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   Section groupings for nav items
───────────────────────────────────────────────────────── */
const NAV_SECTIONS = {
  main: ["Dashboard", "Leads", "Follow Ups", "Contacts", "Activities"],
  finance: ["Billing", "Expenses"],
  analytics: ["Reports"],
  config: ["Services", "Referrers", "Settings"],
  admin: ["Organizations", "Audit Logs", "Roles", "Users", "Organization Profile"],
};

const SECTION_LABELS = {
  main: "Main",
  finance: "Finance",
  analytics: "Analytics",
  config: "Configuration",
  admin: "Administration",
};

const Sidebar = ({ open, handleDrawerClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getVisibleItems = () => {
    const visible = [];
    const traverse = (items) => {
      items.forEach((item) => {
        if (item.permission && !hasPermission(user, item.permission)) return;
        if (item.role && !hasRole(user, item.role)) return;
        if (item.children) {
          traverse(item.children);
        } else {
          visible.push(item);
        }
      });
    };
    traverse(menuConfig);
    return visible;
  };

  const menuItems = getVisibleItems();

  // Group items by section
  const grouped = Object.entries(NAV_SECTIONS).map(([key, labels]) => ({
    key,
    label: SECTION_LABELS[key],
    items: menuItems.filter((item) => labels.includes(item.label)),
  })).filter((g) => g.items.length > 0);

  const widthClass = open ? "w-[86vw] max-w-[240px] md:w-[230px]" : "w-[86vw] max-w-[240px] md:w-[60px]";
  const translateClass = open ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <aside
      className={`
        fixed top-0 left-0 md:relative z-40 h-[100dvh] md:h-screen
        transition-all duration-300 ease-in-out
        ${translateClass}
        ${widthClass}
        flex flex-col
        overflow-hidden
        no-print
      `}
      style={{
        background: "linear-gradient(180deg, #1E1B4B 0%, #1a1740 60%, #18153c 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* ── Logo Bar ── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: "60px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
      >
        <div className={`flex items-center gap-2.5 ${!open ? "md:justify-center md:w-full" : ""}`}>
          <LeadSphereLogo />
          {open && (
            <span className="sidebar-logo-text">LeadSphere</span>
          )}
        </div>
        {/* Mobile close */}
        <button
          onClick={handleDrawerClose}
          className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Close sidebar"
        >
          <ChevronLeftIcon style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {grouped.map((section, sIdx) => (
          <div key={section.key} className={sIdx > 0 ? "mt-2" : ""}>
            {/* Section label – only when open */}
            {open && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            {!open && sIdx > 0 && (
              <div className="mx-3 my-2" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
            )}

            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 768) handleDrawerClose();
                      }}
                      title={!open ? item.label : ""}
                      className={`sidebar-nav-item ${isActive ? "active" : ""} ${!open ? "!justify-center !mx-2" : ""}`}
                    >
                      <span className="sidebar-icon" style={isActive ? { color: "#A5B4FC" } : {}}>
                        {React.cloneElement(item.icon, { style: { fontSize: 19 } })}
                      </span>
                      {open && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                      {/* Active indicator dot when collapsed */}
                      {!open && isActive && (
                        <span
                          style={{
                            position: "absolute",
                            right: 4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 4,
                            height: 4,
                            borderRadius: "999px",
                            background: "#818CF8",
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      {open && (
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: "8px",
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "0.7rem",
              flexShrink: 0,
            }}
          >
            {user?.name?.slice(0, 2).toUpperCase() || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </p>
            <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.role?.roleName || "Member"}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
