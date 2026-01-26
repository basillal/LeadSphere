import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import ContactsIcon from "@mui/icons-material/Contacts";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StorageIcon from "@mui/icons-material/Storage";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

export const menuConfig = [
  {
    label: "Dashboard",
    path: "/",
    icon: <DashboardIcon />,
    permission: "DASHBOARD_VIEW", // Assuming basic permission or null for public? No, strictly guarded.
  },
  {
    label: "Leads",
    path: "/leads",
    icon: <PeopleIcon />,
    permission: "LEAD_READ",
  },
  {
    label: "Follow Ups",
    path: "/follow-ups",
    icon: <PhoneIcon />,
    permission: "FOLLOWUP_READ",
  },
  {
    label: "Contacts",
    path: "/contacts",
    icon: <ContactsIcon />,
    permission: "CONTACT_READ",
  },
  {
    label: "Referrers",
    path: "/referrers",
    icon: <ConnectWithoutContactIcon />,
    permission: "REFERRER_READ",
  },
  {
    label: "Activities",
    path: "/activities",
    icon: <AssignmentIcon />,
    permission: "ACTIVITY_READ",
  },
  {
    label: "Admin",
    role: "Super Admin", // Only Super Admin
    icon: <SettingsIcon />,
    children: [
      {
        label: "Roles",
        path: "/admin/roles",
        icon: <SettingsIcon />,
        permission: "ROLE_MANAGE",
      },
      {
        label: "Users",
        path: "/admin/users",
        icon: <PeopleIcon />,
        permission: "USER_MANAGE",
      },
      {
        label: "Sources",
        path: "/sources",
        icon: <StorageIcon />, // Just to have an icon
      },
      {
        label: "Status Tags",
        path: "/status-tags",
        icon: <LocalOfferIcon />,
      },
      {
        label: "Search",
        path: "/search",
        icon: <SearchIcon />,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: <AssessmentIcon />,
      },
      {
        label: "Settings",
        path: "/settings",
        icon: <SettingsIcon />,
      },
    ],
  },
];
