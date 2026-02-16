import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const getActionColor = (action) => {
  switch (action) {
    case "CREATE":
      return "success";
    case "UPDATE":
      return "info";
    case "DELETE":
      return "error";
    case "LOGIN":
      return "primary";
    default:
      return "default";
  }
};

const AuditLogsTable = ({ rows }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      className="border border-gray-200 rounded-lg"
    >
      <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell className="font-semibold text-gray-700">
              Date/Time
            </TableCell>
            <TableCell className="font-semibold text-gray-700">User</TableCell>
            <TableCell className="font-semibold text-gray-700">
              Action
            </TableCell>
            <TableCell className="font-semibold text-gray-700">
              Entity
            </TableCell>
            <TableCell className="font-semibold text-gray-700">
              Organization
            </TableCell>
            <TableCell className="font-semibold text-gray-700">
              Details
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(row.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {row.user?.name ? row.user.name.toUpperCase() : "UNKNOWN"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {row.user?.email || row.ipAddress}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.action}
                    color={getActionColor(row.action)}
                    size="small"
                    variant="outlined"
                    className="font-semibold"
                  />
                </TableCell>
                <TableCell>{row.entity}</TableCell>
                <TableCell>
                  {row.organization?.name ||
                    (row.organization
                      ? "Organization ID: " + row.organization
                      : "Global/System")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm text-gray-700 truncate max-w-xs block"
                      title={row.details}
                    >
                      {row.details}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                className="py-8 text-gray-500"
              >
                No logs found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditLogsTable;
