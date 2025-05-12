import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ViewIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Modal,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PermissionManager from "../../app/PermissionManager ";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { formatDate } from "../../app/utils";
import DisciplinaryForm from "./DisciplinaryForm";
import { DisciplinaryTracker } from "./Disciplinary";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

interface DisciplinaryProps {
  employeeCode?: string; // Typing employeeCode as a string
}

const ManageDisciplinary: React.FC<DisciplinaryProps> = ({ employeeCode }) => {
  const [disciplinaryTrackers, setDisciplinaryTrackers] = useState<
    DisciplinaryTracker[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<DisciplinaryTracker | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const employeeObj = PermissionManager.EmployeeObj();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] =
    useState<DisciplinaryTracker | null>(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const employee = PermissionManager.EmployeeObj();

  const fetchDisciplinaryTrackers = async () => {
    let url = `${API_URL}/DisciplinaryTrackers/List/${employee.employeeCode}`;
    if (employeeCode) {
      url = `${API_URL}/DisciplinaryTrackers/${employeeCode}`;
    }

    try {
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        // Handle HTTP errors (e.g., not found, server errors)
        if (response.status === 404) {
          // If the response status is 404 (Not Found), it means no trackers were found for the user.
          // Instead of showing an error, we can simply set the disciplinary trackers to an empty array.
          setDisciplinaryTrackers([]);
        } else {
          // For other types of errors, you might still want to notify the user.
          throw new Error(
            "Failed to fetch disciplinary trackers due to server error"
          );
        }
      } else {
        const data: DisciplinaryTracker[] = await response.json();
        data.sort(
          (a, b) =>
            new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );
        setDisciplinaryTrackers(data);
      }
    } catch (error) {
      console.error("Error fetching disciplinary trackers:", error);
      // Here, you might decide not to show an error toast if the error is because no records were found.
      // You could log the error for debugging purposes or handle specific errors differently as needed.
    }
  };

  useEffect(() => {
    fetchDisciplinaryTrackers();
  }, [employeeCode, API_URL, fetchWithAuth]); // Ensure all dependencies are listed

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const filteredTrackers = disciplinaryTrackers.filter((tracker) => {
    const employeeCode = tracker.employeeCode?.toLowerCase() || ""; // Safely access with optional chaining and fallback to empty string
    const offenceCategory = tracker.offenceCategory?.toLowerCase() || ""; // Safely access with optional chaining and fallback to empty string
    const decision = tracker.decision?.toLowerCase() || ""; // Safely access with optional chaining and fallback to empty string
    const details = tracker.details?.toLowerCase() || ""; // Safely access with optional chaining and fallback to empty string

    return (
      employeeCode.includes(searchText.toLowerCase()) ||
      offenceCategory.includes(searchText.toLowerCase()) ||
      decision.includes(searchText.toLowerCase()) ||
      details.includes(searchText.toLowerCase())
    );
  });

  const handleEdit = async (record: DisciplinaryTracker) => {
    // Construct the URL to fetch details of the selected disciplinary tracker
    const url = `${API_URL}/DisciplinaryTrackers/${record.employeeCode}/${record.id}`;

    try {
      const response = await fetchWithAuth(url);
      if (response.ok) {
        const data = await response.json();
        setSelectedRecord(data); // Set the fetched data as the selected record
        setOpenModal(true); // Open the modal after setting the record
      } else {
        // Handle different response statuses appropriately
        toast.error("Failed to fetch details for the disciplinary tracker.");
      }
    } catch (error) {
      console.error("Error fetching disciplinary tracker details:", error);
      toast.error(
        "An error occurred while fetching disciplinary tracker details."
      );
    }
  };

  const handleDelete = async (record: DisciplinaryTracker) => {
    try {
      const url = `${API_URL}/DisciplinaryTrackers/${record.id}?employeeCode=${record.employeeCode}`;
      const response = await fetchWithAuth(url, {
        method: "DELETE",
      });

      if (response.ok) {
        setDisciplinaryTrackers(
          disciplinaryTrackers.filter((t) => t.id !== record.id)
        );
        toast.success("Disciplinary action deleted successfully.");
      } else {
        toast.error("Failed to delete disciplinary action.");
      }
    } catch (error) {
      console.error("Error deleting disciplinary action:", error);
      toast.error("Error deleting disciplinary action.");
    }
  };

  const DeleteConfirmationDialog = () => (
    <Dialog
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete this disciplinary record? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleDelete(recordToDelete!); // Ensure to handle nullability
            setOpenDeleteDialog(false);
          }}
          color="primary"
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "Employee Code", flex: 1 },
    {
      field: "entryDate",
      headerName: "Entry Date",
      flex: 1,
      valueFormatter: ({ value }) =>
        value == null ? "N/A" : formatDate(value),
    },
    {
      field: "nteDateSent",
      headerName: "NTE Date Sent",
      flex: 1,
      valueGetter: (params) => params.row.nte?.dateSent,
      valueFormatter: ({ value }) =>
        value == null ? "N/A" : formatDate(value),
    },
    {
      field: "occurrence",
      headerName: "Occurrence",
      flex: 1,
      valueGetter: (params) => params.row.occurrence,
    },
    {
      field: "nodDateSent",
      headerName: "NOD Date Sent",
      flex: 1,
      valueGetter: (params) => params.row.nod?.dateSent,
      valueFormatter: ({ value }) =>
        value == null ? "N/A" : formatDate(value),
    },
    {
      field: "decision",
      headerName: "Decision",
      flex: 1,
      valueGetter: (params) => params.row.decision ?? "",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
          />
          {hasRoles([
            Roles.SuperAdmin,
            Roles.HRMSAdmin,
            Roles.SrOperationsManager,
            Roles.HRManagerAdmin,
          ]) && (
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setRecordToDelete(params.row);
                setOpenDeleteDialog(true);
              }}
            />
          )}
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() =>
              navigate(
                `/viewdisciplinary/${params.row.employeeCode}/${params.id}`
              )
            }
          />
        </>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Disciplinary Management
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Disciplinary Actions Manager</span>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col rounded-md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search…"
            size="small"
            sx={{ width: 300 }} // Adjust the width as needed
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {hasRoles([
            Roles.SuperAdmin,
            Roles.HRMSAdmin,
            Roles.SrOperationsManager,
            Roles.HRManagerAdmin,
          ]) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={() => {
                setSelectedRecord(null); // Prepare for adding a new entry
                setOpenModal(true);
              }}
            >
              Add New Entry
            </Button>
          )}
        </Box>
        <DeleteConfirmationDialog />
        <Modal
          open={openModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <DisciplinaryForm
              onClose={() => {
                setOpenModal(false);
                // refresh list
                fetchDisciplinaryTrackers();
              }}
              disciplinaryRecord={selectedRecord}
            />
          </div>
        </Modal>
       
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            slots={
              hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.SrOperationsManager,
                Roles.HRManagerAdmin,
              ]) ?  { toolbar: GridToolbar } : null
            }
            rows={filteredTrackers}
            columns={columns}
            checkboxSelection
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#EDEDED",
                ".MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold", // Example to further style the header titles
                },
              },
            }}
          />
        </Box>
      </div>
    </>
  );
};

export default ManageDisciplinary;
