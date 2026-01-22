import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const Contact = () => {
    return (
        <Box sx={{ maxWidth: 600, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Contact Us
            </Typography>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Name" variant="outlined" fullWidth required />
                    <TextField label="Email" variant="outlined" fullWidth required />
                    <TextField label="Message" variant="outlined" multiline rows={4} fullWidth required />
                    <Button variant="contained" size="large" type="submit">
                        Send Message
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Contact;
