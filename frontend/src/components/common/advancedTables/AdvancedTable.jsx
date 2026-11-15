import React, { useState, useMemo } from "react";
import EmptyTableState from "../EmptyTableState";

/**
 * AdvancedTable - Mentora UI Design System standard table
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
    pagination.external && pagination.page ? pagination.page - 1 : 0
  );
  const [rowsPerPage, setRowsPerPage] = useState(pagination.rowsPerPage || 10);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

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
    const handleResize = () => setIsMobile(window.innerWidth < 640);
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
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
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
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // Icons
  const Icons = {
    SortAsc: () => (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7M12 19V5" />
      </svg>
    ),
    SortDesc: () => (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19 12-7 7-7-7M12 5v14" />
      </svg>
    ),
    Delete: () => (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  };

  const getEmptyStateCopy = () => {
    if (typeof emptyMessage === "object") return emptyMessage;
    return {
      title: emptyMessage,
      description: "No records to display at this time.",
    };
  };

  const emptyStateCopy = getEmptyStateCopy();

  return (
    <div className="w-full font-inter">
      {/* Toolbar */}
      {toolbar && (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          {selected.length > 0 && selection.enabled ? (
            <div className="flex items-center w-full justify-between p-2.5 bg-[#FFF1EB] border border-[var(--primary)]/20 rounded-[14px]">
              <span className="text-[11px] font-semibold text-[var(--primary)]">
                {selected.length} row{selected.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="em-btn-clear text-[#DC2626] hover:bg-[#FEE2E2] hover:border-[#DC2626]/30"
              >
                <Icons.Delete />
                <span>Delete Selected</span>
              </button>
            </div>
          ) : (
            <>
              {/* Search on left */}
              {toolbar.search ? (
                <div className="search-bar">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder={toolbar.searchPlaceholder || "Search..."}
                      value={toolbar.search.value || ""}
                      onChange={(e) => toolbar.search.onChange(e.target.value)}
                      className="w-full h-[34px] pl-9 pr-3 text-[11px] text-[#111827] bg-white border border-[#E2E8F0] rounded-full outline-none focus:border-gray-400 placeholder:text-[#9CA3AF]"
                    />
                    <svg
                      className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* Filters and Actions on right */}
              <div className="flex items-center gap-2.5 ml-auto sm:ml-0 flex-wrap">
                {toolbar.filters &&
                  toolbar.filters.map((filter, index) => (
                    <select
                      key={index}
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="h-[34px] px-3.5 text-[11px] font-medium text-[#111827] bg-white border border-[#E2E8F0] rounded-full outline-none hover:border-gray-400 transition-colors"
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ))}

                {toolbar.extraButtons &&
                  toolbar.extraButtons.map((btn, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={btn.onClick}
                      className="em-btn-clear"
                    >
                      {btn.label}
                    </button>
                  ))}

                {toolbar.onCreate && (
                  <button
                    type="button"
                    onClick={toolbar.onCreate.onClick}
                    className="em-add"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>{toolbar.onCreate.label || "Add New"}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Container Card */}
      <div className="em-card relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent animate-pulse" />
        )}

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {selection.enabled && (
                  <th className="px-5 py-3.5 w-10 text-center border-b border-gray-100 bg-white">
                    <input
                      type="checkbox"
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSelectAllClick}
                      checked={data.length > 0 && selected.length === data.length}
                      className="w-3.5 h-3.5 accent-[var(--primary)] rounded cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-5 py-3.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white ${
                      column.sortable !== false ? "cursor-pointer hover:text-[#111827]" : ""
                    } ${column.width || ""}`}
                    onClick={() =>
                      column.sortable !== false && handleRequestSort(column.id)
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {orderBy === column.id &&
                        (order === "asc" ? <Icons.SortAsc /> : <Icons.SortDesc />)}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-5 py-3.5 text-right text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selection.enabled ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    className="px-5 py-12 text-center"
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
                      onClick={() =>
                        onRowClick
                          ? onRowClick(row)
                          : selection.enabled && handleClick(rowId)
                      }
                      className={`hover:bg-[#FCFCFC] transition-colors border-t border-gray-100 ${
                        isSelected ? "bg-[#FFF1EB]/30" : ""
                      }`}
                      style={{
                        cursor: onRowClick || selection.enabled ? "pointer" : "default",
                      }}
                    >
                      {selection.enabled && (
                        <td
                          className="px-5 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleClick(rowId)}
                            className="w-3.5 h-3.5 accent-[var(--primary)] rounded cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={`px-5 py-3 text-[10.5px] ${
                            column.className || "text-[#4B5563]"
                          }`}
                        >
                          {column.render ? column.render(row) : row[column.id]}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td
                          className="px-5 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {actions.map((action, idx) => {
                              if (action.condition && !action.condition(row))
                                return null;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => action.onClick(row)}
                                  className="em-icon-btn"
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

        {/* Mobile View - Cards Transformation */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {visibleRows.length === 0 ? (
            <div className="p-6 text-center">
              <EmptyTableState
                title={emptyStateCopy.title}
                description={emptyStateCopy.description}
              />
            </div>
          ) : (
            visibleRows.map((row) =>
              renderCard ? (
                renderCard(row, actions)
              ) : (
                <div
                  key={getRowId(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="p-3.5 hover:bg-[#FCFCFC] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-[#111827] truncate">
                        {columns[0]
                          ? columns[0].render
                            ? columns[0].render(row)
                            : row[columns[0].id]
                          : ""}
                      </div>
                      {columns[1] && (
                        <div className="text-[9.5px] text-[#8B92A5] mt-0.5 truncate">
                          {columns[1].render
                            ? columns[1].render(row)
                            : row[columns[1].id]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] pt-1">
                    {columns.slice(2).map((col) => (
                      <div key={col.id} className="min-w-0">
                        <span className="text-[#9CA3AF] block text-[9px] uppercase tracking-wider">
                          {col.label}
                        </span>
                        <div className="truncate font-medium text-[#111827]">
                          {col.render ? col.render(row) : String(row[col.id] ?? "-")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {actions.length > 0 && (
                    <div
                      className="flex justify-end gap-1.5 border-t border-gray-100 pt-2 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions.map((action, idx) => {
                        if (action.condition && !action.condition(row))
                          return null;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => action.onClick(row)}
                            className="em-icon-btn"
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            )
          )}
        </div>

        {/* Mentora Standard Pagination */}
        {pagination.enabled && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAFAFA]/60">
            <span className="text-[10px] text-[#64748B]">
              Showing {page * rowsPerPage + 1}–
              {Math.min((page + 1) * rowsPerPage, totalItems)} of {totalItems} records
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleChangePage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="h-[30px] px-2.5 text-[10.5px] font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              <span className="text-[10px] font-semibold text-[#111827] px-2">
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="h-[30px] px-2.5 text-[10.5px] font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>

              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="h-[30px] px-2 text-[10.5px] rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] outline-none ml-2 cursor-pointer"
              >
                {(pagination.rowsPerPageOptions || [5, 10, 25, 50]).map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedTable;
