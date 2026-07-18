import React, { useState, useMemo } from "react";
import EmptyTableState from "../EmptyTableState";

/**
 * AdvancedTable - A reusable, feature-rich table component
 */
const AdvancedTable = ({
  data = [],
  columns = [],
  actions = [],
  renderCard,
  onRowClick,
  toolbar = {},
  pagination = {
    enabled: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
  },
  selection = { enabled: false },
  emptyMessage = "No data found",
  getRowId = (row) => row._id,
  loading = false,
}) => {
  // State
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(
    pagination.external && pagination.page ? pagination.page - 1 : 0,
  );
  const [rowsPerPage, setRowsPerPage] = useState(pagination.rowsPerPage || 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);
  const [mobileToolbarMode, setMobileToolbarMode] = useState("search");

  // Sync state with props for external pagination
  React.useEffect(() => {
    if (pagination.external && pagination.page !== undefined) {
      setPage(pagination.page - 1);
    }
    if (pagination.rowsPerPage !== undefined) {
      setRowsPerPage(pagination.rowsPerPage);
    }
  }, [pagination.page, pagination.rowsPerPage, pagination.external]);

  // Mobile detection
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!isMobile) setMobileToolbarOpen(false);
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) setMobileToolbarMode("search");
  }, [isMobile]);

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // Selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => getRowId(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selection.onBulkDelete) {
      selection.onBulkDelete(selected);
      setSelected([]);
    }
  };

  // Pagination
  const handleChangePage = (newPage) => {
    setPage(newPage);
    if (pagination.onPageChange) {
      pagination.onPageChange(newPage + 1);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (pagination.onRowsPerPageChange) {
      pagination.onRowsPerPageChange(newRowsPerPage);
    }
  };

  // Derived data
  const visibleRows = useMemo(() => {
    let sorted = [...data];
    if (orderBy) {
      sorted = sorted.sort(getComparator(order, orderBy));
    }
    if (pagination.enabled && !pagination.external) {
      return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }
    return sorted;
  }, [
    order,
    orderBy,
    page,
    rowsPerPage,
    data,
    pagination.enabled,
    pagination.external,
  ]);

  const totalItems =
    pagination.external && pagination.total !== undefined
      ? pagination.total
      : data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Icons
  const Icons = {
    SortAsc: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    ),
    SortDesc: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m19 12-7 7-7-7" />
        <path d="M12 5v14" />
      </svg>
    ),
    Delete: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
  };

  const getEmptyStateCopy = () => {
    const normalized = String(emptyMessage || "").toLowerCase();
    if (normalized.includes("lead")) {
      return {
        title: emptyMessage,
        description: "Get started by adding your first lead.",
      };
    }
    if (normalized.includes("activity")) {
      return {
        title: emptyMessage,
        description: "Add your first activity to keep the timeline moving.",
      };
    }
    if (normalized.includes("invoice") || normalized.includes("bill")) {
      return {
        title: emptyMessage,
        description: "Create your first record to begin tracking here.",
      };
    }

    return {
      title: emptyMessage,
      description: "Add a new record to get started.",
    };
  };

  const emptyStateCopy = getEmptyStateCopy();

  const [focusedSearch, setFocusedSearch] = useState(false);

  return (
    <div className="w-full">
      {/* Toolbar */}
      {toolbar && (
        <div
          style={{
            marginBottom: "1rem",
            background: selected.length > 0 ? "rgba(79, 70, 229, 0.05)" : "transparent",
            borderRadius: "12px",
            padding: selected.length > 0 ? "0.75rem 1rem" : "0",
            border: selected.length > 0 ? "1px solid rgba(79, 70, 229, 0.2)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {selected.length > 0 && selection.enabled ? (
            <div className="flex items-center w-full justify-between">
              <span className="text-sm font-semibold text-indigo-900">
                {selected.length} row{selected.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}
              >
                <Icons.Delete />
                <span>Delete Selected</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2.5 items-center justify-between">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2.5 w-full md:w-auto flex-1">
                {/* Search */}
                {toolbar.search && !isMobile && (
                  <div style={{ position: "relative", minWidth: "280px" }}>
                    <svg
                      style={{
                        position: "absolute",
                        left: "0.875rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "16px",
                        height: "16px",
                        color: focusedSearch ? "#4F46E5" : "#94A3B8",
                        transition: "color 0.15s ease",
                      }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder={toolbar.searchPlaceholder || "Search..."}
                      value={toolbar.search.value}
                      onChange={(e) => toolbar.search.onChange(e.target.value)}
                      onFocus={() => setFocusedSearch(true)}
                      onBlur={() => setFocusedSearch(false)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 1rem 0.55rem 2.25rem",
                        fontSize: "0.82rem",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        color: "#0F172A",
                        background: "white",
                        border: `1.5px solid ${focusedSearch ? "#4F46E5" : "#E2E8F0"}`,
                        borderRadius: "8px",
                        outline: "none",
                        transition: "all 0.18s ease",
                        boxShadow: focusedSearch ? "0 0 0 3px rgba(79,70,229,0.1)" : "none",
                      }}
                    />
                  </div>
                )}

                {/* Filters */}
                {toolbar.filters &&
                  toolbar.filters.length > 0 &&
                  !isMobile &&
                  toolbar.filters.map((filter, index) => (
                    <select
                      key={index}
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      style={{
                        background: "white",
                        border: "1.5px solid #E2E8F0",
                        color: "#475569",
                        fontSize: "0.82rem",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        borderRadius: "8px",
                        padding: "0.55rem 0.875rem",
                        outline: "none",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(15,23,42,0.02)",
                        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4F46E5";
                        e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ))}
              </div>

              {/* Action Buttons & Create */}
              <div className="flex gap-2 w-full md:w-auto justify-end">
                {toolbar.extraButtons &&
                  toolbar.extraButtons.map((btn, index) => (
                    <button
                      key={index}
                      onClick={btn.onClick}
                      style={{
                        padding: "0.55rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        border: "1.5px solid #E2E8F0",
                        background: "white",
                        color: "#334155",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F8FAFC";
                        e.currentTarget.style.borderColor = "#CBD5E1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = "#E2E8F0";
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}

                {toolbar.onCreate && (
                  <button
                    onClick={toolbar.onCreate.onClick}
                    style={{
                      padding: "0.55rem 1.1rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      border: "none",
                      background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                      color: "white",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(79,70,229,0.2)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #4338CA, #4F46E5)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,70,229,0.3)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #4F46E5, #6366F1)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.2)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    + {toolbar.onCreate.label || "Add"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop View - Table */}
      {!isMobile && (
        <div className="table-frame relative min-h-[200px]" style={{ background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(15,23,42,0.04)" }}>
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[1.5px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2"></div>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#4F46E5" }}>
                  Updating records...
                </p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {selection.enabled && (
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSelectAllClick}
                        checked={data.length > 0 && selected.length === data.length}
                        style={{
                          borderRadius: "4px",
                          borderColor: "#CBD5E1",
                          color: "#4F46E5",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${column.sortable !== false ? "cursor-pointer hover:text-slate-900" : ""} ${column.width || ""}`}
                      onClick={() => column.sortable !== false && handleRequestSort(column.id)}
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {orderBy === column.id &&
                          (order === "asc" ? <Icons.SortAsc /> : <Icons.SortDesc />)}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th
                      className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selection.enabled ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                      className="px-4 py-12 text-center"
                    >
                      <EmptyTableState
                        title={emptyStateCopy.title}
                        description={emptyStateCopy.description}
                      />
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, rIdx) => {
                    const rowId = getRowId(row);
                    const isSelected = selected.includes(rowId);
                    return (
                      <tr
                        key={rowId}
                        onClick={() => (onRowClick ? onRowClick(row) : selection.enabled && handleClick(rowId))}
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}
                        style={{ cursor: onRowClick || selection.enabled ? "pointer" : "default" }}
                      >
                        {selection.enabled && (
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleClick(rowId)}
                              style={{
                                borderRadius: "4px",
                                borderColor: "#CBD5E1",
                                color: "#4F46E5",
                                width: "16px",
                                height: "16px",
                                cursor: "pointer",
                              }}
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={`px-4 py-3.5 text-sm ${column.className || "text-slate-700"}`}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              verticalAlign: "middle",
                            }}
                          >
                            {column.render ? column.render(row) : row[column.id]}
                          </td>
                        ))}
                        {actions.length > 0 && (
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              {actions.map((action, idx) => {
                                if (action.condition && !action.condition(row)) return null;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => action.onClick(row)}
                                    className={`p-1.5 rounded-md transition-colors ${action.color || "text-slate-400 hover:text-slate-800 hover:bg-slate-100"}`}
                                    title={action.label}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {action.icon}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile View - Cards */}
      {isMobile && (
        <div className="space-y-3">
          {visibleRows.length === 0 ? (
            <EmptyTableState
              title={emptyStateCopy.title}
              description={emptyStateCopy.description}
            />
          ) : (
            visibleRows.map((row) =>
              renderCard ? (
                renderCard(row, actions)
              ) : (
                <div
                  key={getRowId(row)}
                  className="bg-white p-4 rounded-xl border border-slate-200"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-slate-900 truncate">
                          {columns[0] ? (columns[0].render ? columns[0].render(row) : row[columns[0].id]) : ""}
                        </div>
                        {columns[1] && (
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {columns[1].render ? columns[1].render(row) : row[columns[1].id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-600">
                    {columns.slice(2).map((col) => (
                      <div key={col.id} className="min-w-0">
                        <div className="text-slate-400 font-medium">{col.label}</div>
                        <div className="truncate mt-0.5 font-semibold text-slate-800">
                          {col.render ? col.render(row) : String(row[col.id] ?? "-")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {actions.length > 0 && (
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5 mt-3">
                      {actions.map((action, idx) => {
                        if (action.condition && !action.condition(row)) return null;
                        return (
                          <button
                            key={idx}
                            onClick={() => action.onClick(row)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            )
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.enabled && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.65rem 1rem",
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(15,23,42,0.02)",
          }}
        >
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Showing <span style={{ fontWeight: 600, color: "#0F172A" }}>{page * rowsPerPage + 1}</span> to{" "}
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  {Math.min((page + 1) * rowsPerPage, totalItems)}
                </span>{" "}
                of <span style={{ fontWeight: 600, color: "#0F172A" }}>{totalItems}</span> results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "#475569",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {(pagination.rowsPerPageOptions || [5, 10, 25, 50]).map((option) => (
                  <option key={option} value={option}>
                    {option} per page
                  </option>
                ))}
              </select>
              <div style={{ display: "inline-flex", borderRadius: "8px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <button
                  onClick={() => handleChangePage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  style={{
                    padding: "0.4rem 0.6rem",
                    background: "white",
                    border: "none",
                    borderRight: "1px solid #E2E8F0",
                    color: "#475569",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    opacity: page === 0 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div
                  style={{
                    padding: "0.4rem 0.75rem",
                    background: "#F8FAFC",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Page {page + 1} of {totalPages || 1}
                </div>
                <button
                  onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: "0.4rem 0.6rem",
                    background: "white",
                    border: "none",
                    borderLeft: "1px solid #E2E8F0",
                    color: "#475569",
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                    opacity: page >= totalPages - 1 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTable;
