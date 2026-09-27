import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";

import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import KeyIcon from "@mui/icons-material/Key";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChangePasswordModal from "../auth/ChangePasswordModal";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "rgba(255,255,255,0.94)",
  color: "#0F172A",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 1px 0 0 rgba(226,232,240,0.9), 0 4px 16px -4px rgba(15,23,42,0.06)",
  borderBottom: "1px solid rgba(226,232,240,0.8)",
}));

const Header = ({ handleDrawerToggle }) => {
  const { user, logout, selectedOrganization, selectOrganization } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [organizations, setOrganizations] = React.useState([]);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);

  React.useEffect(() => {
    if (user?.role?.roleName === "Super Admin") {
      import("../../services/organizationService").then((module) => {
        const organizationService = module.default;
        organizationService
          .getOrganizations({ limit: 100 })
          .then((res) => setOrganizations(res.data || []))
          .catch((err) => console.error(err));
      });
    }
  }, [user]);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate("/login");
  };

  const handleChangePasswordOpen = () => {
    handleMenuClose();
    setIsChangePasswordOpen(true);
  };

  /* Compute initials for avatar */
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const menuId = "primary-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          mt: 1,
          minWidth: 220,
          borderRadius: "14px",
          border: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 8px 32px -4px rgba(15,23,42,0.14), 0 0 0 1px rgba(15,23,42,0.04)",
          overflow: "visible",
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: -6,
            right: 18,
            width: 12,
            height: 12,
            background: "white",
            transform: "rotate(45deg)",
            border: "1px solid rgba(226,232,240,0.9)",
            borderBottom: "none",
            borderRight: "none",
          },
        },
      }}
    >
      {/* Profile header */}
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 38, height: 38, borderRadius: "10px",
            background: "linear-gradient(135deg, #4F46E5, #818CF8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: "0.82rem", flexShrink: 0,
          }}
        >
          {initials}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
            {user?.name || "User"}
          </Typography>
          <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 0.5 }}>
        <Box sx={{ height: "1px", background: "#F1F5F9" }} />
      </Box>

      <Box sx={{ px: 0.75, pb: 0.75 }}>
        <MenuItem
          onClick={handleChangePasswordOpen}
          sx={{ borderRadius: "8px", py: 1, px: 1.5, gap: 1.5 }}
        >
          <KeyIcon sx={{ fontSize: 18, color: "#475569" }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 500, color: "#1E293B" }}>
            Change Password
          </Typography>
        </MenuItem>
      </Box>

      <Box sx={{ px: 1.5, pb: 0.75 }}>
        <Box sx={{ height: "1px", background: "#F1F5F9" }} />
      </Box>

      <Box sx={{ px: 0.75, pb: 0.75 }}>
        <MenuItem
          onClick={handleLogout}
          sx={{ borderRadius: "8px", py: 1, px: 1.5, gap: 1.5 }}
        >
          <PowerSettingsNewIcon sx={{ fontSize: 18, color: "#EF4444" }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 500, color: "#EF4444" }}>
            Sign Out
          </Typography>
        </MenuItem>
      </Box>
    </Menu>
  );

  return (
    <>
      <Box sx={{ flexGrow: 1 }} className="no-print">
        <AppBar position="fixed">
          <Toolbar sx={{ minHeight: "60px !important", px: { xs: 1.5, sm: 2 }, gap: 1 }}>
            {/* Hamburger */}
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="toggle sidebar"
              onClick={handleDrawerToggle}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "rgba(15,23,42,0.04)",
                "&:hover": { bgcolor: "rgba(15,23,42,0.08)" },
                transition: "all 0.18s ease",
                flexShrink: 0,
              }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Brand name */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: "none", md: "block" },
                fontSize: "1rem",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #4F46E5, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mr: 1,
              }}
            >
              LeadSphere
            </Typography>

            {/* Organization Switcher (Super Admin only) */}
            {user?.role?.roleName === "Super Admin" && (
              <Box sx={{ minWidth: { sm: 200 }, display: { xs: "none", sm: "block" } }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedOrganization || ""}
                    onChange={(e) => selectOrganization(e.target.value)}
                    displayEmpty
                    sx={{
                      fontSize: "0.8rem",
                      color: "#0F172A",
                      bgcolor: "rgba(248,250,252,0.9)",
                      borderRadius: "10px",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(226,232,240,0.8)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4F46E5",
                        borderWidth: "1.5px",
                      },
                      ".MuiSvgIcon-root": { color: "#64748B" },
                      ".MuiSelect-select": { py: 0.9 },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px -4px rgba(15,23,42,0.14)",
                          border: "1px solid rgba(226,232,240,0.9)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ fontStyle: "normal", color: "#94A3B8", fontSize: "0.8rem" }}>All Organizations</em>
                    </MenuItem>
                    {organizations.map((c) => (
                      <MenuItem key={c._id} value={c._id} sx={{ fontSize: "0.8rem" }}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Right side — user info + avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* User info (desktop) */}
              <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-end", mr: 0.5 }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                  {user?.name}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", lineHeight: 1.2 }}>
                  {user?.role?.roleName}
                </Typography>
              </Box>

              {/* Avatar button */}
              <Box
                onClick={handleProfileMenuOpen}
                aria-controls={menuId}
                aria-haspopup="true"
                aria-label="account menu"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4F46E5, #818CF8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0,
                  "&:hover": {
                    boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {initials}
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMenu}
        <ChangePasswordModal
          open={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </Box>
    </>
  );
};

export default Header;
