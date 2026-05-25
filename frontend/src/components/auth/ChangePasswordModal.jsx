import React, { useState } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Stack,
    Typography,
    Divider,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import PasswordIcon from '@mui/icons-material/Password';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from './AuthProvider';

const ChangePasswordModal = ({ open, onClose }) => {
    const { changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleClose = () => {
        // Reset state when modal is closed
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccess(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            await changePassword(currentPassword, newPassword);
            setSuccess('Password changed successfully');

            // Close modal after a short delay to show success message
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.22)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                },
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        px: 3,
                        py: 2.5,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: 'common.white',
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '14px',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                flexShrink: 0,
                            }}
                        >
                            <LockResetIcon />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                Change Password
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                                Update your credentials to keep your account secure.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        {error && <Alert severity="error" variant="outlined">{error}</Alert>}
                        {success && <Alert severity="success" variant="outlined">{success}</Alert>}

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'grey.200',
                            }}
                        >
                            <Stack spacing={1.5}>
                                <TextField
                                    label="Current Password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={loading || success}
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PasswordIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle current password visibility"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    label="New Password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading || success}
                                    size="small"
                                    helperText="Use at least 6 characters."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PasswordIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle new password visibility"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    label="Confirm New Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading || success}
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PasswordIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirm password visibility"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2.5, justifyContent: 'space-between' }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading || success}
                        color="inherit"
                        sx={{ px: 2.2, borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disableElevation
                        disabled={loading || success}
                        sx={{
                            px: 2.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: '#0f172a',
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#111827',
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(15, 23, 42, 0.45)',
                                color: 'rgba(255,255,255,0.9)',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Change Password'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ChangePasswordModal;
