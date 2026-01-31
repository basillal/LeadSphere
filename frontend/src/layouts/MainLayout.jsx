import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import Breadcrumbs from "../components/layout/Breadcrumbs";

const MainLayout = () => {
  const [open, setOpen] = React.useState(false);

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
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <main className="flex-grow p-3 md:p-4 ml-16 md:ml-0 w-full max-w-full overflow-y-auto overflow-x-hidden h-full transition-all duration-300 pt-20">
        <Breadcrumbs />
        <Outlet />
      </main>
    </Box>
  );
};

export default MainLayout;
