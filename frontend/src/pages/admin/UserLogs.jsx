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
            render: (row) => (
                <span className="text-[10.5px] text-gray-700 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })} {new Date(row.createdAt).toLocaleTimeString()}
                </span>
            ),
        },
        {
            id: "entity",
            label: "Entity",
            render: (row) => <span className="text-[10.5px] font-semibold text-gray-800 whitespace-nowrap">{row.entity || "-"}</span>,
        },
        {
            id: "action",
            label: "Action",
            render: (row) => (
                <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    {row.action}
                </span>
            ),
        },
        {
            id: "details",
            label: "Details",
            render: (row) => (
                <span className="text-[10.5px] text-gray-600 truncate max-w-xs inline-block font-mono" title={row.details}>
                    {row.details || "-"}
                </span>
            ),
        },
        {
            id: "performedBy",
            label: "Performed By",
            render: (row) => (
                <span className="text-[10.5px] text-gray-700 font-medium whitespace-nowrap">
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
        <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2 px-1">
                <div>
                    <h2 className="text-[13px] font-semibold text-gray-900 tracking-tight">
                        Activity Logs: {user?.name}
                    </h2>
                    <p className="text-[10.5px] text-gray-400 mt-0.5">{user?.email}</p>
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
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-1">Date & Time</h4>
                                <p className="text-sm font-medium text-slate-800">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-1">Entity</h4>
                                <p className="text-sm font-medium text-slate-800">{selectedLog.entity || "-"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-1">Action</h4>
                                <p className="text-sm font-medium text-slate-800">{selectedLog.action}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-1">Performed By</h4>
                                <p className="text-sm font-medium text-slate-800">{user?.name || "-"}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-slate-800 mb-2">Full Details</h4>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <pre className="text-base text-black whitespace-pre-wrap font-sans break-words">
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
