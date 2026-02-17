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
import AccountCircle from "@mui/icons-material/AccountCircle";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#000000", // Keep it black as requested
  color: "#ffffff",
}));

const Header = ({ handleDrawerToggle }) => {
  const { user, logout, selectedOrganization, selectOrganization } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [organizations, setOrganizations] = React.useState([]);

  // Fetch organizations if Super Admin

  // Logic to load organizations
  React.useEffect(() => {
    if (user?.role?.roleName === "Super Admin") {
      import("../../services/organizationService").then((module) => {
        const organizationService = module.default;
        organizationService
          .getOrganizations({ limit: 100 })
          .then((res) => {
            setOrganizations(res.data || []);
          })
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

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem disabled sx={{ opacity: "1 !important", color: "black" }}>
        <Typography variant="subtitle2">{user?.name || "User"}</Typography>
      </MenuItem>
      <MenuItem disabled sx={{ opacity: "0.7 !important", fontSize: "0.8rem" }}>
        {user?.email}
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
        <PowerSettingsNewIcon sx={{ mr: 1, fontSize: 20 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }} className="no-print">
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: "block", mr: 4 }}
          >
            LeadSphere
          </Typography>

          {/* Organization Switcher for Super Admin */}
          {user?.role?.roleName === "Super Admin" && (
            <Box sx={{ minWidth: 200, mr: 2 }}>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedOrganization || ""}
                  onChange={(e) => selectOrganization(e.target.value)}
                  displayEmpty
                  sx={{
                    color: "white",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.7)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                    ".MuiSvgIcon-root": {
                      color: "white",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "background.paper",
                        "& .MuiMenuItem-root": {
                          color: "text.primary",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Organizations</em>
                  </MenuItem>
                  {organizations.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
            >
              {user?.name}
              <span
                style={{ opacity: 0.7, marginLeft: "5px", fontSize: "0.8em" }}
              >
                ({user?.role?.roleName})
              </span>
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
};

export default Header;
