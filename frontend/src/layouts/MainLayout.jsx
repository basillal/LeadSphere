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
      className="app-shell"
    >
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      {!isDesktop && open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={handleDrawerClose}
          aria-hidden="true"
        />
      )}
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <main className="flex-grow w-full max-w-full overflow-y-auto overflow-x-hidden h-full transition-all duration-300 pt-20 md:pt-24 px-3 sm:px-4 md:px-6 pb-6">
        <div className="page-shell space-y-4">
          <Breadcrumbs />
          <div className="page-card p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </Box>
  );
};

export default MainLayout;
