import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbar,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import { Box, Button, TextField, Modal, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";
import MoveEmployeeForm from "./MoveEmployee";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoveDetails from "./MoveDetails";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import PermissionManager from "../../app/PermissionManager ";
import Roles from "../../enums/Roles";
import { hasRoles } from "../../app/roleManager";

interface EmployeeMove {
  id: number;
  employeeCode: string;
  entryDate: string;
  dateHired: string;
  status: string;
  reason: string;
  effectiveDate: string;
  decision: string;
  firstName: string;
  lastName: string;
  currentDepartmentId: number;
  newDepartmentId: number;
  currentDepartmentName: string;
  newDepartmentName: string;
  currentPositionId: number;
  newPositionId: number;
  currentPositionTitle: string;
  newPositionTitle: string;
  department: { departmentId: number; name: string }; // Optional if not always present
  positionCode: { positionCodeId: number; name: string }; // Optional if not always present
}

interface ManageMoveProps {
  employeeCode?: string;
}

const ManageMove: React.FC<ManageMoveProps> = ({ employeeCode }) => {
  const [employeeMoves, setEmployeeMoves] = useState<EmployeeMove[]>([]);
  const [selectedMove, setSelectedMove] = useState<EmployeeMove | null>(null);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openMoveModal, setOpenMoveModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const employeeObj = PermissionManager.EmployeeObj();

  useEffect(() => {
    const fetchEmployeeMoves = async () => {
      let url = `${API_URL}/SuspendedPullOutFloatings`;
      if (employeeCode) {
        url += `/History/${employeeCode}`;
      }
      try {
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error("Failed to fetch employee moves");
        const data: EmployeeMove[] = await response.json();
        setEmployeeMoves(data);
      } catch (error) {
        console.error("Error fetching employee moves:", error);
      }
    };

    fetchEmployeeMoves();
  }, []);

  const handleEdit = (move: EmployeeMove) => {
    console.log("Editing:", move); // Check what move is being edited
    setSelectedMove(move);
    setOpenEditModal(true);
  };

  const handleDelete = (id: number) => {
    // Implement the delete functionality
    console.log("Delete:", id);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleCloseMoveModal = () => {
    setOpenMoveModal(false);
  };

  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "Employee Code", width: 120 },
    { field: "firstName", headerName: "First Name", width: 130 },
    { field: "lastName", headerName: "Last Name", width: 130 },
    {
      field: "currentDepartmentName",
      headerName: "Current Department",
      width: 180,
    },
    { field: "newDepartmentName", headerName: "New Department", width: 180 },
    {
      field: "currentPositionTitle",
      headerName: "Current Position",
      width: 160,
    },
    { field: "newPositionTitle", headerName: "New Position", width: 160 },
    { field: "decision", headerName: "Decision", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          {/* <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
          />
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
          /> */}
          {/* {!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? (
            ""
          ) : (
            <div>
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEdit(params.row)}
              />
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDelete(params.row.id)}
              />
            </div>
          )} */}

          <div>
            <GridActionsCellItem
              icon={<VisibilityIcon />}
              label="View Details"
              onClick={() => {
                setSelectedMove(params.row);
                setOpenViewModal(true);
              }}
            />
          </div>
        </>
      ),
    },
  ];

  const filteredRows = employeeMoves.filter(
    (move) =>
      move.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      move.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      move.currentDepartmentName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      move.newDepartmentName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Move Employee Mangement
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Move Employee</span>
        </div>
      </div>

      <div className="p-4 bg-white h-full flex flex-col rounded-md">
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
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name or department…"
            size="small"
            style={{ marginBottom: 16, width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1, // Adjust the gap between buttons as needed
            }}
          >
            {!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? (
              ""
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineRoundedIcon />}
                onClick={() => setOpenMoveModal(true)} // Adjust handler as needed
              >
                Move Employee
              </Button>
            )}
          </Box>
        </Box>

        {/* <Modal
            open={openEditModal}
            aria-labelledby="edit-modal-title"
            onClose={handleCloseEditModal}
            aria-describedby="modal-description"
            className="modal m-10"
          >
            <div className="modal-content bg-white p-10">
              <h2 id="modal-title">Move Employee</h2>
              {selectedMove && (
                <MoveEmployeeForm
                  moveData={selectedMove}
                  onClose={handleCloseEditModal}
                />
              )}
            </div>
          </Modal> */}

        <Modal
          open={openViewModal}
          onClose={() => setOpenViewModal(false)}
          aria-labelledby="view-modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            {selectedMove && (
              <MoveDetails
                moveData={selectedMove}
                onClose={() => setOpenViewModal(false)}
              />
            )}
          </div>
        </Modal>

        <Modal
          open={openMoveModal}
          aria-labelledby="modal-title"
          onClose={handleCloseMoveModal}
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <h2 id="modal-title">Move Employee Form</h2>
            <MoveEmployeeForm onClose={handleCloseMoveModal} />
          </div>
        </Modal>

        <DataGrid
          slots={
            !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? null : { toolbar: GridToolbar }
          }
          rows={filteredRows}
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
      </div>
    </>
  );
};

export default ManageMove;
