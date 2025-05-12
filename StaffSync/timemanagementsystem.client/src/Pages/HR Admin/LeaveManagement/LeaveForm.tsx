import CancelIcon from "@mui/icons-material/Cancel";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { bool, date, object, ref, string } from "yup";
import PermissionManager from "../../../app/PermissionManager ";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import { UploadResult, uploadToS3 } from "../../../app/s3Helper";
import {
  calculateDurationInDays,
  validateForm,
} from "../../../app/utils";
import IApprovalStatus from "./interfaces/IApprovalStatus";
import IAttendance from "./interfaces/IAttendance";
import ILeaveTracker from "./interfaces/ILeaveTracker";
import IShift from "./interfaces/IShift";
import { hasRoles } from "../../../app/roleManager";
import Roles from "../../../enums/Roles";

/** This is the minimum requestable days for an employee */
const MINIMUM_REQUESTABLE_DAYS = 1;

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
}

interface LeaveFormProps {
  record?: ILeaveTracker | null; // Optional prop for the record to edit
  onClose?: () => void; // Callback to close the form/modal
}

const LeaveForm: React.FC<LeaveFormProps> = ({ record, onClose }) => {
  const [leaveFile, setLeaveFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isOfflineDocument, setIsOfflineDocumnet] = useState<boolean>(false);
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allAttendance, setAllAttendance] = useState<IAttendance[]>([]);
  const [allApprovalStatuses, setAllApprovalStatues] = useState<
    IApprovalStatus[]
  >([]);
  const [allShifts, setAllShifts] = useState<IShift[]>([]);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const employeeObj = PermissionManager.EmployeeObj();

  const fetchEmployees = async () => {
    try {
      let URL = `${API_URL}/Employees/${employeeObj.employeeCode}`;
      const response = await fetchWithAuth(URL);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      // Assuming each item in the returned array matches the Employee structure
      setAllEmployees([data]);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Attendances`);
      if (!response.ok) throw new Error("Failed to fetch attendances");
      const data = await response.json();
      // Assuming each item in the returned array matches the attendance structure
      setAllAttendance(data);
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Shifts`);
      if (!response.ok) throw new Error("Failed to fetch shifts data");
      const data = await response.json();
      // Assuming each item in the returned array matches the attendance structure
      setAllShifts(data);
    } catch (error) {
      console.error("Error fetching shifts data:", error);
    }
  };

  const fetchApprovalStatuses = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/ApprovalStatus`);
      if (!response.ok) throw new Error("Failed to fetch approval statuses");
      const data = await response.json();
      // Assuming each item in the returned array matches the approval status structure
      setAllApprovalStatues(data);
    } catch (error) {
      console.error("Error fetching approval statuses:", error);
    }
  };

  useEffect(() => {
    setFormData({ ...formData, employeeCode: employeeObj.employeeCode });

    fetchEmployees();
    fetchAttendance();
    fetchApprovalStatuses();
    fetchShifts();
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOfflineDocumnet(event.target.checked);
    if (!event.target.checked) {
      setLeaveFile(null);
      setUploadProgress(0);
    }
  };

  const uploadFile = async (file: File): Promise<any> => {
    return uploadToS3(file);
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    setLeaveFile(acceptedFiles[0]); // Handle multiple files
  };

  const handleRemoveFile = (fileName: string) => {
    setLeaveFile(null);
    setUploadProgress(0);
  };

  const [formData, setFormData] = useState({
    employeeCode: record?.employeeCode || "",
    attendanceId: record?.attendanceId || "",
    approvalStatusId: record?.approvalStatusId || 0,
    timeOfNotice: record?.timeOfNotice || new Date().toISOString().split('T')[0], // gets the format 2024-09-23
    dateOfAbsence: record?.dateOfAbsence || "",
    expectedDateOfReturn: record?.expectedDateOfReturn || "",
    shiftId: record?.shiftId || "",
    reason: record?.reason || "",
    recommendation: record?.recommendation || "",
    submittedDocument: record?.submittedDocument || false,
    documentLink: record?.documentLink || "",
  });

  type FormErrors = {
    dateOfAbsence?: string;
    expectedDateOfReturn?: string;
  };

  const isModalEditMode = Boolean(record?.id);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = event.target as HTMLInputElement; // Cast to HTMLInputElement to access 'checked'
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormData({ ...formData, [name]: value });

    validateInput(name, value);
  };

  const validateInput = (name: string, value: any) => {
    let newErrors: FormErrors | null = null; // Initialize as null

    if (name == "dateOfAbsence") {
      // Validate dateOfAbsence format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        newErrors = {
          ...newErrors,
          dateOfAbsence: "Date format must be YYYY-MM-DD",
        };
      }
    }

    if (name == "expectedDateOfReturn") {
      // Validate expectedDateOfReturn format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        newErrors = {
          ...newErrors,
          expectedDateOfReturn: "Date format must be YYYY-MM-DD",
        };
      }

      // Check if expectedDateOfReturn is at least one day after dateOfAbsence
      if (
        formData.dateOfAbsence &&
        calculateDurationInDays(formData.dateOfAbsence, value) <
          MINIMUM_REQUESTABLE_DAYS
      ) {
        newErrors = {
          ...newErrors,
          expectedDateOfReturn:
            "Please ensure your leave request is for a minimum of one day!",
        };
      }
    }

    setErrors(newErrors); // Set errors or null
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "image/jpeg": [],
      "application/pdf": [],
    },
    // multiple: false, // Enable multiple file uploads
  });

  // Initial Form Values
  const initialValues = {
    employeeCode: "",
    attendanceId: "",
    approvalStatusId: 0,
    timeOfNotice: new Date().toISOString().split('T')[0],
    dateOfAbsence: "",
    expectedDateOfReturn: "",
    shiftId: "",
    reason: "",
    recommendation: "",
    submittedDocument: false,
    documentLink: "",
  };

  // This variable stores errors for the forms
  const [errors, setErrors] = useState<{
    [K: string]: any;
  }>({});

  // Form Validation
  const validationSchema = object({
    employeeCode: string().required("Employee is required"),
    attendanceId: string().required("Attendance is required"),
    dateOfAbsence: date()
      .required("Date of absence is required")
      .typeError("Invalid date format"),
    expectedDateOfReturn: date()
      .required("Expected date of return is required")
      .typeError("Invalid date format")
      .min(
        ref("dateOfAbsence"),
        "Expected date of return must be after date of absence"
      ),
    shiftId: string().required("Shift ID is required"),
    reason: string().nullable(),
    recommendation: string().nullable(),
    submittedDocument: bool(),
    documentLink: string().nullable(),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let uploadResult: UploadResult = {} as UploadResult;

    // Check if there is a file to upload and we're not in offline mode
    if (!isOfflineDocument && leaveFile != null) {
      uploadResult = await uploadFile(leaveFile);

      if (uploadResult.success) {
        setUploadProgress(100);
      } else {
        console.error("File upload failed");
        toast.error("File upload failed.");
        setUploadProgress(0);
        return; // Exit early if file upload fails
      }
    }

    // // Convert HTML dates to Datetime to store full accurate date in database
    // formData.dateOfAbsence = convertHtmlDateToUTC(formData.dateOfAbsence);
    // formData.expectedDateOfReturn = convertHtmlDateToUTC(
    //   formData.expectedDateOfReturn
    // );

    // Prepare formData with the uploaded document link if available
    const submitData = {
      ...formData,
      documentLink: uploadResult.previewUrl, // Use the uploaded file link
      submittedDocument: uploadResult.success,
    };

    // Determine if updating or creating based on the presence of record?.id
    const isUpdating = Boolean(record?.id);
    const apiEndpoint = isUpdating
      ? `${API_URL}/LeaveTrackers/UpdateByEmployeeCode/${submitData.employeeCode}/${record?.id}`
      : `${API_URL}/LeaveTrackers`;
    const method = isUpdating ? "PUT" : "POST";

    const isValid = await validateForm(formData, validationSchema, setErrors);

    if (!isValid) {
      toast.error("Please correct the errors in the form before submitting.");
      return 0;
    }

    try {
      const response = await fetchWithAuth(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const responseText = await response.text();

        if (
          responseText.toLowerCase().includes("maximum request".toLowerCase())
        ) {
          return toast.warning(responseText);
        }

        if (
          responseText
            .toLowerCase()
            .includes("you are requesting more days".toLowerCase())
        ) {
          return toast.warning(responseText);
        }

        if (
          responseText
            .toLowerCase()
            .includes("request atleast one day".toLowerCase())
        ) {
          return toast.warning(responseText);
        }

        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      // Handle successful form submission
      toast.success("Leave record processed successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Close the form/modal and refresh the list or navigate as needed
      onClose?.();
      navigate("/manageleave");

      // refresh list
      fetchEmployees();
    } catch (error) {
      console.error("There was a problem with the submission: ", error);
      toast.error("There was a problem with your submission.");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="p-4 rounded-md bg-gray-100 mb-4 flex justify-between">
        <p>Leave Duration</p>
        <p>
          (
          {calculateDurationInDays(
            formData.dateOfAbsence,
            formData.expectedDateOfReturn
          )}
          ) Days
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="flex-end">
          {/* First Row */}
          <Grid item xs={12}>
            <Autocomplete
              disablePortal
              id="employee-select"
              sx={{ width: "100%" }}
              disabled={true}
              value={employeeObj}
              onChange={(event, employee) => {
                setFormData({
                  ...formData,
                  employeeCode: employee.employeeCode,
                });
              }}
              options={allEmployees.sort(
                (a, b) => -b.firstName.localeCompare(a.firstName)
              )}
              getOptionLabel={(employee: Employee) =>
                `${employee.firstName} ${employee.lastName}`
              }
              renderInput={(params) => (
                <TextField {...params} label="Employee Name" />
              )}
            />
          </Grid>

          {/* Second Row */}
          <Grid item xs={6}>
            <TextField
              disabled={true}
              fullWidth
              label="EmployeeCode"
              name="employeeCode"
              value={
                !hasRoles([
                  Roles.SuperAdmin,
                  Roles.HRMSAdmin,
                  Roles.SrOperationsManager,
                  Roles.HRManagerAdmin,
                ])
                  ? employeeObj.employeeCode
                  : formData.employeeCode
              }
              onChange={handleInputChange}
            />
          </Grid>

          {/* First Row */}
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={errors == null ? false : !!errors.attendanceId}
            >
              <InputLabel id="leave-select-label">Select Leave Type</InputLabel>
              <Select
                labelId="leave-select-label"
                id="leave-select"
                required
                value={formData.attendanceId as string}
                label="Select Leave Type"
                onChange={(event) => {
                  const selectedValue = event.target.value;
                  setFormData({ ...formData, attendanceId: selectedValue });
                }}
              >
                {allAttendance.map((leave) => (
                  <MenuItem key={leave.id} value={leave.id}>
                    {leave.type}
                  </MenuItem>
                ))}
              </Select>
              {errors && errors.attendanceId && (
                <div className="text-red-500">{errors.attendanceId}</div>
              )}
            </FormControl>
          </Grid>

          {/* Third Row */}
          
          <Grid item xs={6}>
            {/* Check  if the dialog is open in update mode */}
            {isModalEditMode ? (
              <TextField
                fullWidth
                label="Date Of Absence"
                type="date"
                InputLabelProps={{ shrink: true }}
                required
                name="dateOfAbsence"
                value={
                  new Date(formData.dateOfAbsence).toISOString().split("T")[0]
                }
                onChange={handleInputChange}
                error={errors == null ? false : !!errors.dateOfAbsence}
                helperText={errors == null ? undefined : errors.dateOfAbsence}
              />
            ) : (
              <TextField
                fullWidth
                label="Date Of Absence"
                type="date"
                InputLabelProps={{ shrink: true }}
                required
                name="dateOfAbsence"
                value={formData.dateOfAbsence}
                onChange={handleInputChange}
                error={errors == null ? false : !!errors.dateOfAbsence}
                helperText={errors == null ? undefined : errors.dateOfAbsence}
              />
            )}
          </Grid>
          
          <Grid item xs={6}>
            {/* Check  if the dialog is open in update mode */}
            {isModalEditMode ? (
              <TextField
                fullWidth
                label="Expected Date Of Return"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                name="expectedDateOfReturn"
                onChange={handleInputChange}
                value={
                  new Date(formData.expectedDateOfReturn)
                    .toISOString()
                    .split("T")[0]
                }
                error={errors == null ? false : !!errors.expectedDateOfReturn}
                helperText={
                  errors == null ? undefined : errors.expectedDateOfReturn
                }
              />
            ) : (
              <TextField
                fullWidth
                label="Expected Date Of Return"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                name="expectedDateOfReturn"
                onChange={handleInputChange}
                value={formData.expectedDateOfReturn}
                error={errors == null ? false : !!errors.expectedDateOfReturn}
                helperText={
                  errors == null ? undefined : errors.expectedDateOfReturn
                }
              />
            )}
          </Grid>

          {/* Fourth Row */}
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={errors == null ? false : !!errors.shiftId}
            >
              <InputLabel id="shift-select-label">Select Shift</InputLabel>
              <Select
                labelId="shift-select-label"
                id="shift-select"
                required
                value={formData.shiftId as string}
                label="Select Shift"
                onChange={(event) => {
                  const selectedValue = event.target.value;
                  setFormData({ ...formData, shiftId: selectedValue });
                }}
              >
                {allShifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.type}
                  </MenuItem>
                ))}
              </Select>
              {errors && errors.shiftId && (
                <div className="text-red-500">{errors.shiftId}</div>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            {/* <TextField
              fullWidth
              error={errors == null ? false : !!errors.timeOfNotice}
              helperText={errors == null ? "" : errors.timeOfNotice}
              label="Time of Notice"
              required
              type="datetime-local" // Changed to datetime-local to include time
              InputLabelProps={{ shrink: true }}
              name="timeOfNotice"
              value={formData.timeOfNotice}
              onChange={handleInputChange}
            /> */}
          </Grid>

          <Grid
            item
            xs={
              hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.SrOperationsManager,
                Roles.HRManagerAdmin,
              ])
                ? 6
                : 12
            }
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason"
              name="reason"
              error={errors == null ? false : !!errors.reason}
              helperText={errors == null ? "" : errors.reason}
              value={formData.reason}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Employee */}
          {hasRoles([
            Roles.SuperAdmin,
            Roles.HRMSAdmin,
            Roles.SrOperationsManager,
            Roles.HRManagerAdmin,
          ]) && (
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Recommendation"
                multiline
                rows={4}
                name="recommendation"
                error={errors == null ? false : !!errors.recommendation}
                helperText={errors == null ? "" : errors.recommendation}
                value={formData.recommendation}
                onChange={handleInputChange}
              />
            </Grid>
          )}

          {/* Fifth Row */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOfflineDocument}
                  onChange={handleCheckboxChange}
                />
              }
              label="Submit Documents Offline"
            />
          </Grid>

          {isOfflineDocument == false ? (
            <div className="grid w-full grid-cols-1 gap-4 p-4">
              <Grid item xs={12} className="flex justify-center items-center">
                <div
                  {...getRootProps({ className: "dropzone" })}
                  className="w-full flex flex-col justify-center items-center p-10 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 ease-in-out space-y-4"
                >
                  <input {...getInputProps()} />
                  <CloudSyncIcon
                    className="text-blue-500 animate-bounce"
                    style={{ fontSize: 60 }}
                  />
                  <Typography className="text-gray-800 text-base font-medium">
                    Click to select files
                  </Typography>
                  <Typography className="text-gray-500 text-sm">
                    Support for these files (PDF, JPEG)
                  </Typography>
                </div>
              </Grid>

              {/* Uploaded files */}
              {leaveFile && (
                <Grid item xs={12}>
                  <UploadProgressCard
                    key={leaveFile?.type}
                    fileName={leaveFile.name}
                    progress={uploadProgress}
                    handleRemove={() => handleRemoveFile(leaveFile.name)}
                  />
                </Grid>
              )}
            </div>
          ) : null}

          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={onClose}
              style={{ marginRight: "10px" }} // Adjust spacing between buttons
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

type UploadProgressCardProps = {
  fileName: string;
  progress: number;
  handleRemove: () => void;
};

const UploadProgressCard: React.FC<UploadProgressCardProps> = ({
  fileName,
  progress,
  handleRemove,
}) => {
  const onRemove = () => {
    console.info(fileName, "has been reomved from upload queue.");
    handleRemove();
  };

  return (
    <div className="flex justify-between bg-white shadow-md rounded-md p-4">
      <div className="flex flex-col w-full mr-3">
        <div className="flex flex-grow justify-between items-center mb-2">
          <p>{fileName}</p>
          <p>{progress}%</p>
        </div>
        <LinearProgress variant="determinate" value={progress}></LinearProgress>
      </div>
      <IconButton aria-label="cancel" onClick={onRemove}>
        <CancelIcon />
      </IconButton>
    </div>
  );
};

export default LeaveForm;
