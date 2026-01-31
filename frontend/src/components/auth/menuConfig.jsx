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
import ReceiptIcon from "@mui/icons-material/Receipt";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

export const menuConfig = [
  {
    label: "Dashboard",
    path: "/",
    icon: <DashboardIcon />,
    permission: "DASHBOARD_READ",
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
    label: "Activities",
    path: "/activities",
    icon: <AssignmentIcon />,
    permission: "ACTIVITY_READ",
  },
  {
    label: "Billing",
    path: "/billings",
    icon: <ReceiptIcon />,
    // permission: "BILLING_READ",
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: <MonetizationOnIcon />,
    // permission: "EXPENSE_READ",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <AssessmentIcon />,
    // permission: "REPORT_READ",
  },
  {
    label: "Services",
    path: "/services",
    icon: <CategoryIcon />,
    // permission: "SERVICE_READ",
  },
  {
    label: "Referrers",
    path: "/referrers",
    icon: <ConnectWithoutContactIcon />,
    permission: "REFERRER_READ",
  },
  {
    label: "Companies",
    path: "/admin/companies",
    icon: <BusinessIcon />, // Changed to BusinessIcon or Dashboard if imports allow. Using BusinessIcon if I assume it exists or reuse Dashboard
    role: "Super Admin",
  },
  {
    label: "Roles",
    path: "/admin/roles",
    icon: <SecurityIcon />, // Changed to Security or Settings
    permission: "ROLE_MANAGE",
    role: "Super Admin",
  },
  {
    label: "Team",
    path: "/admin/users",
    icon: <PeopleIcon />,
    permission: "USER_MANAGE",
  },
  {
    label: "Sources",
    path: "/sources",
    icon: <StorageIcon />,
    role: "Super Admin",
  },
  {
    label: "Status Tags",
    path: "/status-tags",
    icon: <LocalOfferIcon />,
    role: "Super Admin",
  },
  {
    label: "Search",
    path: "/search",
    icon: <SearchIcon />,
    role: "Super Admin",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsIcon />,
    role: "Super Admin",
  },
];
