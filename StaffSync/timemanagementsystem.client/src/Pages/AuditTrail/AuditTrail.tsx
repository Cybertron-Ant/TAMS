import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../app/fetchWrapper";
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import PermissionManager from "../../app/PermissionManager ";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

const API_URL = import.meta.env.VITE_TMS_PROD;

interface AuditTrailData {
  id: number;
  tableName: string;
  action: string;
  userId: string;
  timestamp: string;
  changes: string;
}

const AuditTrail = () => {
  const [data, setData] = useState<AuditTrailData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<AuditTrailData | null>(null);

  const employeeObj = PermissionManager.EmployeeObj();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/AuditTrail`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData: AuditTrailData[] = await response.json();
      setData(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleViewClick = (row: AuditTrailData) => {
    setSelectedRow(row);
    console.log(row);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "#", flex: 0.1, editable: false },
    {
      field: "tableName",
      headerName: "Table Name",
      flex: 0.5,
      editable: false,
    },
    { field: "action", headerName: "Action", flex: 0.5, editable: false },
    { field: "userId", headerName: "User Id", flex: 1, editable: false },
    {
      field: "timestamp",
      headerName: "Time Stamp",
      flex: 1.5,
      editable: false,
    },
    { field: "changes", headerName: "Changes", flex: 1.5, editable: false },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div className="space-x-4">
          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() => handleViewClick(params.row as AuditTrailData)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex gap-40">
        <div>
          <div className="text-2xl text-neutral-800 font-bold mt-2">
            Audit Trails
          </div>
          <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
            <span className="opacity-60">Dashboard</span>
            <span className="opacity-60">/</span>
            <span>Audit Trails</span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            className="mb-4"
          />
        </Box>
        <DataGrid
          slots={
            !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? null : { toolbar: GridToolbar }
          }
          rows={filteredData}
          columns={columns}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#EDEDED",
              ".MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
            },
          }}
        />
      </div>
      <Dialog open={openModal} onClose={handleClose}>
        <DialogTitle>Audit Trail Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRow && (
              <>
                <div className="flex">
                  <p className=" font-bold px-2">Table Name: </p>
                  {selectedRow.tableName}
                </div>
                <div className="flex">
                  <p className=" font-bold px-2">Action: </p>{" "}
                  {selectedRow.action}
                </div>
                <div className="flex">
                  <p className=" font-bold px-2">User ID: </p>{" "}
                  {selectedRow.userId}
                </div>
                <div className="flex">
                  <p className=" font-bold px-2">Timestamp: </p>{" "}
                  {selectedRow.timestamp}
                </div>
                <div className="flex text-wrap">
                  <p className=" font-bold px-2">Changes: </p>{" "}
                  {selectedRow.changes}
                </div>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuditTrail;
