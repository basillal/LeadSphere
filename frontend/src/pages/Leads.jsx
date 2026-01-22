import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import leadService from '../services/leadService';
import LeadForm from '../components/leads/LeadForm';
import LeadsTable from '../components/leads/LeadsTable';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await leadService.getLeads();
            setLeads(data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to fetch leads. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLead = async (leadData) => {
        try {
            await leadService.createLead(leadData);
            showSnackbar('Lead added successfully', 'success');
            fetchLeads();
        } catch (err) {
            console.error('Error creating lead:', err);
            const errMsg = err.response?.data?.message || 'Failed to create lead';
            showSnackbar(errMsg, 'error');
        }
    };

    const handleUpdateLead = async (leadData) => {
        try {
            await leadService.updateLead(leadData._id, leadData);
            showSnackbar('Lead updated successfully', 'success');
            fetchLeads();
        } catch (err) {
            console.error('Error updating lead:', err);
            const errMsg = err.response?.data?.message || 'Failed to update lead';
            showSnackbar(errMsg, 'error');
        }
    };

    const handleDeleteLead = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadService.deleteLead(id);
                showSnackbar('Lead deleted successfully', 'success');
                fetchLeads();
            } catch (err) {
                console.error('Error deleting lead:', err);
                showSnackbar('Failed to delete lead', 'error');
            }
        }
    };





    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Leads</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <LeadsTable
                    rows={leads}
                    onCreate={handleCreateLead}
                    onEdit={handleUpdateLead}
                    onDelete={handleDeleteLead}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Leads;
