/**
 * AdvancedTable Usage Examples
 *
 * This file demonstrates how to use the AdvancedTable component
 */

import AdvancedTable from "./AdvancedTable";

// Example 1: Basic Table
const BasicExample = () => {
  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "role", label: "Role" },
  ];

  return <AdvancedTable data={data} columns={columns} />;
};

// Example 2: Table with Custom Rendering
const CustomRenderExample = () => {
  const data = [
    { id: 1, name: "John Doe", status: "Active", priority: "High" },
  ];

  const columns = [
    { id: "name", label: "Name" },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { id: "priority", label: "Priority" },
  ];

  return <AdvancedTable data={data} columns={columns} />;
};

// Example 3: Table with Actions
const ActionsExample = () => {
  const data = [{ id: 1, name: "John Doe" }];
  const columns = [{ id: "name", label: "Name" }];

  const actions = [
    {
      icon: <EditIcon />,
      label: "Edit",
      onClick: (row) => console.log("Edit", row),
      color: "text-gray-600 hover:bg-gray-200",
    },
    {
      icon: <DeleteIcon />,
      label: "Delete",
      onClick: (row) => console.log("Delete", row),
      color: "text-red-600 hover:bg-red-100",
    },
  ];

  return <AdvancedTable data={data} columns={columns} actions={actions} />;
};

// Example 4: Table with Toolbar
const ToolbarExample = () => {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");

  const toolbar = {
    title: "Users",
    searchPlaceholder: "Search users...",
    search: {
      value: search,
      onChange: setSearch,
    },
    filters: [
      {
        value: status,
        onChange: setStatus,
        options: [
          { value: "", label: "All Status" },
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
    ],
    onCreate: {
      label: "Add User",
      onClick: () => console.log("Create user"),
    },
  };

  return <AdvancedTable data={[]} columns={[]} toolbar={toolbar} />;
};

// Example 5: Table with Selection
const SelectionExample = () => {
  const handleBulkDelete = (selectedIds) => {
    console.log("Delete selected:", selectedIds);
  };

  const selection = {
    enabled: true,
    onBulkDelete: handleBulkDelete,
  };

  return <AdvancedTable data={[]} columns={[]} selection={selection} />;
};

// Example 6: Table with Custom Mobile Card
const MobileCardExample = () => {
  const renderCard = (row, actions) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <h3 className="font-bold">{row.name}</h3>
      <p className="text-sm text-gray-600">{row.email}</p>
      <div className="flex gap-2 mt-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => action.onClick(row)}
            className="text-sm text-gray-600"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  return <AdvancedTable data={[]} columns={[]} renderCard={renderCard} />;
};

// Example 7: Complete Example (Leads Table)
const LeadsTableExample = ({
  leads,
  onEdit,
  onDelete,
  onPreview,
  onConvert,
  filters,
  onFilterChange,
  onCreate,
}) => {
  const columns = [
    {
      id: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    { id: "companyName", label: "Company" },
    { id: "phone", label: "Phone" },
    { id: "source", label: "Source" },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    { id: "priority", label: "Priority" },
  ];

  const actions = [
    {
      icon: <PreviewIcon />,
      label: "Preview",
      onClick: onPreview,
    },
    {
      icon: <EditIcon />,
      label: "Edit",
      onClick: onEdit,
    },
    {
      icon: <ConvertIcon />,
      label: "Convert",
      onClick: onConvert,
      condition: (row) => row.status === "Converted" && !row.isConverted,
      color: "text-green-600 hover:bg-green-100",
    },
    {
      icon: <DeleteIcon />,
      label: "Delete",
      onClick: (row) => onDelete(row._id),
      color: "text-red-600 hover:bg-red-100",
    },
  ];

  const toolbar = {
    title: "Leads",
    searchPlaceholder: "Search leads...",
    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },
    filters: [
      {
        value: filters.status,
        onChange: (value) => onFilterChange("status", value),
        options: [
          { value: "", label: "All Status" },
          { value: "New", label: "New" },
          { value: "Contacted", label: "Contacted" },
          { value: "Follow-up", label: "Follow-up" },
          { value: "Converted", label: "Converted" },
          { value: "Lost", label: "Lost" },
        ],
      },
      {
        value: filters.source,
        onChange: (value) => onFilterChange("source", value),
        options: [
          { value: "", label: "All Sources" },
          { value: "Website", label: "Website" },
          { value: "Referral", label: "Referral" },
          { value: "WhatsApp", label: "WhatsApp" },
          { value: "Cold Call", label: "Cold Call" },
          { value: "Event", label: "Event" },
          { value: "Other", label: "Other" },
        ],
      },
    ],
    onCreate: {
      label: "Add Lead",
      onClick: onCreate,
    },
  };

  const selection = {
    enabled: true,
    onBulkDelete: (selectedIds) => {
      selectedIds.forEach((id) => onDelete(id));
    },
  };

  return (
    <AdvancedTable
      data={leads}
      columns={columns}
      actions={actions}
      toolbar={toolbar}
      selection={selection}
      pagination={{
        enabled: true,
        rowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
      emptyMessage="No leads found"
    />
  );
};
