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
import BlockIcon from "@mui/icons-material/Block"; // Assuming use for the 'Disable' action
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";
import Register from "../../AuthPages/Register";
import { Employee } from "../../interfaces/Employee";
import PermissionManager from "../../app/PermissionManager ";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";
import { Pagination } from "../../interfaces/pagination";

const Users = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isActive, setisActive] = useState<boolean>(true);
  const [openEditEmployeeModal, SetEditEmployeeModal] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [employee, setEmployee] = useState<Employee>();
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoader, setTableLoader] = useState(false);
  const navigate = useNavigate();
  const EmployeeObj: Employee = PermissionManager.EmployeeObj();

  const API_URL = import.meta.env.VITE_TMS_PROD;

  const fetchAllEmployeesWithRoles = () => {
    setTableLoader(true);
    fetchWithAuth(`${API_URL}/Employees/paginated?pageNumber=${currentPage}&pageSize=${pageSize}`)
      .then((response) => response.json() as Promise<Pagination<Employee[]>>)
      .then((data) => {
        setTotalRecords(data.totalRecords);
        setPageSize(data.pageSize);
        setCurrentPage(data.currentPage);
        setEmployees(data.results)
      })
      .catch((error) => console.error("Error fetching data: ", error)).finally(()=> setTableLoader(false));
  };

  const fetchAllArchivedEmployeesWithRoles = () => {
    fetchWithAuth(`${API_URL}/Employees/GetArchived`)
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching data: ", error));
  };
  useEffect(() => {
    fetchAllEmployeesWithRoles()
  }, [isActive, currentPage, pageSize]);

  const handleViewProfile = (employeeCode: string) => {
    navigate(`/employeeProfile/${employeeCode}`); // Adjust the route as needed
  };

  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "Employee Code", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    // { field: "email", headerName: "Email", flex: 1.5 },
    { field: "role", headerName: "Role", flex: 1.5 },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      valueGetter: (params) => params.row.department.name,
    },
    {
      field: "positionCodeName", // Use "positionCodeName" directly from your data
      headerName: "Position",
      flex: 1,
      valueGetter: (params) => params.row.positionCode.name,
    },
    {
      field: "team", // Use "positionCodeName" directly from your data
      headerName: "Team",
      flex: 1,
      valueGetter: (params) => params.row.team.name,
    },
    {
      field: "active",
      headerName: "Status",
      flex: 1,
      valueGetter: (params) => (params.row.active ? "Active" : "Inactive"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      renderCell: (params) => (
        <>
          {hasRoles([
            Roles.SuperAdmin,
            Roles.HRMSAdmin,
            Roles.HRManagerAdmin,
            Roles.SrOperationsManager,
          ]) ||
          EmployeeObj.positionCode?.name
            ?.toLowerCase()
            .includes("senior hr specialist") ? (
            <Tooltip title="Edit">
              <IconButton
                onClick={() => handleEdit(params.row)}
                className="text-blue-500 hover:text-blue-700"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <></>
          )}

          {/* Employee delete feature */}
          {/* <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(params.row.employeeCode)}
              className="text-red-500 hover:text-red-700"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="View Profile">
            <IconButton
              onClick={() => handleViewProfile(params.row.employeeCode)}
              className="text-green-500 hover:text-green-700"
            >
              <HealthAndSafetyIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  // Handlers for actions
  const handleEdit = (employee: Employee) => {
    /* Implement edit functionality */
    setEmployee(employee);
    SetEditEmployeeModal(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);

  const filteredRows = employees
    .map((employee, index) => ({ ...employee, id: index }))
    .filter((row) => {
      return (
        row.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.employeeCode.toLowerCase().includes(searchText.toLowerCase()) ||
        row.email.toLowerCase().includes(searchText.toLowerCase()) ||
        row.positionCode.name
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        row.status.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.team.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.role.toLowerCase().includes(searchText.toLowerCase()) ||
        row.department.name.toLowerCase().includes(searchText.toLowerCase())
      );
    });

  return (
    <>
      <div className="mb-4 ">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Employee Management
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Employee</span>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col h-full rounded-md">
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
            Roles.HRManagerAdmin,
            Roles.SrOperationsManager
          ])?
          <Box
            sx={{
              display: "flex",
              gap: 1, // Adjust the gap between buttons as needed
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={() => setOpenModal(true)} // Adjust handler as needed
              sx={{
                backgroundColor: "#FFCD29", // Custom color
                color: "black", // Adjust text color as needed for contrast
                "&:hover": {
                  backgroundColor: "#e6b822", // Darker shade for hover state
                },
              }}
            >
              Add Employee
            </Button>
          </Box>
          : <></>}
        </Box>

        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <h2 id="modal-title">Add Employee </h2>
            <Register
              forModal={true}
              onClose={() => {
                setOpenModal(false);
                fetchAllEmployeesWithRoles();
              }}
            />
          </div>
        </Modal>
        <Modal
          open={openEditEmployeeModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <h2 id="modal-title">Edit Employee</h2>
            <Register
              record={employee}
              editMode={true}
              onClose={() => {
                SetEditEmployeeModal(false);
                fetchAllEmployeesWithRoles();
              }}
            />
          </div>
        </Modal>
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
            disableRowSelectionOnClick
            disableColumnFilter

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
            paginationMode="server"
            rowCount={totalRecords}

            pageSizeOptions={[ 10, 25, 50]}
            loading ={tableLoader}
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
          />
        </Box>
      </div>
    </>
  );
};

export default Users;
