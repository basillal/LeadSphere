import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Grid,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    Divider,
    FormControlLabel,
    Switch,
    Chip,
    Stack
} from '@mui/material';

const LeadForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(() => {
        const initialState = {
            // 1. Basic Info
            name: '',
            phone: '',
            alternatePhone: '',
            email: '',
            companyName: '',
            designation: '',
            website: '',

            // 2. Lead Source
            source: 'Website',
            sourceDetails: '',
            campaignName: '',
            referredBy: '',

            // 3. Status & Priority
            status: 'New',
            priority: 'Medium',
            leadTemperature: 'Warm',
            isActive: true,
            lostReason: '',

            // 4. Follow-Up
            nextFollowUpDate: '',
            followUpMode: '',
            followUpRemarks: '',
            followUpCount: 0,

            // 5. Business Details
            requirement: '',
            budgetRange: '',
            expectedClosureDate: '',
            interestedProduct: '',
            dealValue: '',

            // 6. Communication Preferences
            preferredContactMode: '',
            preferredContactTime: '',
            doNotDisturb: false,

            // 7. Tags & Custom Fields
            tags: [],
            tagsInput: '', // Temporary for input

            // 8. Activity Tracking (Read-only/System populated mostly)
            // 9. Notes
            notes: '',
            internalComments: ''
        };

        if (initialData) {
            return {
                ...initialState,
                ...initialData,
                // Ensure dates are strings for input type="date"
                nextFollowUpDate: initialData.nextFollowUpDate ? initialData.nextFollowUpDate.split('T')[0] : '',
                expectedClosureDate: initialData.expectedClosureDate ? initialData.expectedClosureDate.split('T')[0] : '',
            };
        }

        return initialState;
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Simple Tag handling
    const handleTagDelete = (tagToDelete) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToDelete),
        }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && formData.tagsInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(formData.tagsInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, prev.tagsInput.trim()],
                    tagsInput: ''
                }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Sanitize data: convert empty strings to undefined for optional enum fields
        const cleanedData = { ...formData };
        if (!cleanedData.followUpMode) delete cleanedData.followUpMode;
        if (!cleanedData.preferredContactMode) delete cleanedData.preferredContactMode;
        if (!cleanedData.nextFollowUpDate) delete cleanedData.nextFollowUpDate; // Handle empty date string
        if (!cleanedData.expectedClosureDate) delete cleanedData.expectedClosureDate; // Handle empty date string

        onSubmit(cleanedData);
    };



    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ p: { xs: 0, md: 2 } }}>
                {/* 1. Basic Lead Information */}
                <SectionHeader title="1. Basic Lead Information" subtitle="Who is the lead?" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth required label="Full Name" name="name" value={formData.name} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth required label="Primary Phone" name="phone" value={formData.phone} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Alternate Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>

                {/* 2. Lead Source Information */}
                <SectionHeader title="2. Lead Source Information" subtitle="Where did the lead come from?" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth required size="small">
                            <InputLabel>Source</InputLabel>
                            <Select name="source" value={formData.source} label="Source" onChange={handleChange}>
                                {['Website', 'Referral', 'WhatsApp', 'Cold Call', 'Event', 'Other'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Source Details" name="sourceDetails" value={formData.sourceDetails} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Campaign Name" name="campaignName" value={formData.campaignName} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Referred By" name="referredBy" value={formData.referredBy} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>

                {/* 3. Lead Status & Priority */}
                <SectionHeader title="3. Lead Status & Priority" subtitle="Current state of the lead" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth required size="small">
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                                {['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
                                {['Low', 'Medium', 'High'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Temperature</InputLabel>
                            <Select name="leadTemperature" value={formData.leadTemperature} label="Temperature" onChange={handleChange}>
                                {['Hot', 'Warm', 'Cold'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={<Switch checked={formData.isActive} onChange={handleChange} name="isActive" size="small" />}
                            label="Is Active"
                        />
                    </Grid>
                    {formData.status === 'Lost' && (
                        <Grid item xs={12}>
                            <TextField fullWidth label="Lost Reason" name="lostReason" value={formData.lostReason} onChange={handleChange} size="small" />
                        </Grid>
                    )}
                </Grid>

                {/* 4. Follow-Up Information */}
                <SectionHeader title="4. Follow-Up Information" subtitle="What needs to be done next?" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Next Follow-Up Date"
                            name="nextFollowUpDate"
                            value={formData.nextFollowUpDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Follow-Up Mode</InputLabel>
                            <Select name="followUpMode" value={formData.followUpMode} label="Follow-Up Mode" onChange={handleChange}>
                                {['Call', 'WhatsApp', 'Email', 'Meeting', 'None'].map(opt => (
                                    <MenuItem key={opt} value={opt === 'None' ? '' : opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Follow-Up Count" name="followUpCount" value={formData.followUpCount} disabled size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={2} label="Follow-Up Remarks" name="followUpRemarks" value={formData.followUpRemarks} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>

                {/* 5. Business / Requirement Details */}
                <SectionHeader title="5. Business Details" subtitle="Why are they interested?" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline rows={3} label="Requirement" name="requirement" value={formData.requirement} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Interested Product" name="interestedProduct" value={formData.interestedProduct} onChange={handleChange} size="small" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Budget Estimate" name="budgetRange" value={formData.budgetRange} onChange={handleChange} size="small" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth type="number" label="Deal Value" name="dealValue" value={formData.dealValue} onChange={handleChange} size="small" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Expected Closure Date"
                                    name="expectedClosureDate"
                                    value={formData.expectedClosureDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* 6. Communication Preferences */}
                <SectionHeader title="6. Communication Preferences" subtitle="How they want to be contacted" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Preferred Contact Mode</InputLabel>
                            <Select name="preferredContactMode" value={formData.preferredContactMode} label="Preferred Contact Mode" onChange={handleChange}>
                                {['Call', 'WhatsApp', 'Email', 'None'].map(opt => (
                                    <MenuItem key={opt} value={opt === 'None' ? '' : opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Preferred Time" name="preferredContactTime" placeholder="e.g. Morning, After 6PM" value={formData.preferredContactTime} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={<Switch checked={formData.doNotDisturb} onChange={handleChange} name="doNotDisturb" color="error" size="small" />}
                            label="Do Not Disturb (DND)"
                        />
                    </Grid>
                </Grid>

                {/* 7. Tags */}
                <SectionHeader title="7. Tags" subtitle="Flexible classification" />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Add Tags (Press Enter)"
                            name="tagsInput"
                            value={formData.tagsInput}
                            onChange={handleChange}
                            onKeyDown={handleTagKeyDown}
                            placeholder="VIP, Urgent, Hot Lead..."
                            size="small"
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {formData.tags.map((tag, index) => (
                                <Chip key={index} label={tag} onDelete={() => handleTagDelete(tag)} size="small" />
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* 9. Notes & Attachments */}
                <SectionHeader title="9. Notes & Internal Comments" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline rows={3} label="Public Notes" name="notes" value={formData.notes} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline rows={3} label="Internal Private Comments" name="internalComments" value={formData.internalComments} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="contained" size="large" sx={{ px: 5 }}>Save Lead</Button>
                </Box>
            </Box>
        </form>
    );
};

const SectionHeader = ({ title, subtitle }) => (
    <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
            {title}
        </Typography>
        {subtitle && <Typography variant="caption" color="textSecondary">{subtitle}</Typography>}
        <Divider sx={{ my: 1 }} />
    </Box>
);

export default LeadForm;
