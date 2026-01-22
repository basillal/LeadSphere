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

    const [view, setView] = useState('list'); // 'list', 'create', 'edit'
    const [editingLead, setEditingLead] = useState(null);

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
            setView('list');
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
            setView('list');
            setEditingLead(null);
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

    const handleShowCreate = () => {
        setEditingLead(null);
        setView('create');
    };

    const handleShowEdit = (lead) => {
        setEditingLead(lead);
        setView('edit');
    };

    const handleCancelForm = () => {
        setView('list');
        setEditingLead(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 3 }}>
                <Typography variant="h4">
                    {view === 'list' ? 'Leads' : view === 'create' ? 'Create New Lead' : 'Edit Lead'}
                </Typography>
                {view !== 'list' && (
                    <Button variant="outlined" onClick={handleCancelForm}>Back to List</Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {view === 'list' && (
                        <LeadsTable
                            rows={leads}
                            onCreate={handleShowCreate}
                            onEdit={handleShowEdit}
                            onDelete={handleDeleteLead}
                        />
                    )}
                    {(view === 'create' || view === 'edit') && (
                        <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                            <LeadForm
                                key={editingLead ? editingLead._id : 'new'}
                                initialData={editingLead}
                                onSubmit={view === 'create' ? handleCreateLead : handleUpdateLead}
                                onCancel={handleCancelForm}
                            />
                        </Paper>
                    )}
                </>
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
