import React, { useState, useMemo } from "react";
import EmptyTableState from "../EmptyTableState";

/**
 * AdvancedTable - A reusable, feature-rich table component
 *
 * Features:
 * - Desktop table view / Mobile card view
 * - Sorting (client-side)
 * - Row selection with bulk actions
 * - Pagination
 * - Customizable columns and actions
 * - Search and filters toolbar
 * - Responsive design
 *
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Column definitions [{ id, label, render?, sortable?, width? }]
 * @param {Array} props.actions - Action buttons for each row [{ icon, label, onClick, color?, condition? }]
 * @param {Function} props.renderCard - Custom render function for mobile card view
 * @param {Object} props.toolbar - Toolbar configuration { title, searchPlaceholder, filters, onCreate }
 * @param {Object} props.pagination - Pagination config { enabled, rowsPerPage, rowsPerPageOptions }
 * @param {Object} props.selection - Selection config { enabled, onBulkDelete }
 * @param {String} props.emptyMessage - Message when no data
 * @param {Function} props.getRowId - Function to get unique row ID (default: row => row._id)
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
      // Convert to 1-based index if external expects it, or keep 0-based?
      // Leads.jsx expects 1-based. AdvancedTable is 0-based.
      // We will pass the 1-based index to onPageChange as standard for this app seems 1-based (Mongoose pagination usually 1-based)
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
    // Only slice if using internal pagination
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

  // Use external total if available, otherwise calculate from data
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

  return (
    <div className="w-full">
      {/* Toolbar */}
      {toolbar && (
        <div
          className={`mb-3 md:mb-4 ${selected.length > 0 ? "bg-white/90 rounded-2xl p-3 md:p-4 border border-slate-200 shadow-sm" : ""}`}
        >
          {selected.length > 0 && selection.enabled ? (
            <div className="flex items-center w-full justify-between">
              <span className="text-base font-light text-black">
                {selected.length} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="p-2 hover:bg-red-200 rounded-lg text-red-600 transition-colors"
              >
                <Icons.Delete />
              </button>
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
              {/* Search */}
              {toolbar.search && !isMobile && (
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder={toolbar.searchPlaceholder || "Search..."}
                    value={toolbar.search.value}
                    onChange={(e) => toolbar.search.onChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 shadow-sm"
                  />
                </div>
              )}

              {isMobile && toolbar.search && toolbar.filters && toolbar.filters.length > 0 && (
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileToolbarMode("search");
                      setMobileToolbarOpen((v) => !v);
                    }}
                    className="flex-1 min-h-11 px-3 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 transition-colors text-xs font-semibold inline-flex items-center justify-between shadow-sm"
                  >
                    <span>Search</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${mobileToolbarOpen && mobileToolbarMode === "search" ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileToolbarMode("filters");
                      setMobileToolbarOpen((v) => !v);
                    }}
                    className="flex-1 min-h-11 px-3 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 transition-colors text-xs font-semibold inline-flex items-center justify-between shadow-sm"
                  >
                    <span>Filters</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${mobileToolbarOpen && mobileToolbarMode === "filters" ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {toolbar.search && isMobile && mobileToolbarOpen && mobileToolbarMode === "search" && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-3xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-900/10">
                  <input
                    type="text"
                    placeholder={toolbar.searchPlaceholder || "Search..."}
                    value={toolbar.search.value}
                    onChange={(e) => toolbar.search.onChange(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 shadow-sm text-sm"
                  />
                </div>
              )}

              {toolbar.filters && toolbar.filters.length > 0 && isMobile && mobileToolbarOpen && mobileToolbarMode === "filters" && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-3xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-900/10">
                  <div className="grid grid-cols-1 gap-2">
                    {toolbar.filters.map((filter, index) => (
                      <select
                        key={index}
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 bg-white shadow-sm text-sm"
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {toolbar.filters &&
                toolbar.filters.length > 0 &&
                !isMobile &&
                toolbar.filters.map((filter, index) => (
                  <select
                    key={index}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-full md:w-auto px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 bg-white shadow-sm"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}

              {/* Extra Buttons */}
              {toolbar.extraButtons &&
                toolbar.extraButtons.map((btn, index) => (
                  <button
                    key={index}
                    onClick={btn.onClick}
                    className={`w-full md:w-auto px-4 py-3 rounded-2xl font-semibold whitespace-nowrap transition-colors shadow-sm ${
                      btn.className ||
                      "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}

              {/* Create Button */}
              {toolbar.onCreate && (
                <button
                  onClick={toolbar.onCreate.onClick}
                  className="w-full md:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors font-semibold whitespace-nowrap shadow-sm text-sm"
                >
                  + {toolbar.onCreate.label || "Add"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile View - Cards */}
      {isMobile ? (
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
                  className="bg-white p-4 rounded-2xl shadow-[0_14px_50px_-12px_rgba(2,6,23,0.12)] border border-slate-100"
                >
                  {/* Header: avatar + highlighted name + meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-700 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-bold text-slate-900 truncate">
                          {columns[0]
                            ? columns[0].render
                              ? columns[0].render(row)
                              : row[columns[0].id]
                            : ""}
                        </div>
                        {columns[1] && (
                          <div className="text-sm text-slate-500 mt-1 truncate">
                            {columns[1].render ? columns[1].render(row) : row[columns[1].id]}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      {/* Priority badge */}
                      {row.priority && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              row.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : row.priority === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {row.priority}
                          </span>
                        )}

                      {/* Status badge */}
                      {row.status && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {row.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-700">
                    {columns.slice(2).map((col) => (
                      <div key={col.id} className="min-w-0">
                        <div className="text-xs text-slate-500">{col.label}</div>
                        <div className="truncate mt-0.5">
                          {col.render ? col.render(row) : String(row[col.id] ?? "-")}
                        </div>
                      </div>
                    ))}
                  </div>

                    {actions.length > 0 && (
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                      {actions.map((action, idx) => {
                        if (action.condition && !action.condition(row)) return null;
                            return (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={`p-2 rounded-lg transition-colors ${action.color || "text-slate-900 hover:bg-slate-100"}`}
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
      ) : (
        /* Desktop View - Table */
        <div className="table-frame relative min-h-[200px]">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
                <p className="text-base font-light text-black">
                  Loading data...
                </p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {selection.enabled && (
                      <th className="px-4 py-2.5 w-10">
                      <input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSelectAllClick}
                        checked={
                          data.length > 0 && selected.length === data.length
                        }
                        className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-[0.16em] ${column.sortable !== false ? "cursor-pointer hover:text-slate-950" : ""} ${column.width || ""}`}
                      onClick={() =>
                        column.sortable !== false &&
                        handleRequestSort(column.id)
                      }
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {orderBy === column.id &&
                          (order === "asc" ? (
                            <Icons.SortAsc />
                          ) : (
                            <Icons.SortDesc />
                          ))}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 uppercase tracking-[0.16em]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        (selection.enabled ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="px-4 py-10 text-center"
                    >
                      <EmptyTableState
                        title={emptyStateCopy.title}
                        description={emptyStateCopy.description}
                      />
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => {
                    const rowId = getRowId(row);
                    const isSelected = selected.includes(rowId);
                    return (
                      <tr
                        key={rowId}
                        onClick={() => (onRowClick ? onRowClick(row) : selection.enabled && handleClick(rowId))}
                        className={`hover:bg-slate-50 ${selection.enabled ? "cursor-pointer" : ""} transition-colors ${isSelected ? "bg-slate-100" : ""}`}
                      >
                        {selection.enabled && (
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleClick(rowId);
                              }}
                              className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={`px-4 py-3 text-sm ${column.className || "text-slate-900"}`}
                          >
                            {column.render
                              ? column.render(row)
                              : row[column.id]}
                          </td>
                        ))}
                        {actions.length > 0 && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {actions.map((action, idx) => {
                                if (action.condition && !action.condition(row))
                                  return null;
                                return (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row);
                                    }}
                                    className={`p-2 rounded-xl transition-colors ${action.color || "text-slate-900 hover:bg-slate-100"}`}
                                    title={action.label}
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

      {/* Pagination */}
      {pagination.enabled && (
        <div className="mt-4 px-4 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-base text-black">
                Showing{" "}
                <span className="font-light">{page * rowsPerPage + 1}</span> to{" "}
                <span className="font-light">
                  {Math.min((page + 1) * rowsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-light">{totalItems}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black"
              >
                {(pagination.rowsPerPageOptions || [5, 10, 25, 50]).map(
                  (option) => (
                    <option key={option} value={option}>
                      {option} per page
                    </option>
                  ),
                )}
              </select>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handleChangePage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-base font-light text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="flex items-center px-4 py-2 text-base text-black border-t border-b border-gray-300 bg-white">
                  Page {page + 1} of {totalPages || 1}
                </div>
                <button
                  onClick={() =>
                    handleChangePage(Math.min(totalPages - 1, page + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-base font-light text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
          {/* Mobile Pagination */}
          <div className="sm:hidden flex justify-between w-full">
            <button
              onClick={() => handleChangePage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-gray-300 rounded text-base disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-base self-center">
              {page + 1} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                handleChangePage(Math.min(totalPages - 1, page + 1))
              }
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-base disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTable;
