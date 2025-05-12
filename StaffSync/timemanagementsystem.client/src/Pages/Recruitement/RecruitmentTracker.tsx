import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { formatDate } from "../../app/utils";
import RecruitmentForm from "./RecruitmentForm";
import RecruitmentDetail from "./components/RecruitmentDetail";
import IRecruitmentTracker from "./interfaces/IRecruitmentTracker";
import { useNavigate } from "react-router-dom";
import PermissionManager from "../../app/PermissionManager ";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

const RecruitmentTracker: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<IRecruitmentTracker | null>(null);
  const [recruitmentRecords, setRecruitmentRecords] = useState<
    IRecruitmentTracker[]
  >([]);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();
  const columns = [
    { field: "id", headerName: "ID", width: 40 },
    {
      field: "candidate",
      headerName: "Candidate",
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>{`${params.row.firstName} ${params.row.lastName}`}</Typography>
        </Box>
      ),
    },
    {
      field: "dateApplied",
      headerName: "Date Applied",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.dateApplied
          ? formatDate(params.row.dateApplied as string)
          : "N/A",
    },
    { field: "source", headerName: "Source", flex: 1 },
    {
      field: "dateInvited",
      headerName: "Date Invited",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.dateInvited
          ? formatDate(params.row.dateInvited as string)
          : "N/A",
    },
    {
      field: "interviewDate",
      headerName: "Interview Date",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.interviewDate
          ? formatDate(params.row.interviewDate as string)
          : "N/A",
    },
    {
      field: "initialInterviewer",
      headerName: "Initial Interviewer",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.initialInterviewer
          ? params.row.initialInterviewer.firstName
          : "N/A",
    },
    {
      field: "candidateScore",
      headerName: "Candidate Score",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.candidateScore
          ? params.row.candidateScore
          : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 200,
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.id.toString())}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id.toString())}
        />,
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View More Details"
          onClick={() => handleViewDetails(params.id.toString())}
        />,
      ],
    },
  ];

  const handleSearchChange = (event: any) => {
    setSearchText(event.target.value);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    fetchRecruitmentTrackers();
  };

  const handleEdit = (recordId: string) => {
    const record = recruitmentRecords.find(
      (record: IRecruitmentTracker) => record.id == recordId
    );
    setSelectedRecord(record || null);
    setOpenModal(true);
  };

  const handleViewDetails = (recordId: string) => {
    navigate(`/recruitment/${recordId}`);
  };

  const handleDelete = (recordId: string) => {
    const record = recruitmentRecords.find(
      (record: IRecruitmentTracker) => record.id == recordId
    );

    setSelectedRecord(record || null);
    setOpenDeleteModal(true);
  };

  const deleteRecord = async (recordId?: string) => {
    if (recordId == undefined || recordId == "" || recordId == "0")
      throw new Error("No ID was selected");

    try {
      const response = await fetchWithAuth(
        `${API_URL}/RecruitmentTrackers/${recordId}`,
        { method: "DELETE" }
      );

      // If we encounter and error while deleting
      if (!response.ok) {
        throw new Error("Failed to delete leave");
      }

      // Send success  notification
      toast.success("Recruitment record deleted successfully!");

      // Refresh the list or navigate as needed
      fetchRecruitmentTrackers();
    } catch (error: any) {
      toast.error("We encountered and error while deleting this record.");
      console.error("Error deleting Recruitment record:", error);
    } finally {
      // Close modal
      setOpenDeleteModal(false);
    }
  };

  const filteredRows = recruitmentRecords.filter(
    (row: IRecruitmentTracker) =>
      row?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const fetchRecruitmentTrackers = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/RecruitmentTrackers`);
      if (!response.ok) throw new Error("Failed to fetch recruitment records");
      const data = await response.json();
      // Assuming each item in the returned array matches the recruitment record structure
      setRecruitmentRecords(data);
    } catch (error) {
      console.error("Error fetching recruitment records:", error);
    }
  };

  useEffect(() => {
    fetchRecruitmentTrackers();
  }, []);

  const EmployeeObj = PermissionManager.EmployeeObj();

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Recruitment Tracker
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Recruitment Tracker</span>
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
            sx={{ width: 300 }} // Adjust the width as needed
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedRecord(null); // Prepare for adding a new entry
              setOpenModal(true);
            }}
          >
            Add New Entry
          </Button>
        </Box>

        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            slots={
              !hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.SrOperationsManager,
                Roles.HRManagerAdmin,
              ]) ? null : { toolbar: GridToolbar }
            }
            rows={filteredRows}
            columns={columns}
            checkboxSelection
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#EDEDED",
                ".MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
              },
            }}
          />
        </Box>

        {/* Add / Edit Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal mx-auto"
        >
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
            }}
          >
            {selectedRecord?.id == undefined ? (
              <h1 id="modal-title" className="font-semibold px-4">
                Add Recruitment Record
              </h1>
            ) : (
              <h1 id="modal-title" className="font-semibold px-4">
                Update Recruitment Record
              </h1>
            )}
            {/* Assuming RecruitmentForm is a component that handles form inputs */}
            {/* Pass `null` for new entries, an object for edits */}
            <RecruitmentForm
              record={selectedRecord}
              onClose={handleCloseModal}
            />
          </Box>
        </Modal>

        {/* Details Modal */}
        <Modal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal mx-auto"
        >
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 3,
            }}
          >
            <RecruitmentDetail
              recordId={selectedRecord?.id}
              onClose={() => setOpenDetailModal(false)}
            />
          </Box>
        </Modal>

        {/* Delete Modal */}
        <Dialog open={openDeleteModal}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete{" "}
            <strong style={{ wordWrap: "break-word" }}>
              {selectedRecord?.firstName}'s
            </strong>{" "}
            application?
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                deleteRecord(selectedRecord?.id);
              }}
              color="error"
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default RecruitmentTracker;
