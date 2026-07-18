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

    setIsDesktop(mq.matches);
    setOpen(mq.matches ? true : false);

    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen(!open);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#F8FAFC",
      }}
      className="app-shell"
    >
      <CssBaseline />

      {/* Header */}
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />

      {/* Mobile overlay */}
      {!isDesktop && open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
          onClick={handleDrawerClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />

      {/* Main Content */}
      <main
        className="flex-grow w-full max-w-full overflow-y-auto overflow-x-hidden h-full custom-scrollbar"
        style={{
          paddingTop: "60px",
          transition: "all 0.3s ease",
          background: "#F8FAFC",
        }}
      >
        <div
          className="page-shell"
          style={{
            padding: "1.25rem 1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Breadcrumbs />
          <div className="page-card" style={{ padding: "1.25rem 1.5rem" }}>
            <Outlet />
          </div>
        </div>
      </main>
    </Box>
  );
};

export default MainLayout;
