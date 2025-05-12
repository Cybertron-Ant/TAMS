import React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import IconButton from "@mui/material/IconButton";

export interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: string;
  dateOfAbsence: string; // New field
  expectedReturnDate: string; // New field
  status: "Approve" | "Reject" | "Pending";
}

interface LeaveRequestsProps {
  requests: LeaveRequest[];
  onStatusChange: (
    id: number,
    newStatus: "Approve" | "Reject" | "Pending"
  ) => void;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({
  requests,
  onStatusChange,
}) => {
  return (
    <div className="w-full p-7 h-full  bg-white rounded-lg shadow-md flex flex-col gap-5">
      <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
      <div className="overflow-auto">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li
              key={request.id}
              className="py-4 flex justify-between items-center gap-4 transition duration-150 ease-in-out hover:bg-gray-50"
            >
              <div className="flex-grow">
                <p className="text-sm font-semibold">{request.employeeName}</p>
                <p className="text-sm text-gray-500">{request.leaveType}</p>
                <p className="text-sm">
                  Date of Absence: {request.dateOfAbsence}
                </p>
                <p className="text-sm">
                  Expected Return: {request.expectedReturnDate}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <select
                  className="px-3 py-1.5 bg-gray-50 border border-gray-300 text-sm font-medium text-gray-900 rounded cursor-pointer focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
                  value={request.status}
                  onChange={(e) =>
                    onStatusChange(
                      request.id,
                      e.target.value as "Approve" | "Reject" | "Pending"
                    )
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Approve">Approve</option>
                  <option value="Reject">Reject</option>
                </select>
                <IconButton disabled>
                  {request.status === "Approve" && (
                    <CheckCircleOutlineIcon className="text-green-500" />
                  )}
                  {request.status === "Reject" && (
                    <HighlightOffIcon className="text-red-500" />
                  )}
                  {request.status === "Pending" && (
                    <HourglassEmptyIcon className="text-yellow-500" />
                  )}
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeaveRequests;
