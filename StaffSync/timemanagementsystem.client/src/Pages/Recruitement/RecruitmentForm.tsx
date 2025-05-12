import CloudSyncIcon from "@mui/icons-material/CloudSync";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { uploadToS3 } from "../../app/s3Helper";
import {
  formatPhoneNumber,
  formatDateToPanamaDateHTML,
  removeEmptyProperties,
  trimStringValues,
} from "../../app/utils";
import { Employee } from "../../interfaces/Employee";
import IRecruitmentResult from "./interfaces/IRecruitmentResult";
import IRecruitmentTracker from "./interfaces/IRecruitmentTracker";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface RecruitmentProps {
  record: IRecruitmentTracker | null;
  onClose: () => void;
}

const RecruitmentForm: React.FC<RecruitmentProps> = ({ record, onClose }) => {
  const navigate = useNavigate();
  const isModalEditMode = Boolean(record?.id);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [interviewResults, setInterviewResults] = useState<
    IRecruitmentResult[]
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<string>("");

  const [formData, setFormData] = useState<IRecruitmentTracker>({
    firstName: record?.firstName || "",
    lastName: record?.lastName || "",
    email: record?.email || "",
    mobileNumber: record?.mobileNumber || "",
    dateApplied: record?.dateApplied || "",
    source: record?.source || "",
    dateInvited: record?.dateInvited || "",
    firstFollowUp: record?.firstFollowUp || "",
    secondFollowUp: record?.secondFollowUp || "",
    thirdFollowUp: record?.thirdFollowUp || "",
    firstFollowUpRemarks: record?.firstFollowUpRemarks || "",
    secondFollowUpRemarks: record?.secondFollowUpRemarks || "",
    thirdFollowUpRemarks: record?.thirdFollowUpRemarks || "",
    interviewDate: record?.interviewDate || "",
    interviewRemarks: record?.interviewRemarks || "",
    initialInterviewerId: record?.initialInterviewerId || "",
    initialInterviewResultId: record?.initialInterviewResultId || "",
    finalInterviewDate: record?.finalInterviewDate || "",
    finalInterviewRemarks: record?.finalInterviewRemarks || "",
    finalInterviewerId: record?.finalInterviewerId || "",
    finalInterviewResultId: record?.finalInterviewResultId || "",
    document: record?.document || "",
    adminComment: record?.adminComment || "",
    candidateScore: record?.candidateScore || "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/Employees`);
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data: Employee[] = await response.json();

        // Assuming each item in the returned array matches the Employee structure
        setAllEmployees(
          // Filter only employee's from the "Human Resources" department
          data.filter((employee: Employee) =>
            employee.department.name.includes("Human Resources")
          )
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchInterviewStatuses = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/InterviewResult`);
        if (!response.ok)
          throw new Error("Failed to fetch recruitment statuses");
        const data = await response.json();
        // Assuming each item in the returned array matches the approval status structure
        setInterviewResults(data);
      } catch (error) {
        console.error("Error fetching approval statuses:", error);
      }
    };

    fetchInterviewStatuses();
    fetchEmployees();
  }, []);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = event.target as HTMLInputElement; // Cast to HTMLInputElement to access 'checked'
    let value: string | boolean =
      target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    // Check fileds that may be storing a phone number and format it accordinly
    if (
      target.name.match(
        /\b(?:mobileNumber|phoneNumber|contactNumber|cellPhone|phone|cellphoneNumber|mobilePhone|mobileContact|contactPhone|userMobile)\b/gm
      )
    ) {
      value = formatPhoneNumber(target.value);
    }

    setFormData({ ...formData, [name]: value });
  };

  const uploadFile = async (file: File) => {
    const result = await uploadToS3(file);
    if (result.success) {
      setFormData({ ...formData, document: result.previewUrl });
      toast.success("Document uploaded!");
    }
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]); // Handle multiple files
    // For demonstration, set uploadProgress to 60
    setUploadProgress(100);
  };

  const handleRemoveFile = (fileName: string) => {
    setFile(null);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "image/jpeg": [],
      "application/pdf": [],
    },
    // multiple: false, // Enable multiple file uploads
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // set loading state
    setLoading(true);

    // let uploadResult: UploadResult = {} as UploadResult;

    // // Check if there is a file to upload
    // if (file != null) {
    //   uploadResult = await uploadFile(file);
    //   if (!uploadResult.success) {
    //     console.error("File upload failed");
    //     toast.error("File upload failed.");
    //     return; // Exit early if file upload fails
    //   }
    // }

    // Determine if updating or creating based on the presence of ID
    const isUpdating = Boolean(record?.id);
    const apiEndpoint = isUpdating
      ? `${API_URL}/RecruitmentTrackers/${record?.id}`
      : `${API_URL}/RecruitmentTrackers`;
    const method = isUpdating ? "PUT" : "POST";

    // Trim all string porperties before sending to serverside for saving/updating
    setFormData({
      ...(trimStringValues({
        ...formData,
      }) as IRecruitmentTracker),
    });

    let formObject = {};

    // remove empty properties from the payload in creation mode of the recruitment record
    if (isUpdating == false) {
      // form in creation mode
      formObject = removeEmptyProperties(formData) as any;
    } else {
      // form in edit mode
      // keep these fields in the update method payload so that they get passed over even if they are empty
      formObject = removeEmptyProperties(formData, [
        "firstFollowUpRemarks",
        "secondFollowUpRemarks",
        "secondFollowUpRemarks",
        "thirdFollowUpRemarks",
        "interviewRemarks",
        "finalInterviewRemarks",
        "source",
        "adminComment",
      ]) as any;
    }

    try {
      const response = await fetchWithAuth(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      // Handle successful form submission
      toast.success("Recruitment record processed successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      onClose();
    } catch (error) {
      console.error("There was a problem with the submission: ", error);
      toast.error("There was a problem with your submission.");
    } finally {
      // disable loading state
      setLoading(false);
    }
  };

  const toHTMLDate = (utcDate: string): string => {
    return formatDateToPanamaDateHTML(utcDate);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="my-4 p-4 max-h-[80vh] overflow-y-scroll"
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="First Name"
            variant="outlined"
            required
            fullWidth
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Last Name"
            variant="outlined"
            required
            fullWidth
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Email Address"
            variant="outlined"
            required
            fullWidth
            placeholder="Email Address"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            inputProps={{ maxLength: 320 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Mobile Number"
            variant="outlined"
            fullWidth
            placeholder="(123) 456-7890"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            inputProps={{ maxLength: 14 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Source"
            variant="outlined"
            required
            fullWidth
            placeholder="Source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Date Applied"
            variant="outlined"
            name="dateApplied"
            required
            fullWidth
            placeholder="YYYY-MM-DD"
            InputLabelProps={{ shrink: true }}
            type="date"
            value={
              isModalEditMode
                ? toHTMLDate(formData.dateApplied)
                : formData.dateApplied
            }
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Date Invited"
            variant="outlined"
            required
            fullWidth
            name="dateInvited"
            placeholder="YYYY-MM-DD"
            InputLabelProps={{ shrink: true }}
            type="date"
            value={
              isModalEditMode
                ? toHTMLDate(formData.dateInvited)
                : formData.dateInvited
            }
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Interview Date"
            variant="outlined"
            fullWidth
            required
            name="interviewDate"
            placeholder="YYYY-MM-DD"
            InputLabelProps={{ shrink: true }}
            type="date"
            value={
              isModalEditMode
                ? toHTMLDate(formData.interviewDate)
                : formData.interviewDate
            }
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="initial-interviewer-select-label">
              Select Initial Interviewer
            </InputLabel>
            <Select
              label="Select Initial Interviewer"
              labelId="initial-interviewer-select-label"
              id="initial-interviewer-select"
              name="initialInterviewerId"
              value={formData.initialInterviewerId}
              onChange={(event) => {
                const value = event.target.value;
                console.log("Initial", value);
                setFormData({
                  ...formData,
                  initialInterviewerId: value,
                });
              }}
            >
              {allEmployees.map((employee, index) => (
                <MenuItem key={index} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Administrator Comment"
            variant="outlined"
            multiline
            fullWidth
            placeholder="Enter additional insights for candidate evaluation and selection..."
            name="adminComment"
            rows={4}
            value={formData.adminComment}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="candidate-score-select-label">
              Select Candidate Score
            </InputLabel>
            <Select
              label="Select Candidate Score"
              labelId="candidate-score-select-label"
              id="candidate-score-select"
              name="candidateScore"
              value={formData.candidateScore}
              onChange={(event) => {
                const value = event.target.value;
                setFormData({
                  ...formData,
                  candidateScore: value,
                });
              }}
            >
              <MenuItem value="Excellent">Excellent</MenuItem>
              <MenuItem value="Very Good">Very Good</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Average">Average</MenuItem>
              <MenuItem value="Below Average">Below Average</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Accordion elevation={0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              id="panel2-header"
            >
              <Typography>Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="initial-interview-result-select-label">
                      Select Initial Interview Results
                    </InputLabel>
                    <Select
                      label="Select Initial Interview Results"
                      labelId="initial-interview-result-select-label"
                      id="initial-interview-result-select"
                      name="initialInterviewResultId"
                      value={formData.initialInterviewResultId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData({
                          ...formData,
                          initialInterviewResultId: value,
                        });
                      }}
                    >
                      {interviewResults.map((result, index) => (
                        <MenuItem key={index} value={result.id}>
                          {result.type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    label="Interview Remarks"
                    variant="outlined"
                    fullWidth
                    name="interviewRemarks"
                    rows={3}
                    placeholder="Interview Remarks"
                    value={formData.interviewRemarks}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Final Interview Date"
                    variant="outlined"
                    fullWidth
                    name="finalInterviewDate"
                    placeholder="YYYY-MM-DD"
                    InputLabelProps={{ shrink: true }}
                    type="date"
                    value={
                      isModalEditMode
                        ? toHTMLDate(formData.finalInterviewDate)
                        : formData.finalInterviewDate
                    }
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="final-interviewer-select-label">
                      Select Final Interviewer
                    </InputLabel>
                    <Select
                      label="Select Final Interviewer"
                      labelId="final-interviewer-select-label"
                      id="final-interviewer-select"
                      name="finalInterviewerId"
                      value={formData.finalInterviewerId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData({ ...formData, finalInterviewerId: value });
                      }}
                    >
                      {allEmployees.map((employee, index) => (
                        <MenuItem key={index} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="final-interview-result-select-label">
                      Select Final Interview Results
                    </InputLabel>
                    <Select
                      label="Select Final Interview Results"
                      labelId="final-interview-result-select-label"
                      id="final-interview-result-select"
                      name="finalInterviewResultId"
                      value={formData.finalInterviewResultId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData({
                          ...formData,
                          finalInterviewResultId: value,
                        });
                      }}
                    >
                      {interviewResults.map((result, index) => (
                        <MenuItem key={index} value={result.id}>
                          {result.type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    label="Final Interview Remarks"
                    variant="outlined"
                    fullWidth
                    name="finalInterviewRemarks"
                    rows={3}
                    placeholder="Final Interview Remarks"
                    value={formData.finalInterviewRemarks}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="First Follow-Up"
                        variant="outlined"
                        fullWidth
                        placeholder="YYYY-MM-DD"
                        InputLabelProps={{ shrink: true }}
                        type="date"
                        name="firstFollowUp"
                        value={
                          isModalEditMode
                            ? toHTMLDate(formData.firstFollowUp)
                            : formData.firstFollowUp
                        }
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        multiline
                        label="Remarks"
                        variant="outlined"
                        fullWidth
                        name="firstFollowUpRemarks"
                        rows={4}
                        placeholder="Remarks"
                        value={formData.firstFollowUpRemarks}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Second Follow-Up"
                        name="secondFollowUp"
                        variant="outlined"
                        fullWidth
                        placeholder="YYYY-MM-DD"
                        InputLabelProps={{ shrink: true }}
                        type="date"
                        value={
                          isModalEditMode
                            ? toHTMLDate(formData.secondFollowUp)
                            : formData.secondFollowUp
                        }
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        multiline
                        label="Remarks"
                        variant="outlined"
                        fullWidth
                        name="secondFollowUpRemarks"
                        rows={4}
                        placeholder="Remarks"
                        value={formData.secondFollowUpRemarks}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Third Follow-Up"
                        variant="outlined"
                        fullWidth
                        placeholder="YYYY-MM-DD"
                        InputLabelProps={{ shrink: true }}
                        type="date"
                        name="thirdFollowUp"
                        value={
                          isModalEditMode
                            ? toHTMLDate(formData.thirdFollowUp)
                            : formData.thirdFollowUp
                        }
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        multiline
                        label="Remarks"
                        variant="outlined"
                        fullWidth
                        name="thirdFollowUpRemarks"
                        rows={4}
                        placeholder="Remarks"
                        value={formData.thirdFollowUpRemarks}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} className="grid grid-cols-1 place-items-center">
          <h1 className="w-full text-left my-2 font-semibold">
            Applicant Resume
          </h1>
          <div
            {...getRootProps({ className: "dropzone" })}
            className="flex flex-col justify-center items-center p-10 w-full rounded-lg border-2 border-dashed border-gray-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 ease-in-out space-y-4"
          >
            <input {...getInputProps()} />
            <CloudSyncIcon
              className="text-blue-500 animate-bounce"
              style={{ fontSize: 60 }}
            />
            <Typography className="text-gray-800 text-base font-medium">
              Drag 'n' drop some files here, or click to select files
            </Typography>
            <Typography className="text-gray-500 text-sm">
              Supported file types (PDF, JPEG)
            </Typography>
          </div>

          {file ? (
            <div key={file?.type} className="mt-4 flex flex-col items-center">
              <Typography sx={{ mb: "10px" }}>
                {file.name} - {uploadProgress}%
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveFile(file.name)}
                sx={{
                  borderColor: "blue-500",
                  color: "blue-600",
                  "&:hover": {
                    backgroundColor: "blue-50",
                    borderColor: "blue-600",
                  },
                }}
              >
                Remove
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => uploadFile(file)}
                sx={{
                  borderColor: "blue-500",
                  color: "blue-600",
                  "&:hover": {
                    backgroundColor: "blue-50",
                    borderColor: "blue-600",
                  },
                }}
              >
                Upload Document{" "}
              </Button>
            </div>
          ) : (
            <></>
          )}
        </Grid>
        <Grid
          display="flex"
          justifyContent="flex-end"
          xs={12}
          item
          container
          spacing={1}
        >
          <Grid item>
            <Button variant="outlined" color="primary" onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              color="primary"
            >
              {!isModalEditMode ? "Submit" : "Update"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default RecruitmentForm;
