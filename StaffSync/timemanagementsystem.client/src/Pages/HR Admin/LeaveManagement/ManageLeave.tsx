import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Modal from "@mui/material/Modal";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApprovalStatusDropdown from "../../../Components/ApprovalStatusDropdown";
import ConfirmationModal from "../../../Components/ConfirmationModal";
import PermissionManager from "../../../app/PermissionManager ";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import { calculateDurationInDays, formatDateToPanamaDateHTML } from "../../../app/utils";
import LeaveDetail from "./LeaveDetail";
import LeaveForm from "./LeaveForm";
import ILeaveTracker from "./interfaces/ILeaveTracker";
import { hasRoles } from "../../../app/roleManager";
import Roles from "../../../enums/Roles";
import { useLocation } from "react-router-dom";
import { Pagination } from "../../../interfaces/pagination";
import { set } from "date-fns";
import moment from "moment-timezone";

interface ApprovalStatus {
  id: string;
  type: string;
}

interface ManageleaveProps {
  employeeCode?: string;
}

const ManageLeave: React.FC<ManageleaveProps> = ({ employeeCode }) => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const employee = PermissionManager.EmployeeObj();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [absenceRecords, setAbsenceRecords] = useState<ILeaveTracker[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ILeaveTracker | null>(
    null
  );
  const [allApprovalStatuses, setAllApprovalStatues] = useState<
    ApprovalStatus[]
  >([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const location = useLocation();

  const handleEdit = (recordId: string) => {
    // Make sure recordId is the actual 'id' from the JSON, not a custom-generated one
    const record = absenceRecords.find((record) => record.id === recordId);
    setSelectedRecord(record || null);
    setOpenModal(true);
  };

  const handleDelete = (recordId: string) => {
    // Open Modal
    setOpenDeleteModal(true);

    const record = absenceRecords.find((record) => record.id === recordId);
    setSelectedRecord(record || null);
  };

  const deleteLeave = async (recordId?: string) => {
    if (recordId == undefined || recordId === "")
      throw new Error("No ID was selected");

    try {
      const response = await fetchWithAuth(
        `${API_URL}/LeaveTrackers/${recordId}`,
        { method: "DELETE" }
      );

      // If we encounter and error while deleting
      if (!response.ok) {
        throw new Error("Failed to delete leave");
      }

      // Successful delete
      // Close modal
      setOpenDeleteModal(false);
      // Send notification
      toast.success("Leave deleted successfully!");

      fetchLeaveForms();
    } catch (error: any) {
      console.error("Error deleting leave:", error);
    }
  };

  const handleViewDocument = (id: string) => {
    setSelectedRecord({ ...selectedRecord, id } as any);
    setOpenDetailModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);

  const filteredRows = absenceRecords.filter((row) => {
    // Add a new property to each row to show the calculated leave duration in days
    row["duration"] =
      calculateDurationInDays(row.dateOfAbsence, row.expectedDateOfReturn) +
      " day(s)";
    return (
      row.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      row.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      row.reason.toLowerCase().includes(searchText.toLowerCase()) ||
      row.attendance.toLowerCase().includes(searchText.toLowerCase()) ||
      row.approvalStatus.toLowerCase().includes(searchText.toLowerCase())
    );
  });
  const fetchLeaveForms = async () => {
    const pathRegex = /^\/employeeProfile/;
    setTableLoader(true)
    // Check if the current pathname matches the pattern
    const isProfilePage = pathRegex.test(location.pathname);

    let url = `${API_URL}/LeaveTrackers/paginated?pageNumber=${currentPage}&pageSize=${pageSize}`;
    if (employeeCode && !hasRoles([Roles.Employee]) && isProfilePage) {
      url = `${API_URL}/LeaveTrackers/paginated?pageNumber=${currentPage}&pageSize=${pageSize}&employeeId=${employeeObj.userId}`;
    }

    try {

      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch leave forms. Status: ${response.status}`
        );
      }
      const data: Pagination<ILeaveTracker[]> = await response.json();

      // Using the index as part of a unique ID. Adjust as needed if you have a better unique identifier.
      const mappedData = data.results.map((item) => ({
        ...item,
        id: item.id.toString(),
        firstName: item.firstName,
        attendance: item.attendance,
        attendanceId: item.attendanceId,
        leaveBalance: item.leaveBalance,
        lastName: item.lastName,
        approvalStatusId: item.approvalStatusId,
        timeOfNotice: item.timeOfNotice,
        expectedReturnDate: item.expectedDateOfReturn,
      }));

      setCurrentPage(data.currentPage);
      setTotalRecords(data.totalRecords);
      setAbsenceRecords(mappedData);
    } catch (error) {
      console.error("There was an error fetching the leave forms:", error);
    } finally{
      setTableLoader(false)

    }
  };

  const fetchApprovalStatuses = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/ApprovalStatus`);
      if (!response.ok) throw new Error("Failed to fetch approval statuses");
      const data = await response.json();
      // Assuming each item in the returned array matches the approval status structure
      setAllApprovalStatues(data);
    } catch (error) {
      console.error("Error fetching approval statuses:", error);
    }
  };

  useEffect(() => {
    fetchApprovalStatuses();
    fetchLeaveForms();
  }, [employeeCode, openModal, pageSize, currentPage]); // Depend on employeeCode to refetch when it changes



  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "#",
      width: 50,
    },
    {
      field: "employee",
      headerName: "Employee",
      width: 250, // Adjusted width to accommodate both avatar and name
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={params.row.employeeImage}
            alt={`${params.row.firstName} ${params.row.lastName}`}
          />
          <Typography>{`${params.row.firstName} ${params.row.lastName}`}</Typography>
        </Box>
      ),
    },
    { field: "attendance", headerName: "Type", flex: 1 },
    { field: "leaveBalance", headerName: "Balance", flex: 1 },
    { field: "duration", headerName: "Duration", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 200, // Adjusted width to accommodate dropdown
      renderCell: (params: GridRenderCellParams<ILeaveTracker>) => {
        return (
          <div>
           {!hasRoles([Roles.SuperAdmin, Roles.HRManagerAdmin, Roles.ItManagerAdmin]) ? (
              `${params.row.approvalStatus}`
            ) : (
              <ApprovalStatusDropdown
                attendanceId={params.row.attendanceId}
                value={params.row.approvalStatusId}
                employeeCode={params.row.employeeCode}
                leaveId={params.id}
                shiftId={params.row.shiftId}
                reason={params.row.reason}
                dateOfAbsence={params.row.dateOfAbsence}
                expectedDateOfReturn={params.row.expectedDateOfReturn}
                allApprovalStatuses={allApprovalStatuses}
                onStatusChange={fetchLeaveForms}
              />
            )}
          </div>
        );
      },
    },
    {
      field: "timeOfNotice",
      headerName: "Time of Notice",
      flex: 1,
      valueFormatter: ({ value }) => moment.tz(value, "America/Panama").format("MMM DD, YYYY"),
    },
    {
      field: "dateOfAbsence",
      headerName: "Date of Absence",
      flex: 1,
      valueFormatter: ({ value }) => moment.tz(value, "America/Panama").format("MMM DD, YYYY"),
    },
    // {
    //   field: "expectedReturnDate",
    //   headerName: "Expected Return",
    //   flex: 1,
    //   valueFormatter: ({ value }) => formatDate(value),
    // },
    // {
    //   field: "reason",
    //   headerName: "Reason",
    //   flex: 1,
    // },
    { field: "shift", headerName: "Shift", flex: 1 },
    // {
    //   field: "submittedDocument",
    //   headerName: "Document Submitted",
    //   flex: 1,
    //   renderCell: (params) => (params.value ? "Yes" : "No"),
    // },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      getActions: (params: GridRowParams<ILeaveTracker>) => [
        <div className="flex">
          {params.row.approvalStatus.toLowerCase().includes("pending") &&
          employeeCode == PermissionManager.EmployeeObj().employeeCode || hasRoles([Roles.SuperAdmin, Roles.HRManagerAdmin, Roles.ItManagerAdmin]) ? (
            <div>
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEdit(params.id.toString())}
              />
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDelete(params.id.toString())}
              />
            </div>
          ) : null}

          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="View Document"
            onClick={() => handleViewDocument(params.id.toString())}
          />
        </div>,
      ],
    },
  ];

  const employeeObj = PermissionManager.EmployeeObj();

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Leave Mangement
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Leave Manager</span>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col rounded-md">
        {/* Flex container for the button, aligning it to the right */}
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
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {(employeeObj.role?.toLowerCase().includes("super admin") ||
            employeeObj.role?.toLowerCase().includes("hrms admin")) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={() => {
                setSelectedRecord(null);
                setOpenModal(true);
              }}
            >
              Add New Entry
            </Button>
          )}
        </Box>
        <Modal
          open={openModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <h2 id="modal-title">Employee Leave Request</h2>
            <LeaveForm
              record={selectedRecord} // Pass `null` for new entries, an object for edits
              onClose={handleCloseModal}
            />
          </div>
        </Modal>

        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            slots={
              !hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ])
                ? null
                : { toolbar: GridToolbar }
            }
            rows={filteredRows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick

            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#EDEDED",
                ".MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold", // Example to further style the header titles
                },
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: pageSize},  },
          }}
          rowCount={totalRecords}

          paginationMode="server"
          pageSizeOptions={[ 10, 15, 20]}
          
          onPaginationModelChange={(model, details)=>{
            if(pageSize != model.pageSize){
              setPageSize(model.pageSize );
              // setFilterForm({...filterForm, pageSize: model.pageSize})

            }
            // model.page is zero-based so since pageNumber should startAt '1' I will compare the updated page with the pageNumber with subtraction of 1
            if(currentPage -1  != model.page){
              setCurrentPage(model.page+1);
              // setFilterForm({...filterForm, pageNumber: model.page + 1})
            }
            
            // When the count changes I need to fetch records and update the form size.
          }}
          loading={tableLoader}
          disableColumnFilter
          />
        </Box>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          deleteLeave(selectedRecord?.id);
        }}
        confirmButtonText="Yes, Delete"
        confirmButtonColor="error"
        title="One last confirmation"
        content={
          <p>
            You are about to delete
            <strong> {selectedRecord?.firstName}'s</strong> Sick Leave for
            <strong> {formatDateToPanamaDateHTML(selectedRecord?.dateOfAbsence)}</strong>
          </p>
        }
      />

      {/* Leave Detail */}
      <Dialog open={openDetailModal} maxWidth="sm" fullWidth={true}>
        <DialogContent>
          <LeaveDetail leaveId={selectedRecord?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageLeave;
