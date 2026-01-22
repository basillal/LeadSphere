import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Home = () => {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Welcome to Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Select an item from the menu to get started.
            </Typography>
        </Box>
    );
};

export default Home;
