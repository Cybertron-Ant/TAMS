import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "@mui/material/Modal";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  SelectChangeEvent,
  Tooltip,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Edit } from "@mui/icons-material";
import { fetchWithAuth } from "../../app/fetchWrapper";
import PermissionManager from "../../app/PermissionManager ";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

interface JobOffer {
  id: number;
  name: string;
  position: string;
  location: string;
  salary: number;
  status: string;
  interviewScore: number;
}

const initialFormData: Partial<JobOffer> = {
  name: "",
  position: "",
  location: "",
  salary: 0,
  status: "",
  interviewScore: 0,
};

const JobOfferTracker: React.FC = () => {
  const [data, setData] = useState<JobOffer[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<JobOffer>>(initialFormData);
  const [selectedRow, setSelectedRow] = useState<JobOffer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/JobOfferTrackers`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData: JobOffer[] = await response.json();
      setData(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(initialFormData);
    setSelectedRow(null);
  };

  const handleDeleteRow = async (id: number) => {
    try {
      await fetchWithAuth(`${API_URL}/JobOfferTrackers/${id}`, {
        method: "DELETE",
      });
      fetchData(); // Refresh data after successful delete
    } catch (error) {
      console.error("Error deleting job offer:", error);
    }
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      status: value,
    }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (selectedRow) {
        await fetchWithAuth(
          `${API_URL}/JobOfferTrackers/${selectedRow.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
      } else {
        await fetchWithAuth(`${API_URL}/JobOfferTrackers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error updating/adding job offer:", error);
    }
  };

  const handleOpenEditModal = (row: JobOffer) => {
    setSelectedRow(row);
    setFormData(row);
    setOpenModal(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderStatusCounts = () => {
    const statusData = [
      { name: "not sent", icon: <NotInterestedIcon /> },
      { name: "sent", icon: <SendIcon /> },
      { name: "negotiating", icon: <PeopleAltIcon /> },
      { name: "accepted", icon: <HandshakeIcon /> },
      { name: "rejected", icon: <ThumbDownIcon /> },
    ];
    const statusCounts: { [status: string]: number } = {};

    filteredData.forEach((row) => {
      // Ensure row.status is defined and corresponds to a valid index
      const index = parseInt(row.status);
      if (index >= 0 && index < statusData.length) {
        const statusName = statusData[index]?.name; // Use optional chaining to safely access name
        if (statusName) {
          // Check if statusName is defined
          statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
        }
      }
    });
    

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "1rem",
        }}
      >
        <div className="flex gap-4">
          {statusData.map((status, index) => (
            <Tooltip title={status.name}>
              <div
                key={index}
                className="flex justify-center gap-2 p-4 text-sm font-semibold text-white bg-blue-500 rounded"
              >
                {status.icon}
                <Typography variant="body1">{`${
                  statusCounts[status.name] || 0
                }`}</Typography>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "#", flex: 1, editable: false },
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "position", headerName: "Position", flex: 1, editable: true },
    { field: "location", headerName: "Location", flex: 1, editable: true },
    { field: "salary", headerName: "Salary", flex: 1, editable: true },
    { field: "status", headerName: "Status", flex: 1, editable: true },
    {
      field: "interviewScore",
      headerName: "Interview Score",
      width: 160,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div>
          <GridActionsCellItem
            label="Edit"
            icon={<Edit />}
            onClick={() => handleOpenEditModal(params.row as JobOffer)}
          >
            Edit
          </GridActionsCellItem>
          <GridActionsCellItem
            label="Delete"
            icon={<DeleteIcon />}
            onClick={() => handleDeleteRow(params.row.id as number)}
          >
            Delete
          </GridActionsCellItem>
          <span className="mx-4"></span>
        </div>
      ),
    },
  ];

  const EmployeeObj = PermissionManager.EmployeeObj();


  return (
    <>
      <div className="flex gap-40">
        <div>
          <div className="text-3xl text-neutral-800 font-bold mt-2">
            Job Offer Tracker
          </div>
          <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
            <span className="opacity-60">Dashboard</span>
            <span className="opacity-60">/</span>
            <span>Job Offer Tracker</span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col">
        <div className="flex justify-between ">
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        {renderStatusCounts()}

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFCD29", // Custom color
              color: "black", // Adjust text color as needed for contrast
              "&:hover": {
                backgroundColor: "#e6b822", // Darker shade for hover state
              },
            }}
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Add New Entry
          </Button>
        </div>

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10">
            <h2 id="modal-title">
              {selectedRow ? "Edit Job Offer" : "Add New Job Offer"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <Grid className="grid grid-cols-2 gap-2">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                margin="normal"
              />
              <TextField
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleFormChange}
                required
                margin="normal"
              />
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                margin="normal"
              />
              <TextField
                type="number"
                label="Salary"
                name="salary"
                value={formData.salary}
                onChange={handleFormChange}
                required
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="0">Not Sent</MenuItem>
                  <MenuItem value="1">Sent</MenuItem>
                  <MenuItem value="2">Negotiating</MenuItem>
                  <MenuItem value="3">Accepted</MenuItem>
                  <MenuItem value="4">Rejected</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                label="Interview Score"
                name="interviewScore"
                value={formData.interviewScore}
                onChange={handleFormChange}
                margin="normal"
              />
              </Grid>
              <div className="flex justify-end">
                <Button type="submit" variant="contained" color="primary">
                  {selectedRow ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
        <DataGrid
          slots={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? null : { toolbar: GridToolbar }}
          className="table"
          rows={filteredData}
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
          pagination
        />
      </div>
    </>
  );
};

export default JobOfferTracker;
