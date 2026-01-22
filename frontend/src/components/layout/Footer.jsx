import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' React App. All rights reserved.'}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Link href="#" color="inherit" underline="hover">
                        Privacy Policy
                    </Link>
                    <Link href="#" color="inherit" underline="hover">
                        Terms of Service
                    </Link>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
