import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import Breadcrumbs from "../components/layout/Breadcrumbs";

const MainLayout = () => {
  const menuItems = [
    { icon: "dashboard", label: "Dashboard", path: "/" },
    { icon: "people", label: "Leads", path: "/leads" },
  ];
  const [open, setOpen] = React.useState(window.innerWidth >= 768);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 0% 0%, #CFFFDC 0, transparent 55%), radial-gradient(circle at 100% 0%, #68BA7F 0, transparent 55%), linear-gradient(135deg, #253D2C 0%, #2E6F40 40%, #68BA7F 100%)",
      }}
    >
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <main className="flex-grow p-3 md:p-6 w-full max-w-full overflow-y-auto overflow-x-hidden h-full transition-all duration-300 pt-20 md:pt-24">
        <Breadcrumbs />
        <Outlet />
      </main>
    </Box>
  );
};

export default MainLayout;
