import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
    const [open, setOpen] = React.useState(false);

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <CssBaseline />
            <Header open={open} handleDrawerToggle={handleDrawerToggle} />
            <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                <Toolbar /> {/* Spacer below AppBar */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
