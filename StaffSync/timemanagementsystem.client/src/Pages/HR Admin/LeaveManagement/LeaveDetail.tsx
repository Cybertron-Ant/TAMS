import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import ILeaveTracker from "./interfaces/ILeaveTracker";
import { useUtils } from "@mui/x-date-pickers/internals";
import { formatDate } from "date-fns";
import { calculateDurationInDays } from "../../../app/utils";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

interface LeaveDetailProps {
  leaveId?: string;
}

const LeaveDetail: React.FC<LeaveDetailProps> = ({ leaveId }) => {
  const [leave, setLeave] = useState<ILeaveTracker | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_TMS_PROD;
  useEffect(() => {
    const fetchLeaveRecord = async (leaveId?: string) => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/LeaveTrackers/GetById/${leaveId}`
        );
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
          throw new Error("Failed to fetch leave");
        }
        setLeave(data);
        setApprovalStatus(data.approvalStatus); // Update the state with the fetched status
      } catch (error: any) {
        console.error("Error fetching leave:", error);
        setApprovalStatus(null); // Set status to null in case of error
      }
    };

    fetchLeaveRecord(leaveId);
  }, []);

  let statusColorClass = "";

  switch (approvalStatus) {
    case "Pending":
      statusColorClass = "text-orange-500";
      break;
    case "Approved":
      statusColorClass = "text-green-500";
      break;
    case "Cancelled":
      statusColorClass = "text-red-500";
      break;
    case "Expired":
      statusColorClass = "text-gray-500";
      break;
    case "Rejected":
      statusColorClass = "text-purple-500";
      break;
    default:
      statusColorClass = "text-gray-500";
  }

  return (
    <>
      {leave ? (
        <div className="bg-white rounded-md">
          <div className="flex justify-between mb-4 last-of-type:mb-0">
            <div>
              <small>Leave Type</small>
              <p className="font-semibold">{leave.attendance || "N/A"}</p>
            </div>
            <div>
              <small>Shift</small>
              <p className="font-semibold">{leave.shift || "N/A"}</p>
            </div>
            <div>
              <small>Status</small>
              <p className={`font-semibold ${statusColorClass}`}>
                {approvalStatus || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex justify-between mb-4 last-of-type:mb-0">
            <div>
              <small>Duration</small>
              <p className="font-semibold">
                {calculateDurationInDays(
                  leave.dateOfAbsence,
                  leave.expectedDateOfReturn
                ) + " Day(s)" || "N/A"}
              </p>
            </div>
            <div>
              <small>Time of Notice</small>
              <p className="font-semibold">
                {formatDate(leave.timeOfNotice, "EEE, MMM do") || "N/A"}
              </p>
            </div>
            <div>
              <small>Date of Absence</small>
              <p className="font-semibold">
                {formatDate(leave.dateOfAbsence, "EEE, MMM do") || "N/A"}
              </p>
            </div>
            <div>
              <small>Expected Return Date</small>
              <p className="font-semibold">
                {formatDate(leave.expectedDateOfReturn, "EEE, MMM do") || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex justify-between mb-4 last-of-type:mb-0">
            <div>
              <small>Reason</small>
              <p className="font-semibold">
                {leave.reason || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex justify-between mb-4 last-of-type:mb-0">
            <div>
              <small>Document Submitted</small>
              <p className="font-semibold">
                {leave.documentLink ? (
                  <a className="text-blue-500" href={leave.documentLink}>
                    {leave.documentLink.length >= 50
                      ? leave.documentLink.slice(0, 50) + "..."
                      : leave.documentLink}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="font-bold text-lg mb-5">
              Loading leave information...
            </h3>
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          </div>
        </>
      )}
    </>
  );
};

export default LeaveDetail;
