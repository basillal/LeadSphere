import React, { useState, useMemo } from "react";

// Icons need to be replaced with standard SVGs or a library like lucide-react or heroicons.
// Since I can't easily install new libs without permission, I'll use simple SVG icons for now.
const Icons = {
  Delete: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Edit: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Add: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Filter: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  SortAsc: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 12-7 7-7-7" />
      <path d="M12 5v14" />
    </svg>
  ),
  Preview: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Convert: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// --- Comparators ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: "name", label: "Name", width: "w-1/5" },
  { id: "companyName", label: "Company", width: "w-[15%]" },
  { id: "phone", label: "Phone", width: "w-[15%]" },
  { id: "source", label: "Source", width: "w-[15%]" },
  { id: "status", label: "Status", width: "w-[10%]" },
  { id: "priority", label: "Priority", width: "w-[10%]" },
  { id: "actions", label: "Actions", width: "w-[15%]" },
];

export default function LeadsTable({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onPreview,
  onConvert,
  filters = { search: "", status: "", source: "" },
  onFilterChange,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState("");

  // --- Handlers ---
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
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
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSelected = () => {
    if (onDelete) {
      selected.forEach((id) => onDelete(id));
      setSelected([]);
    }
  };

  const getStatusColor = (status, isConverted) => {
    // If lead is converted to contact, show different color
    if (status === "Converted" && isConverted) {
      return "bg-gray-200 text-gray-700"; // Already converted to contact
    }

    switch (status) {
      case "NEW":
      case "New":
        return "bg-gray-200 text-black";
      case "CONTACTED":
      case "Contacted":
        return "bg-indigo-100 text-indigo-800";
      case "FOLLOW_UP":
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800";
      case "CONVERTED":
      case "Converted":
        return "bg-green-100 text-green-800"; // Ready to convert
      case "LOST":
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Derived Data ---
  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, rows, filterText],
  );

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b border-gray-200 ${
          selected.length > 0 ? "bg-gray-100" : ""
        }`}
      >
        {selected.length > 0 ? (
          <div className="flex items-center w-full justify-between">
            <span className="text-sm font-medium text-black">
              {selected.length} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="p-1 hover:bg-red-200 rounded text-red-600"
            >
              <Icons.Delete />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
              Leads
            </h2>

            <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={(e) => onFilterChange("search", e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div className="absolute left-2.5 top-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>

              {/* Source Filter */}
              <select
                value={filters.source}
                onChange={(e) => onFilterChange("source", e.target.value)}
                className="hidden md:block px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>

              <button
                onClick={onCreate}
                className="inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <Icons.Add /> <span className="hidden md:inline">Add Lead</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View (Cards) */}
      <div className="block md:hidden bg-gray-50 p-2">
        {visibleRows.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No leads found</div>
        ) : (
          visibleRows.map((row) => (
            <div
              key={row._id}
              className="bg-white p-4 rounded-lg shadow-sm border-b border-gray-100 last:border-0 mb-3"
              onClick={() => onPreview && onPreview(row)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{row.name}</h3>
                  <p className="text-xs text-gray-500">
                    {row.companyName || "-"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}
                >
                  {row.status}
                  {row.status === "Converted" && row.isConverted && (
                    <span className="ml-1">✓</span>
                  )}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>
                  <span className="font-medium">Phone:</span> {row.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {row.email}
                </p>
                <p>
                  <span className="font-medium">Source:</span> {row.source}
                </p>
                <p>
                  <span className="font-medium">Priority:</span> {row.priority}
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreview) onPreview(row);
                  }}
                  className="text-gray-500 hover:text-black text-sm font-medium flex items-center gap-1"
                  title="Preview"
                >
                  <Icons.Preview />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  className="text-gray-600 hover:text-black text-sm font-medium flex items-center gap-1"
                  title="Edit"
                >
                  <Icons.Edit />
                </button>
                {row.status === "Converted" &&
                  !row.isConverted &&
                  onConvert && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvert(row);
                      }}
                      className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      title="Convert to Contact"
                    >
                      <Icons.Convert />
                    </button>
                  )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row._id);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  title="Delete"
                >
                  <Icons.Delete />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAllClick}
                  checked={rows.length > 0 && selected.length === rows.length}
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
              </th>
              {headCells.map((headCell) => (
                <th
                  key={headCell.id}
                  className={`px-4 py-3 cursor-pointer hover:text-gray-900 ${headCell.width}`}
                  onClick={() =>
                    headCell.id !== "actions" && handleRequestSort(headCell.id)
                  }
                >
                  <div className="flex items-center gap-1">
                    {headCell.label}
                    {orderBy === headCell.id &&
                      (order === "asc" ? (
                        <Icons.SortAsc />
                      ) : (
                        <Icons.SortDesc />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const isSelected = selected.includes(row._id);
                return (
                  <tr
                    key={row._id}
                    onClick={() => handleClick(row._id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? "bg-gray-100" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.name}
                      <span className="block text-xs text-gray-500">
                        {row.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.companyName || "-"}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">{row.source}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}
                      >
                        {row.status}
                        {row.status === "Converted" && row.isConverted && (
                          <span className="ml-1">✓</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.priority}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPreview) onPreview(row);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                          title="Preview"
                        >
                          <Icons.Preview />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        {row.status === "Converted" &&
                          !row.isConverted &&
                          onConvert && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onConvert(row);
                              }}
                              className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                              title="Convert to Contact"
                            >
                              <Icons.Convert />
                            </button>
                          )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row._id);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Icons.Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination settings */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{page * rowsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min((page + 1) * rowsPerPage, rows.length)}
              </span>{" "}
              of <span className="font-medium">{rows.length}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => handleChangePage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handleChangePage(Math.min(totalPages - 1, page + 1))
                }
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
        {/* Mobile Pagination Simple */}
        <div className="sm:hidden flex justify-between w-full">
          <button
            onClick={() => handleChangePage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm self-center">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
