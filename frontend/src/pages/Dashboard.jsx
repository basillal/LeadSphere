import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import leadService from "../services/leadService";
import contactService from "../services/contactService";
import referrerService from "../services/referrerService";
import followUpService from "../services/followUpService";

const StatWidget = ({ title, value, icon, color, bgColor }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 4,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      border: "1px solid rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            p: 1.5,
            borderRadius: 3,
            bgcolor: bgColor,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary" }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    leads: 0,
    contacts: 0,
    referrers: 0,
    followUps: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [lRes, cRes, rRes, fRes] = await Promise.all([
          leadService.getLeadStats(),
          contactService.getContactStats(),
          referrerService.getReferrerStats(),
          followUpService.getFollowUpStats(),
        ]);

        setStats({
          leads: lRes.data.total || 0,
          contacts: cRes.data.total || 0,
          referrers: rRes.data.totalReferrers || 0,
          followUps: fRes.data.pending || 0,
        });
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back to your LeadSphere overview.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Active Leads"
            value={stats.leads}
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.1)"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Total Contacts"
            value={stats.contacts}
            color="#8b5cf6"
            bgColor="rgba(139, 92, 246, 0.1)"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <line x1="7" y1="8" x2="17" y2="8"></line>
                <line x1="7" y1="12" x2="17" y2="12"></line>
                <line x1="7" y1="16" x2="17" y2="16"></line>
              </svg>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Referrers"
            value={stats.referrers}
            color="#10b981"
            bgColor="rgba(16, 185, 129, 0.1)"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Tasks Today"
            value={stats.followUps}
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.1)"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            }
          />
        </Grid>
      </Grid>

      {/* Visual Placeholder for Charts or Recent items */}
      <Box
        sx={{
          mt: 4,
          p: 8,
          textAlign: "center",
          border: "2px dashed rgba(0,0,0,0.1)",
          borderRadius: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Insight graphs and activity feed coming soon.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
