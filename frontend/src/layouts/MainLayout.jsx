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
      <main className="flex-grow w-full max-w-full overflow-y-auto overflow-x-hidden h-full transition-all duration-300 pt-[70px] md:pt-[76px] px-4 sm:px-6 md:px-8 pb-8">
        <div className="page-shell space-y-5">
          <Breadcrumbs />
          <div className="page-card p-4 sm:p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </div>
      </main>
    </Box>
  );
};

export default MainLayout;
