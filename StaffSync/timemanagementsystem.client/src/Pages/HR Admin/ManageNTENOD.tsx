import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { fetchWithAuth } from "../../app/fetchWrapper";
import PermissionManager from "../../app/PermissionManager ";
import Roles from "../../enums/Roles";
import { hasRoles } from "../../app/roleManager";

interface Notice {
  employeeCode: string;
  entryDate: string;
  dateSent: string;
  fileLink: string;
  remarks: string;
  id: number;
}

const NoticesTabs = () => {
  const [value, setValue] = useState<number>(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      const url =
        value === 0
          ? `${API_URL}/NoticeToExplain`
          : `${API_URL}/NoticeOfDecision`;

      try {
        const response = await fetchWithAuth(url);
        const data: Notice[] = await response.json();
        setNotices(data.map((notice, index) => ({ ...notice, id: index })));
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };

    fetchNotices();
  }, [value]); // Re-fetch notices when the tab changes

  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "Employee Code", width: 150 },
    { field: "entryDate", headerName: "Entry Date", width: 200 },
    { field: "dateSent", headerName: "Date Sent", width: 200 },
    { field: "fileLink", headerName: "File Link", width: 200 },
    { field: "remarks", headerName: "Remarks", width: 300 },
  ];

  const EmployeeObj = PermissionManager.EmployeeObj()

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Manage NTE NOD
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>NODNTE</span>
        </div>
      </div>
      <div className="bg-white w-full">
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="notice tabs"
            >
              <Tab label="Notice to Explain" />
              <Tab label="Notice of Decision" />
            </Tabs>
          </Box>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid slots={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? null : { toolbar: GridToolbar }} rows={notices} columns={columns} key={value} />{" "}
            {/* Change the key based on the selected tab */}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default NoticesTabs;
