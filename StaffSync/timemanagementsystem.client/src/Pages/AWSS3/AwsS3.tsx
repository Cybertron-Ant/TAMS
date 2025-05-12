import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, InputAdornment, TextField } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridSortModel } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { formatBytes, formatDate } from "../../app/utils";
import IAWSResource from "./IAWSResource";

const AWSS3: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [awsResources, setAwsResources] = useState<IAWSResource[]>([]);
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "lastModified", // Field to sort by
      sort: "asc", // 'asc' for ascending, 'desc' for descending
    },
  ]);

  const columns = [
    { field: "id", headerName: "ID", width: 40 },
    {
      field: "previewUrl",
      headerName: "Preview Url",
      flex: 3,
      renderCell: (params: any) => (
        <a
          href={params.row.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.row.previewUrl}
        </a>
      ),
    },
    {
      field: "size",
      headerName: "Size",
      flex: 1,
      valueGetter: (params) => formatBytes(params.row.size),
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
      valueGetter: (params: any) =>
        formatDate(params.row.lastModified as string, { includeTime: true }),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      flex: 2,
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View More Details"
          onClick={() => handleViewDetails(params.row.fileName)}
        />,
      ],
    },
  ];

  const handleSearchChange = (event: any) => {
    setSearchText(event.target.value);
  };

  const handleViewDetails = (fileName: string) => {
    navigate(`/aws-s3/${fileName}`);
  };

  const filteredRows = awsResources.filter(
    (row: IAWSResource) =>
      row?.lastModified.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.previewUrl.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.size.toString().toLowerCase().includes(searchText.toLowerCase())
  );

  const fetchAWSResources = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/S3`);
      if (!response.ok) throw new Error("Failed to fetch s3 records");
      const data = await response.json();
      // Assuming each item in the returned array matches the s3 record structure
      setAwsResources(data);
    } catch (error) {
      console.error("Error fetching s3 records:", error);
    }
  };

  useEffect(() => {
    fetchAWSResources();
  }, []);

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          AWS S3 Manager
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>AWS S3 Manager</span>
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
        </Box>

        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            getRowId={(row) => row.fileName}
            columns={columns}
            checkboxSelection
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
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
      </div>
    </>
  );
};

export default AWSS3;
