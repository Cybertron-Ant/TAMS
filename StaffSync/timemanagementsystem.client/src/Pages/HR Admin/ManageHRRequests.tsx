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
import { Box, Button, InputAdornment, TextField } from "@mui/material";
import { fetchWithAuth } from "../../app/fetchWrapper"; // Ensure correct import path
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import PermissionManager from "../../app/PermissionManager ";
import Visibility from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";
type HRRequest = {
  id: number;
  typeHRRequestId: number;
  docLink: string | null;
  requestDate: string;
  sentDocDate: string | null;
  employeeCode: string;
  typeHRRequest: {
    id: number;
    type: string;
  };
};

interface HRRequestProps {
  employeeCode?: string;
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ManageHRRequests: React.FC<HRRequestProps> = ({ employeeCode }) => {
  const [hrRequests, setHRRequests] = useState<HRRequest[]>([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const location = useLocation();
  const employee = PermissionManager.EmployeeObj();

  useEffect(() => {
    const fetchHRRequests = async () => {
      try {
        let url = `${API_URL}/HRRequest/List/${employee.employeeCode}`;
        if (employeeCode && hasRoles([Roles.Employee])) {
          url = `${API_URL}/HRRequest/employee/${employeeCode}`;
        }
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error("Failed to fetch HR Requests");

        const data = await response.json();
        const mappedData = data.map((item) => ({
          ...item,
          typeHRRequestId: item.typeHRRequestId,
          docLink: item.docLink,
          requestDate: item.requestDate,
          sentDocDate: item.sentDocDate,
          employeeCode: item.employeeCode,
          typeHRRequest: {
            id: item.typeHRRequest.id,
            type: item.typeHRRequest.type,
          },
        }));

        setHRRequests(mappedData);
      } catch (error) {
        console.error("Error fetching HR Requests:", error);
      }
    };

    fetchHRRequests();
  }, [employeeCode]);

  const handleDelete = (id: number) => {
    // Implement delete functionality here
    console.log("Delete:", id);
  };

  const handleEdit = (id: number) => {
    const requestToEdit = hrRequests.find((request) => request.id === id);
    navigate("/edit-hr-request", { state: { request: requestToEdit } });
  };

  const handleView = (id: number) => {
    const requestToView = hrRequests.find((request) => request.id === id);
    console.log(requestToView);
    if (requestToView) {
      navigate("/view-hr-request", { state: { request: requestToView } });
    } else {
      toast.error("Request not found.");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "type",
      headerName: "Request Type",
      flex: 1,
      valueGetter: (params) => params.row.typeHRRequest?.type || "",
    },
    // {
    //   field: "fullName",
    //   headerName: "Full Name",
    //   flex: 1,
    //   renderCell: (params) => (
    //     <p>{params.row.firstName} {params.row.lastName}</p>
    //   ),
    // },
    {
      field: "employeeCode",
      headerName: "Employee Code",
      flex: 1,
    },
    {
      field: "docLink",
      headerName: "Document Link",
      flex: 1,
      renderCell: (params) => (
        <a href={params.row.docLink}>{params.row.docLink}</a>
      ),
    },
    {
      field: "requestDate",
      headerName: "Request Date",
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: "sentDocDate",
      headerName: "Document Sent Date",
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          {hasRoles([
            Roles.SuperAdmin,
            Roles.SrOperationsManager,
            Roles.HRMSAdmin,
            Roles.HRManagerAdmin,
          ]) && (
            <div>
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEdit(Number(params.id))}
              />
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDelete(Number(params.id))}
              />
            </div>
          )}

          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() => handleView(params.id as number)}
          />
        </>
      ),
    },
  ];

  const employeeObj = PermissionManager.EmployeeObj();

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Manage HR Requests
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>HR Request</span>
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
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => {
              setSelectedRecord(null); // Prepare for adding a new entry
              setOpenModal(true);
            }}
          >
            Add New Entry
          </Button> */}
        </Box>
        <DataGrid
          slots={
            !hasRoles([
              Roles.SuperAdmin,
              Roles.SrOperationsManager,
              Roles.HRMSAdmin,
              Roles.HRManagerAdmin,
            ])
              ? null
              : { toolbar: GridToolbar }
          }
          rows={hrRequests}
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

export default ManageHRRequests;
