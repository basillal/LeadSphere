import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LoadingProvider } from "./context/LoadingProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/leads/Leads";
import FollowUps from "./pages/followUps/FollowUps";
import Contacts from "./pages/contacts/Contacts";
import ContactDetails from "./pages/contacts/ContactDetails";
import Referrers from "./pages/referrers/Referrers";
import Activities from "./pages/activities/Activities";
import Services from "./pages/services/Services";
import Billings from "./pages/billing/Billings";
import Expenses from "./pages/expenses/Expenses";

import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Companies from "./pages/admin/Companies";
import Roles from "./pages/admin/Roles";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";
import PrintInvoice from "./pages/billing/PrintInvoice";
import RoleGuard from "./components/auth/RoleGuard";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="follow-ups" element={<FollowUps />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="contacts/:id" element={<ContactDetails />} />
                <Route path="referrers" element={<Referrers />} />
                <Route path="activities" element={<Activities />} />
                <Route path="services" element={<Services />} />
                <Route path="billings" element={<Billings />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="print/invoice/:id" element={<PrintInvoice />} />
                <Route
                  path="admin/companies"
                  element={
                    <RoleGuard role="Super Admin">
                      <Companies />
                    </RoleGuard>
                  }
                />
                <Route
                  path="admin/roles"
                  element={
                    <RoleGuard role="Super Admin">
                      <Roles />
                    </RoleGuard>
                  }
                />
                <Route
                  path="admin/audit-logs"
                  element={
                    <RoleGuard role="Super Admin">
                      <AuditLogs />
                    </RoleGuard>
                  }
                />
                <Route path="admin/users" element={<Users />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App;
