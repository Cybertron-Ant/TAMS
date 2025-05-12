import { Box, Grid, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";

const WorkResumptionTracker: React.FC = () => {
  const [tracker, setTracker] = useState<any[]>([]);
  const { employeeCode, wrkId } = useParams<{
    employeeCode: string;
    wrkId: string;
  }>();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchTracker();
  }, []);

  const fetchTracker = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/WorkResumptionTrackers/${employeeCode}/${wrkId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log(data);
      setTracker(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Work Resumption Tracker
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Work Resumption Tracker List</span>
          <span className="opacity-60">/</span>
          <span>Work Resumption Tracker</span>
        </div>
      </div>
      <Box className="flex justify-between align-middle p-4">
        <Grid container spacing={2} className="rounded m-8 grid gap-2 ">
          <Grid item xs={10} className="rounded shadow-lg p-4 bg-white ">
            <h6 className="font-light">Employee No.</h6>
            <h5 className="font-bold">
              {(tracker as any).employeeCode ?? "N/A"}
            </h5>
            <h6 className="font-light">Entry Date</h6>
            <h5 className="font-bold">{(tracker as any).entryDate ?? "N/A"}</h5>

            <h6 className="font-light">Date Of Absences</h6>
            <h5 className="font-bold">
              {(tracker as any).dateOfAbsence ?? "N/A"}
            </h5>
            <h6 className="font-light">Date Sent</h6>
            <h5 className="font-bold">{(tracker as any).dateSent ?? "N/A"}</h5>

            <h6 className="font-light">Admin Hearing Date</h6>
            <h5 className="font-bold">
              {(tracker as any).adminHearingDate ?? "N/A"}
            </h5>
          </Grid>
          <Grid item xs={5} className="rounded shadow-lg p-4 bg-white ">
            <h5 className="font-bold text-xl">Notice to Explain</h5>
            <h6 className="font-light">Entry Date</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nte.entryDate ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">Date Sent</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nte.dateSent ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">File Link</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nte.fileLink ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">Remark</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nte.remarks ?? "N/A"
                : "N/A"}
            </h5>
          </Grid>
          <Grid item xs={5} className="rounded shadow-lg p-4 bg-white ">
            <h5 className="font-bold text-xl">Notice of Decision</h5>
            <h6 className="font-light">Entry Date</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nod.entryDate ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">Date Sent</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nod.dateSent ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">File Link</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nod.fileLink ?? "N/A"
                : "N/A"}
            </h5>
            <h6 className="font-light">Remark</h6>
            <h5 className="font-bold">
              {(tracker as any).nte
                ? (tracker as any).nod.remarks ?? "N/A"
                : "N/A"}
            </h5>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default WorkResumptionTracker;
