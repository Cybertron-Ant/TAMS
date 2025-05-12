import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import FilePresentRoundedIcon from "@mui/icons-material/FilePresentRounded";
import { Box, Button, Grid, LinearProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import { formatDate } from "../../../app/utils";
import IRecruitmentTracker from "../interfaces/IRecruitmentTracker";

interface RecruitmentDetailProps {
  recordId: string | undefined;
  onClose: () => void;
}

const RecruitmentDetail: React.FC<RecruitmentDetailProps> = ({
  recordId,
  onClose,
}) => {
  const [record, setRecord] = useState<IRecruitmentTracker>();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  useEffect(() => {
    const apiEndpoint = `${API_URL}/RecruitmentTrackers/${recordId}`;
    const fetchRecord = async (recordId: string | undefined) => {
      if (recordId == undefined || recordId == "")
        console.error(
          "RecordID is missing, please retry with a valid recordId!"
        );

      const response = await fetchWithAuth(apiEndpoint);

      // Error in response
      if (!response.ok) throw new Error("Failed to delete Recruitment record");

      // Response data
      const data = await response.json();

      // Assuming response matches the IRecruitmentTracker interface
      setRecord(data);
    };

    fetchRecord(recordId);
  }, [recordId]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl text-neutral-800 font-bold mt-2">
            Recruitment Tracker
          </div>
          <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
            <span className="opacity-60">Dashboard</span>
            <span className="opacity-60">/</span>
            <span className="opacity-60">Recruitment Tracker</span>
            <span className="opacity-60">/</span>
            <span>Recruitment Details</span>
          </div>
        </div>
        <div>
          <Button
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#2d2d2d" },
            }}
            onClick={() => navigate("/recruitment")}
          >
            <ArrowBackIcon sx={{ fontSize: "18px", mr: "5px" }} /> Go Back
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col rounded-md">
        {record ? (
          <Grid container spacing={3}>
            {/* Row 1 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Candidate Name
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  align="left"
                  sx={{ wordWrap: "break-word" }}
                >
                  {record.firstName ? record.firstName : "N/A"}{" "}
                  {record.lastName ? record.lastName : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.email ? record.email : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.mobileNumber ? record.mobileNumber : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Date Applied
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.dateApplied ? formatDate(record.dateApplied) : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Source
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  align="left"
                  sx={{ wordWrap: "break-word" }}
                >
                  {record.source ? record.source : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Date Invited
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.dateInvited ? formatDate(record.dateInvited) : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 3 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  First follow up
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.firstFollowUp
                    ? formatDate(record.firstFollowUp)
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Second follow up
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.secondFollowUp
                    ? formatDate(record.secondFollowUp)
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Third follow up
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.thirdFollowUp
                    ? formatDate(record.thirdFollowUp)
                    : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 4 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  First follow up remarks
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  align="left"
                  sx={{ wordWrap: "break-word" }}
                >
                  {record.firstFollowUpRemarks
                    ? record.firstFollowUpRemarks
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Second follow up remarks
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  align="left"
                  sx={{ wordWrap: "break-word" }}
                >
                  {record.secondFollowUpRemarks
                    ? record.secondFollowUpRemarks
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Third follow up remarks
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  align="left"
                  sx={{ wordWrap: "break-word" }}
                >
                  {record.thirdFollowUpRemarks
                    ? record.thirdFollowUpRemarks
                    : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 5 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Interview Date
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.interviewDate
                    ? formatDate(record.interviewDate)
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Interview Remarks
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.interviewRemarks ? record.interviewRemarks : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Initial Interviewer
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.initialInterviewer
                    ? record.initialInterviewer.firstName +
                      " " +
                      record.initialInterviewer.lastName
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Intial Interview Result
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.initialInterviewResult
                    ? record.initialInterviewResult.type
                    : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 6 */}
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Final Interview Date
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.finalInterviewDate
                    ? formatDate(record.finalInterviewDate)
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Final Interview Remarks
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.finalInterviewRemarks
                    ? record.finalInterviewRemarks
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Final Interviewer
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.finalInterviewer
                    ? record.finalInterviewer.firstName +
                      " " +
                      record.finalInterviewer.lastName
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Final Interview Result
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.finalInterviewResult
                    ? record.finalInterviewResult.type
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Candidate Score
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.candidateScore
                    ? record.candidateScore
                    : "N/A"}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Admin's Comment
                </Typography>
                <Typography variant="body1" fontWeight="bold" align="left">
                  {record.adminComment
                    ? record.adminComment
                    : "N/A"}
                </Typography>
              </div>
            </Grid>

            {/* Row 7 */}
            <Grid item xs={12} display={record.document ? "flex" : "none"}>
              <div>
                <Typography variant="subtitle1" align="left">
                  Document
                </Typography>

                <Typography variant="body1">
                  <a
                    href={record.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col justify-center items-center transition-all p-3 mb-2 last-of-type:mb-0 rounded-md bg-[#F8F8F8] border border-[#C6C6C6] hover:text-blue-500 text-gray-950"
                  >
                    <FilePresentRoundedIcon
                      className="text-blue-500"
                      sx={{ fontSize: "32px" }}
                    />
                    <span className="text-sm ">
                      {record.document}
                      <DownloadRounded sx={{ fontSize: "16px" }} />
                    </span>
                  </a>
                </Typography>
              </div>
            </Grid>
          </Grid>
        ) : (
          <>
            <div>
              <h3 className="font-bold text-lg mb-5">
                Fetching information...
              </h3>
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RecruitmentDetail;
