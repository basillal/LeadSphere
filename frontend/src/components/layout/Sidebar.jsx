import React from "react";
import { Link, useLocation } from "react-router-dom";

import { menuConfig } from "../auth/menuConfig.jsx";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission, hasRole } from "../auth/permissionUtils";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";

const Sidebar = ({ open, handleDrawerClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const filterMenu = (items) => {
    return items.filter((item) => {
      // Check Permission
      if (item.permission && !hasPermission(user, item.permission)) {
        return false;
      }
      // Check Role
      if (item.role && !hasRole(user, item.role)) {
        return false;
      }
      // Check Children (if parent is visible, filter children)
      if (item.children) {
        item.children = filterMenu(item.children); // Recursive filter
        // If no children remain and parent had children, maybe hide parent?
        // For now, let's keep parent if it has explicit permission/role or if it's just a container.
        // If it's a container without permission/role, and no children, hide it.
        if (!item.permission && !item.role && item.children.length === 0) {
          return false;
        }
      }
      return true;
    });
  };

  // Deep copy to avoid mutating original config during filter (if we needed to, but filter returns new array, but children mutation is tricky)
  // Simple approach: standard filter.
  // We need to flatten or handle children. For now, let's flatten 'Admin' children into the main list if the user has access,
  // OR just render top level and let them navigate.
  // Given the current Sidebar design is a simple list, let's FLATTEN the visible items for simplicity
  // until a proper Drilldown/Accordion sidebar is built.

  const getVisibleItems = () => {
    const visible = [];

    const traverse = (items) => {
      items.forEach((item) => {
        if (item.permission && !hasPermission(user, item.permission)) return;
        if (item.role && !hasRole(user, item.role)) return;

        if (item.children) {
          // Option A: Add parent, then children?
          // Option B: Just add children?
          // Let's add children directly for now to fit the flat sidebar style
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

  // Width for desktop: expanded vs compact
  const widthClass = open ? "md:w-64" : "md:w-16";

  // Slide-in behaviour on mobile: hidden when closed, visible when open
  const translateClass = open
    ? "translate-x-0"
    : "-translate-x-full md:translate-x-0";

  return (
    <aside
      className={`
        fixed md:relative inset-y-0 left-0 z-30 min-h-screen
        glass-effect border-r border-[rgba(46,111,64,0.25)]
        transition-all duration-300 ease-in-out transform
        w-64 ${widthClass} ${translateClass}
        flex flex-col
        md:m-4 md:rounded-3xl rounded-r-3xl overflow-hidden
        no-print
      `}
    >
      <div className="flex items-center justify-end h-16 border-b border-[rgba(46,111,64,0.25)] px-4">
        <button
          onClick={handleDrawerClose}
          className="p-1 rounded-md hover:bg-gray-100 md:hidden"
        >
          <ChevronLeftIcon />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={() => {
                    // Auto-close on mobile when link is clicked
                    if (window.innerWidth < 768) {
                      handleDrawerClose();
                    }
                  }}
                  className={`
                    flex items-center px-4 py-3 mx-1 rounded-full transition-all duration-200
                    ${
                      isActive
                        ? "bg-[rgba(46,111,64,0.9)] text-white shadow-md"
                        : "text-[#253D2C] hover:bg-white/40 hover:text-[#2E6F40]"
                    }
                    ${open ? "justify-start" : "justify-center"}
                  `}
                  title={!open ? item.label : ""}
                >
                  <span className={`${open ? "mr-3" : ""}`}>{item.icon}</span>
                  {open && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
