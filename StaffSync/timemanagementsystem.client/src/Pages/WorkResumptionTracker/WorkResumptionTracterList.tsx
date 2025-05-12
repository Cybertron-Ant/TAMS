import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridDeleteIcon,
  GridActionsCellItem,
  GridSearchIcon,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Modal,
  InputAdornment,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  AddCircleOutlineOutlined,
  CloudSyncOutlined,
  Visibility,
} from "@mui/icons-material";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { useDropzone } from "react-dropzone";
import WorkResumptionTrackerFrom from "./WorkResumptionTrackerFrom";
import PermissionManager from "../../app/PermissionManager ";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: { departmentId: number; name: string };
  positionCode: { positionCodeId: number; name: string };
}

interface UploadResult {
  success: boolean;
  link?: string;
}

const WorkResumptionTracker: React.FC = () => {
  const [trackers, setTrackers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchTrackers();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data: Employee[] = await response.json();
      setAllEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchTrackers = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/WorkResumptionTrackers`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setTrackers(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setFormData({}); // Reset form data on close
  };

  const handleOpenEditModal = async (id: number, employeeCode: string) => {
    try {
      setOpenModal(true); // Open the modal first
      const selectedTracker = trackers.find((tracker) => tracker.wrtId === id);

      // Set form data
      setFormData(selectedTracker);
    } catch (error) {
      console.error("Error opening edit modal:", error);
    }
  };

  const handleEditClick = async (id: number, employeeCode: string) => {
    try {
      // Close modal
      setOpenModal(false);

      // Send PUT request
      await fetchWithAuth(
        `${API_URL}/WorkResumptionTrackers/${employeeCode}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Fetch updated list of trackers
      fetchTrackers();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleCreateClick = async (employeeCode: string) => {
    try {
      // Validate form data before sending
      if (!formData.employeeCode) {
        throw new Error("Employee code is required.");
      }

      // Send POST request to add new tracker
      const response = await fetchWithAuth(
        `${API_URL}/WorkResumptionTrackers/${employeeCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Check if request was successful (status code 2xx)
      if (!response.ok) {
        throw new Error("Failed to add new tracker.");
      }

      // Close modal and fetch updated list of trackers
      setOpenModal(false);
      fetchTrackers();
    } catch (error) {
      console.error("Error Saving data:", error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      console.log(formData.wrtId);
      console.log(formData.wrtId);
      if (formData.wrtId) {
        // Edit existing tracker
        await handleEditClick(formData.wrtId, formData.employeeCode);
      } else {
        // Create new tracker
        await handleCreateClick(formData.employeeCode);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDeleteClick = async (id: number) => {
    setDeleteId(id);
    setDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetchWithAuth(`${API_URL}/WorkResumptionTrackers/${deleteId}`, {
        method: "DELETE",
      });
      fetchTrackers();
      // Update the state to remove the deleted row
      setTrackers(trackers.filter((row) => row.wrtId !== deleteId));
      setDeleteConfirmation(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = trackers.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleCancelDelete = () => {
    setDeleteConfirmation(false);
    setDeleteId(null);
  };

  const handleViewClick = async (employeeCode: string, id: number) => {
    try {
      await fetchWithAuth(
        `${API_URL}/WorkResumptionTrackers/${employeeCode}/${id}`,
        {
          method: "GET",
        }
      );
      navigate(`/WorkResumptionTracter/${employeeCode}/${id}`);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // const handleFileChange = (acceptedFiles: File[]) => {
  //   setFiles(acceptedFiles); // Handle multiple files
  //   // For demonstration, set uploadProgress to 60
  //   setUploadProgress(60);
  // };

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop: handleFileChange,
  //   accept: {
  //     "image/jpeg": [],
  //     "application/pdf": [],
  //   },
  //   multiple: true, // Enable multiple file uploads
  // });

  const uploadFiles = async (files: File[]): Promise<UploadResult> => {
    // Simulate file upload with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockLink = "https://example.com/uploaded-file.pdf";
        resolve({ success: true, link: mockLink });
      }, 1000); // Simulate upload delay
    });
  };

  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setIsOffline(event.target.checked);
  //   if (!event.target.checked) {
  //     setFiles([]);
  //     setUploadProgress(0);
  //   }
  // };

  // const handleRemoveFile = (fileName: string) => {
  //   setFiles(files.filter((file) => file.name !== fileName));
  //   if (files.length <= 1) {
  //     setUploadProgress(0);
  //   }
  // };

  const columns: GridColDef[] = [
    { field: "wrtId", headerName: "ID", flex: 0.1 },
    { field: "employeeCode", headerName: "Employee Code", flex: 1.5 },
    { field: "entryDate", headerName: "Entry Date", flex: 1 },
    { field: "dateOfAbsences", headerName: "Date Of Absences", flex: 1 },
    { field: "dateSent", headerName: "Date Sent", flex: 1 },
    { field: "adminHearingDate", headerName: "Admin Hearing Date", flex: 1 },
    { field: "fileLink", headerName: "File", flex: 1 },
    { field: "finalDecision", headerName: "Final Decision", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div className=" space-x-4">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() =>
              handleOpenEditModal(params.row.wrtId, params.row.employeeCode)
            }
          />

          <GridActionsCellItem
            icon={<GridDeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(params.row.wrtId)}
          />

          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() =>
              handleViewClick(params.row.employeeCode, params.row.wrtId)
            }
          />
        </div>
      ),
    },
  ];

  const getRowId = (row: any) => row.wrtId;

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Update the state based on the input field name
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleEmployeeChange = (event: SelectChangeEvent) => {
    const employeeCode = event.target.value;
    setSelectedEmployee(employeeCode); // Keep track of the selected employee code for display

    // Set the selected employee's department and position as current in the form
    const selectedEmployee = allEmployees.find(
      (e) => e.employeeCode === employeeCode
    );
    if (selectedEmployee) {
      // Update formData with the employeeCode and current department/position IDs for submission
      setFormData((prev: any) => ({
        ...prev,
        employeeCode: employeeCode,
      }));
    }
  };

  const EmployeeObj = PermissionManager.EmployeeObj();


  return (
    <div>
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="m-10"
      >
        <div className="modal-content bg-white p-10 m-4">
          <h2
            id="modal-title"
            className="text-2xl text-neutral-800 font-bold mt-2"
          >
            {formData.wrtId
              ? "Edit Work Resumption Tracker"
              : "Create Work Resumption Tracker"}
          </h2>
          <p>{formData.entryDate ? `Created ${formData.entryDate}` : ""}</p>
          <form className="grid grid-cols-3 gap-4">
            {/* <div className="flex flex-col">
              <InputLabel htmlFor="employeeCode">Employee Code</InputLabel>
              <TextField
              required
                id="employeeCode"
                name="employeeCode"
                value={formData.employeeCode || ""}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
              />
            </div> */}

            <FormControl>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={selectedEmployee}
              label="Select Employee"
              onChange={handleEmployeeChange}
            >
              {allEmployees.map((employee) => (
                <MenuItem
                  key={employee.employeeCode}
                  value={employee.employeeCode}
                >
                  {employee.firstName} {employee.lastName}
                </MenuItem>
              ))}
            </Select>
            </FormControl>

            <FormControl className="flex flex-col">
              <InputLabel htmlFor="dateOfAbsences">Date Of Absences</InputLabel>
              <TextField
                type="date"
                id="dateOfAbsences"
                name="dateOfAbsences"
                value={formData.dateOfAbsences || ""}
                onChange={handleFormChange}
                required
                margin="normal"
                fullWidth
              />
            </FormControl>

            <FormControl className="flex flex-col">
              <InputLabel htmlFor="adminHearingDate">
                Admin Hearing Date
              </InputLabel>
              <TextField
                type="date"
                id="adminHearingDate"
                name="adminHearingDate"
                value={formData.adminHearingDate || ""}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
              />
            </FormControl>

            <FormControl className="flex flex-col">
              <InputLabel htmlFor="fileLink">File Link</InputLabel>
              <TextField
                id="fileLink"
                name="fileLink"
                value={formData.fileLink || ""}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
              />
            </FormControl>

            <FormControl className="flex flex-col">
              <InputLabel htmlFor="finalDecision">Final Decision</InputLabel>
              <TextField
                id="finalDecision"
                name="finalDecision"
                value={formData.finalDecision || ""}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
              />
            </FormControl>
          </form>

          <FormControl className="gap-4">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              color="primary"
            >
              {formData.wrtId ? "Update" : "Save"}
            </Button>
          </FormControl>
        </div>
      </Modal>

      <Dialog
        open={deleteConfirmation}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className=" text-xl font-bold">
          {"Delete Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Work Resumption Tracker List
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Work Resumption Tracker List</span>
        </div>
      </div>
      <div className=" p-4 bg-white flex flex-col">
        <div className=" flex justify-between align-middle p-4">
          <TextField
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search…"
            size="small"
            sx={{ width: 300 }} // Adjust the width as needed
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GridSearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlined />}
            sx={{
              backgroundColor: "#FFCD29", // Custom color
              color: "black", // Adjust text color as needed for contrast
              "&:hover": {
                backgroundColor: "#e6b822", // Darker shade for hover state
              },
            }}
            onClick={handleOpen}
          >
            Add Tracker
          </Button>
        </div>
        <DataGrid
          slots={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? null : { toolbar: GridToolbar }}
          rows={filteredData}
          columns={columns}
          checkboxSelection
          getRowId={getRowId}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#EDEDED",
              ".MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold", // Example to further style the header titles
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default WorkResumptionTracker;
