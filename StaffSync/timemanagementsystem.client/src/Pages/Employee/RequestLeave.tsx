import React, { useEffect, useState } from "react";
import LeaveForm from "../HR Admin/LeaveManagement/LeaveForm";
import DataCard from "../../Components/DataCard";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { toast } from "react-toastify";
import PermissionManager from "../../app/PermissionManager ";
import LeaveBalances from "../../Components/LeaveBalances";

const RequestLeave: React.FC = (): JSX.Element => {
  type Stats = { pendingCount: number; approvedCount: number };

  const [leaveStatistics, setLeaveStatistics] = useState<Stats>({
    pendingCount: 0,
    approvedCount: 0,
  });
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const { employeeCode } = PermissionManager.EmployeeObj();

  const fetchStatistics = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/LeaveTrackers/statistics/${employeeCode}`
      );

      if (!response.ok) throw new Error("Failed to fetch leave statistics");
      const data = await response.json();
      setLeaveStatistics(data);

      console.log(leaveStatistics);
    } catch (error) {
      console.error("Error fetching leave statistics:", error);
      toast.error("We aren't able to get leave statistics from the server.");
    }
  };

  useEffect(() => {
    // Fetch leave statistics
    fetchStatistics();
  }, []);

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Request Leave
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Request Leave</span>
        </div>
      </div>

      <div className="grid grid-cols-[6fr_4fr] gap-4">
        {/* Leave Form */}
        <LeaveForm />

        {/* Aggregated Data */}
        <div className="bg-white rounded-lg grid gap-4 p-4 h-min">
          <h4 className="col-span-2">Leave Balances</h4>
          <div className="col-span-2">
            <LeaveBalances employeeCode={employeeCode} cardSize={6} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestLeave;
