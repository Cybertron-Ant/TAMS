import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Warning from "@mui/icons-material/Warning";
import AccessTime from "@mui/icons-material/AccessTime";
import { GridRowId } from "@mui/x-data-grid";
import { fetchWithAuth } from "../app/fetchWrapper";
import { toast } from "react-toastify";

interface Props {
  allApprovalStatuses: any[];
  leaveId: GridRowId;
  employeeCode: string;
  shiftId: string;
  reason: string;
  value: string;
  attendanceId: string;
  dateOfAbsence: string;
  expectedDateOfReturn: string;
  onStatusChange?: () => void;
}

const ApprovalStatusDropdown: React.FC<Props> = ({
  allApprovalStatuses,
  leaveId,
  employeeCode,
  shiftId,
  reason,
  attendanceId,
  value,
  dateOfAbsence,
  expectedDateOfReturn,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(value ?? "1");
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const updateLeaveStatus = async (
    leaveId: GridRowId,
    employeeCode: string,
    newStatus: string,
    shiftId: string,
    reason: string,
    attendanceId: string,
    dateOfAbsence: string,
    expectedDateOfReturn: string
  ) => {
    return await fetchWithAuth(
      `${API_URL}/LeaveTrackers/UpdateByEmployeeCode/${employeeCode}/${leaveId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId,
          reason,
          employeeCode,
          dateOfAbsence,
          expectedDateOfReturn,
          approvalStatusId: newStatus,
          attendanceId: attendanceId,
        }),
      }
    );
  };

  const handleChange = async (event: SelectChangeEvent) => {
    const selectedStatus = event.target.value;

    try {
      // Update Database
      const response = await updateLeaveStatus(
        leaveId,
        employeeCode,
        selectedStatus,
        shiftId,
        reason,
        attendanceId,
        dateOfAbsence,
        expectedDateOfReturn
      );

      if (!response.ok) {
        const responseText = await response.text();
        // send a notification from server side if bad request error
        toast.warning(responseText);
        throw new Error(`Failed to update leave status: ${response.status}`);
      }

      // Status update success
      toast.success("Leave status updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Update UI
      setSelectedStatus(selectedStatus);
    } catch (error: any) {
      console.error("Error updating leave status:", error);
    } finally {
      onStatusChange();
    }
  };

  useEffect(() => {
    const getLeaveStatus = async (leaveId: GridRowId) => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/LeaveTrackers/GetById/${leaveId}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to update leave status");
        }
        // Update UI
        setSelectedStatus(data.approvalStatusId);
      } catch (error: any) {
        console.error("Error updating leave status:", error);
      }
    };

    getLeaveStatus(leaveId);
  }, [selectedStatus]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ECECEC",
        borderRadius: "20px",
        padding: "4px 12px",
        height: "40px",
        overflow: "hidden",
      }}
    >
      <FormControl
        variant="outlined"
        sx={{
          m: 1,
          minWidth: 120,
          ".MuiOutlinedInput-notchedOutline": { border: "none" },
          ".MuiSelect-select": {
            paddingRight: "32px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderRadius: "20px!important",
          },
        }}
      >
        <Select
          labelId="status-select-label"
          id="status-select"
          value={selectedStatus}
          onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          size="small"
          sx={{
            borderRadius: "20px",
            "& .MuiSvgIcon-root": {},
          }}
        >
          {allApprovalStatuses.map((item) => {
            let statusIcon: JSX.Element | null = null;

            switch (item.type) {
              case "Pending":
                statusIcon = <PendingIcon style={{ color: "orange" }} />;
                break;
              case "Approved":
                statusIcon = (
                  <CheckCircleIcon style={{ color: "lightgreen" }} />
                );
                break;
              case "Cancelled":
                statusIcon = <CancelIcon style={{ color: "red" }} />;
                break;
              case "Rejected":
                statusIcon = <Warning style={{ color: "#ffdc50" }} />;
                break;
              case "Expired":
                statusIcon = <AccessTime style={{ color: "#78968c" }} />;
                break;
              default:
                break;
            }

            return (
              <MenuItem key={item.id} value={item.id}>
                {statusIcon}
                <span style={{ color: "black" }}>{item.type}</span>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ApprovalStatusDropdown;
