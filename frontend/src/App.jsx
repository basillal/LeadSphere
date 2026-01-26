import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/leads/Leads";
import FollowUps from "./pages/followUps/FollowUps";
import Contacts from "./pages/contacts/Contacts";
import Referrers from "./pages/referrers/Referrers";
import Activities from "./pages/activities/Activities";
import SourceManagement from "./pages/SourceManagement";
import StatusTags from "./pages/StatusTags";
import Search from "./pages/Search";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="referrers" element={<Referrers />} />
          <Route path="activities" element={<Activities />} />
          <Route path="sources" element={<SourceManagement />} />
          <Route path="status-tags" element={<StatusTags />} />
          <Route path="search" element={<Search />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
