import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import Breadcrumbs from "../components/layout/Breadcrumbs";

const MainLayout = () => {
  const DESKTOP_MQ = "(min-width: 768px)";
  const getIsDesktop = () =>
    typeof window !== "undefined" &&
    (window.matchMedia?.(DESKTOP_MQ).matches ?? window.innerWidth >= 768);

  const [isDesktop, setIsDesktop] = React.useState(getIsDesktop);
  const [open, setOpen] = React.useState(getIsDesktop);

  React.useEffect(() => {
    const mq = window.matchMedia?.(DESKTOP_MQ);
    if (!mq) return;

    const handleChange = (e) => {
      setIsDesktop(e.matches);
      setOpen(e.matches ? true : false);
    };

    // Initialize once in case window size changed before mount
    setIsDesktop(mq.matches);
    setOpen(mq.matches ? true : false);

    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

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
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      {!isDesktop && open && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={handleDrawerClose}
          aria-hidden="true"
        />
      )}
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <main className="flex-grow p-3 md:p-6 w-full max-w-full overflow-y-auto overflow-x-hidden h-full transition-all duration-300 pt-20 md:pt-24">
        <Breadcrumbs />
        <Outlet />
      </main>
    </Box>
  );
};

export default MainLayout;
