import React, { useState, useMemo } from "react";

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pagination.rowsPerPage || 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Mobile detection
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <div className="w-full">
      {/* Toolbar */}
      {toolbar && (
        <div
          className={`mb-4 ${selected.length > 0 ? "bg-gray-100 rounded-lg p-4" : ""}`}
        >
          {selected.length > 0 && selection.enabled ? (
            <div className="flex items-center w-full justify-between">
              <span className="text-sm font-medium text-black">
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
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              {toolbar.search && (
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={toolbar.searchPlaceholder || "Search..."}
                    value={toolbar.search.value}
                    onChange={(e) => toolbar.search.onChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              )}

              {/* Filters */}
              {toolbar.filters &&
                toolbar.filters.map((filter, index) => (
                  <select
                    key={index}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
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
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      btn.className ||
                      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}

              {/* Create Button */}
              {toolbar.onCreate && (
                <button
                  onClick={toolbar.onCreate.onClick}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
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
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          ) : (
            visibleRows.map((row) =>
              renderCard ? (
                renderCard(row, actions)
              ) : (
                <div
                  key={getRowId(row)}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="space-y-1.5">
                    {columns.map((col) => (
                      <div key={col.id} className="text-sm">
                        <span className="font-medium text-gray-700">
                          {col.label}:{" "}
                        </span>
                        <span className="text-gray-900">
                          {col.render ? col.render(row) : row[col.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                  {actions.length > 0 && (
                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-2 mt-2">
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
                            className={`p-1.5 rounded-lg transition-colors ${action.color || "text-gray-600 hover:bg-gray-100"}`}
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative min-h-[200px]">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
                <p className="text-sm font-medium text-gray-600">
                  Loading data...
                </p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {selection.enabled && (
                    <th className="px-4 py-2.5 w-10">
                      <input
                        type="checkbox"
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
                      className={`px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.sortable !== false ? "cursor-pointer hover:text-gray-900" : ""} ${column.width || ""}`}
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
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      className="px-4 py-8 text-center"
                    >
                      <p className="text-gray-500">{emptyMessage}</p>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => {
                    const rowId = getRowId(row);
                    const isSelected = selected.includes(rowId);
                    return (
                      <tr
                        key={rowId}
                        onClick={() => selection.enabled && handleClick(rowId)}
                        className={`hover:bg-gray-50 ${selection.enabled ? "cursor-pointer" : ""} transition-colors ${isSelected ? "bg-gray-100" : ""}`}
                      >
                        {selection.enabled && (
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={`px-4 py-2 text-sm ${column.className || "text-gray-600"}`}
                          >
                            {column.render
                              ? column.render(row)
                              : row[column.id]}
                          </td>
                        ))}
                        {actions.length > 0 && (
                          <td className="px-4 py-2 text-right">
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
                                    className={`p-1.5 rounded-lg transition-colors ${action.color || "text-gray-600 hover:bg-gray-100"}`}
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
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{page * rowsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min((page + 1) * rowsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="flex items-center px-4 py-2 text-sm text-gray-700 border-t border-b border-gray-300 bg-white">
                  Page {page + 1} of {totalPages || 1}
                </div>
                <button
                  onClick={() =>
                    handleChangePage(Math.min(totalPages - 1, page + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm self-center">
              {page + 1} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                handleChangePage(Math.min(totalPages - 1, page + 1))
              }
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
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
