import React, { useEffect, useState } from "react";
import { Grid, LinearProgress } from "@mui/material";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../app/fetchWrapper";
import DataCard from "./DataCard";
import ILeaveBalance from "../Pages/HR Admin/LeaveManagement/interfaces/ILeaveBalance";

type LeaveBalancesProps = { employeeCode: string; cardSize?: number };

const LeaveBalances: React.FC<LeaveBalancesProps> = ({
  employeeCode,
  cardSize,
}) => {
  const [leaveBalances, setLeaveBalances] = useState<ILeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const fetchLeaveBalances = async () => {
    setIsLoading(true);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/LeaveBalances/GetLeaveBalances/${employeeCode}`
      );
      if (!response.ok) throw new Error("Failed to fetch leave balances");
      const data: ILeaveBalance[] = await response.json();
      setLeaveBalances(data);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      toast.error("Failed to fetch leave balances.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  return (
    <>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={2}>
          {leaveBalances.map((leaveB: ILeaveBalance, key: number) => {
            return (
              <Grid key={key} item xs={cardSize ?? 3}>
                <DataCard title={leaveB.attendance} content={leaveB.balance} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default LeaveBalances;
