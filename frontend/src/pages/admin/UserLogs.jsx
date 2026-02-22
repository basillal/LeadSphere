import React, { useState, useEffect } from "react";
import auditLogService from "../../services/auditLogService";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import BasicModal from "../../components/common/modals/BasicModal";

const UserLogs = ({ user, onBack }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        console.log('UserLogs useEffect triggered!', { userId: user?._id, page, rowsPerPage });
        if (user?._id) {
            fetchLogs();
        }
    }, [user?._id, page, rowsPerPage]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await auditLogService.getAuditLogs({
                userId: user._id,
                page,
                limit: rowsPerPage,
            }, { skipLoader: true });
            setLogs(data.data || []);
            setTotal(data.pagination?.total || 0);
        } catch (err) {
            console.error("Failed to fetch user logs", err);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            id: "createdAt",
            label: "Date",
            width: "w-1/4",
            render: (row) => new Date(row.createdAt).toLocaleString(),
        },
        {
            id: "entity",
            label: "Entity",
            width: "w-1/4",
            render: (row) => row.entity || "-",
        },
        {
            id: "action",
            label: "Action",
            width: "w-1/4",
            render: (row) => (
                <span className="font-medium text-gray-900">{row.action}</span>
            ),
        },
        {
            id: "details",
            label: "Details",
            width: "w-1/4",
            render: (row) => (
                <span className="text-sm text-gray-600 truncate max-w-xs inline-block" title={row.details}>
                    {row.details || "-"}
                </span>
            ),
        },
        {
            id: "performedBy",
            label: "Performed By",
            width: "w-1/4",
            render: (row) => (
                <span className="text-sm text-gray-700">
                    {user?.name || "-"}
                </span>
            ),
        },
    ];

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setPage(1);
    };

    const actions = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ),
            label: "View Full Details",
            onClick: (row) => setSelectedLog(row),
            color: "text-blue-600 hover:bg-blue-100",
        }
    ];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Activity Logs: {user?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>
            <AdvancedTable
                data={logs}
                columns={columns}
                loading={loading}
                emptyMessage="No activity logs found for this user."
                getRowId={(row) => row._id}
                actions={actions}
                pagination={{
                    enabled: true,
                    external: true,
                    page,
                    total,
                    rowsPerPage,
                    onPageChange: handlePageChange,
                    onRowsPerPageChange: handleRowsPerPageChange,
                }}
            />

            {/* Full Details Modal */}
            <BasicModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Log Details"
                maxWidth="max-w-2xl"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</h4>
                                <p className="text-sm font-medium text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Entity</h4>
                                <p className="text-sm font-medium text-gray-900">{selectedLog.entity || "-"}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action</h4>
                                <p className="text-sm font-medium text-gray-900">{selectedLog.action}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Performed By</h4>
                                <p className="text-sm font-medium text-gray-900">{user?.name || "-"}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Full Details</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans break-words">
                                    {selectedLog.details || "-"}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </BasicModal>
        </div>
    );
};

export default UserLogs;
