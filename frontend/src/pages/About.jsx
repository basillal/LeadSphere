import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const About = () => {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
                About This App
            </Typography>
            <Typography variant="body1">
                This is a demonstration of a React Dashboard layout using Material UI.
            </Typography>
        </Box>
    );
};

export default About;
