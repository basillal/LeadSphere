import React, { useState, useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Paper,
    Checkbox,
    IconButton,
    Tooltip,
    FormControlLabel,
    Switch,
    Chip,
    Button,
    Card,
    CardContent,
    CardActions,
    useTheme,
    useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { visuallyHidden } from '@mui/utils';

// --- Comparators ---
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// --- Head Cells Configuration ---
const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Name', width: '20%' },
    { id: 'companyName', numeric: false, disablePadding: false, label: 'Company', width: '15%' },
    { id: 'phone', numeric: false, disablePadding: false, label: 'Phone', width: '15%' },
    { id: 'source', numeric: false, disablePadding: false, label: 'Source', width: '15%' },
    { id: 'status', numeric: false, disablePadding: false, label: 'Status', width: '10%' },
    { id: 'priority', numeric: false, disablePadding: false, label: 'Priority', width: '10%' },
    { id: 'actions', numeric: false, disablePadding: false, label: 'Actions', width: '15%' },
];

// --- Enhanced Table Head ---
function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{ 'aria-label': 'select all leads' }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ width: headCell.width }}
                    >
                        {headCell.id !== 'actions' ? (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        ) : (
                            headCell.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

// --- Enhanced Table Toolbar ---
function EnhancedTableToolbar(props) {
    const { numSelected, onDeleteSelected, onAddClick } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                width: '100%',
                ...(numSelected > 0 && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                    Leads Management
                </Typography>
            )}

            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton onClick={onDeleteSelected}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddClick}
                        size="small"
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Add Lead
                    </Button>
                    <Tooltip title="Filter list">
                        <IconButton>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Toolbar>
    );
}

// --- Main Component ---
export default function LeadsTable({ rows = [], onEdit, onDelete, onCreate }) {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n._id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const handleDeleteSelected = () => {
        // Implement bulk delete via prop call if available
        if (onDelete) {
            selected.forEach(id => onDelete(id));
            setSelected([]);
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'NEW': return 'info';
            case 'New': return 'info';
            case 'CONTACTED': return 'primary';
            case 'Contacted': return 'primary';
            case 'FOLLOW_UP': return 'warning';
            case 'Follow-up': return 'warning';
            case 'CONVERTED': return 'success';
            case 'Converted': return 'success';
            case 'LOST': return 'error';
            case 'Lost': return 'error';
            default: return 'default';
        }
    };

    const handleAddClick = () => {
        if (onCreate) onCreate();
    };

    const handleEditClick = (lead) => {
        if (onEdit) onEdit(lead);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
        () =>
            [...rows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage, rows],
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    onDeleteSelected={handleDeleteSelected}
                    onAddClick={handleAddClick}
                />

                {isMobile ? (
                    <Box sx={{ p: 2 }}>
                        {visibleRows.map((row) => (
                            <Card key={row._id} sx={{ mb: 2, boxShadow: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography variant="h6" component="div">
                                                {row.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.companyName || '-'}
                                            </Typography>
                                        </Box>
                                        <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                    </Box>

                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Phone:</strong> {row.phone}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Email:</strong> {row.email}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Source:</strong> {row.source}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Priority:</strong> {row.priority}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(row)}>Edit</Button>
                                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(row._id)}>Delete</Button>
                                </CardActions>
                            </Card>
                        ))}
                        {visibleRows.length === 0 && (
                            <Typography align="center" sx={{ py: 3 }}>No leads found</Typography>
                        )}
                    </Box>
                ) : (
                    <TableContainer>
                        <Table
                            sx={{ minWidth: 750, width: '100%' }}
                            aria-labelledby="tableTitle"
                            size={dense ? 'small' : 'medium'}
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                            />
                            <TableBody>
                                {visibleRows.map((row, index) => {
                                    const isItemSelected = selected.includes(row._id);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => handleClick(event, row._id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row._id || index}
                                            selected={isItemSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </TableCell>
                                            <TableCell component="th" id={labelId} scope="row" padding="none">
                                                {row.name}
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {row.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="left">{row.companyName || '-'}</TableCell>
                                            <TableCell align="left">{row.phone}</TableCell>
                                            <TableCell align="left">{row.source}</TableCell>
                                            <TableCell align="left">
                                                <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                            </TableCell>
                                            <TableCell align="left">{row.priority}</TableCell>
                                            <TableCell align="left">
                                                <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(row._id); }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {visibleRows.length === 0 && (
                                    <TableRow style={{ height: (dense ? 33 : 53) * 1 }}>
                                        <TableCell colSpan={8} align="center">No leads found</TableCell>
                                    </TableRow>
                                )}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                                        <TableCell colSpan={8} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            {!isMobile && (
                <FormControlLabel
                    control={<Switch checked={dense} onChange={handleChangeDense} />}
                    label="Dense padding"
                />
            )}
        </Box>
    );
}
