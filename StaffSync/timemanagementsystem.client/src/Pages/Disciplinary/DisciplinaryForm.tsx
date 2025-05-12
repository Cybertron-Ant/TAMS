import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PermissionManager from "../../app/PermissionManager ";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { Employee } from "../../interfaces/Employee";
import { DisciplinaryTracker, HRRemark, NOD, NTE } from "./Disciplinary";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

interface DisciplinaryFormProps {
  onClose?: () => void;
  disciplinaryRecord?: DisciplinaryTracker; // Optional prop to handle new records
}

const DisciplinaryForm: React.FC<DisciplinaryFormProps> = ({
  onClose,
  disciplinaryRecord,
}) => {
  const initialEmployeeCode = disciplinaryRecord
    ? disciplinaryRecord.employeeCode
    : "";
  const [employeeCode, setEmployeeCode] = useState(initialEmployeeCode);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [dateSent, setDateSent] = useState("");
  const [showNTEForm, setShowNTEForm] = useState(!!disciplinaryRecord); // true if disciplinaryRecord is not null
  const [showNODForm, setShowNODForm] = useState(!!disciplinaryRecord); // true if disciplinaryRecord is not null

  const [isNTEFileUploaded, setIsNTEFileUploaded] = useState(false);
  const [isNODFileUploaded, setIsNODFileUploaded] = useState(false);

  const [isSuspended, setIsSuspended] = useState(!!disciplinaryRecord);

  const [hrRemarks, setHrRemarks] = useState<HRRemark[]>([]);

  const [entryDate, setEntryDate] = useState(() =>
    disciplinaryRecord
      ? disciplinaryRecord.entryDate
      : new Date().toISOString().split("T")[0]
  );

  const [dateOfViolation, setDateOfViolation] = useState(
    disciplinaryRecord ? disciplinaryRecord.dateOfViolation : ""
  );

  const [details, setDetails] = useState(
    disciplinaryRecord && disciplinaryRecord.details
      ? disciplinaryRecord.details
      : "We received an incident report that on date stated above, you allegedly incurred an infraction. As reported:"
  );

  const [decision, setDecision] = useState(
    disciplinaryRecord ? disciplinaryRecord.decision : ""
  );

  const [coachingDocLink, setCoachingDocLink] = useState(
    disciplinaryRecord ? disciplinaryRecord.coachingDocLink : ""
  );

  const [correctiveAction, setCorrectiveAction] = useState(
    disciplinaryRecord ? disciplinaryRecord.correctiveAction : ""
  );

  const [offenceCategory, setOffenceCategory] = useState(
    disciplinaryRecord ? disciplinaryRecord.offenceCategory : ""
  );

  const [violationCategory, setViolationCategory] = useState(
    disciplinaryRecord ? disciplinaryRecord.violationCategory : ""
  );

  const [suspensionStartDate, setSuspensionStartDate] = useState(
    disciplinaryRecord ? disciplinaryRecord.suspensionStartDate : null
  );

  const [suspensionEndDate, setSuspensionEndDate] = useState(
    disciplinaryRecord ? disciplinaryRecord.suspensionEndDate : null
  );

  const [mangerSignature, setMangerSignature] = useState(
    disciplinaryRecord ? disciplinaryRecord.mangerSignature : ""
  );

  const [mangerSignatureDate, setMangerSignatureDate] = useState(
    disciplinaryRecord
      ? disciplinaryRecord.mangerSignatureDate
      : new Date().toISOString().split("T")[0]
  );

  const [employeeSignature, setEmployeeSignature] = useState(
    disciplinaryRecord ? disciplinaryRecord.employeeSignature : ""
  );

  const [employeeSignatureDate, setEmployeeSignatureDate] = useState(
    disciplinaryRecord
      ? disciplinaryRecord.employeeSignatureDate
      : new Date().toISOString().split("T")[0]
  );

  const [occurrence, setOccurrence] = useState(
    disciplinaryRecord ? disciplinaryRecord.occurrence : "1st"
  );

  const [nature, setNature] = useState(
    disciplinaryRecord ? disciplinaryRecord.nature : ""
  );

  const [initialRemarksLoaded, setInitialRemarksLoaded] = useState(false);

  const API_URL = import.meta.env.VITE_TMS_PROD;

  console.log(
    "here is the disicplianry action from the selected row",
    disciplinaryRecord
  );

  useEffect(() => {
    const fetchHRRemarks = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/HRRemark`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedHRRemarks = await response.json();

        // Check if there are HR remarks in the disciplinaryRecord and mark them as selected
        const updatedHRRemarks = fetchedHRRemarks.map((remark) => ({
          ...remark,
          isSelected:
            disciplinaryRecord &&
            disciplinaryRecord.nod.hrRemarks.some(
              (r) => r.hrRemarkId === remark.hrRemarkId
            ),
        }));

        setHrRemarks(updatedHRRemarks);
      } catch (error) {
        console.error("Error fetching HR remarks:", error);
      }
    };

    fetchHRRemarks();
  }, [disciplinaryRecord, API_URL]);

  useEffect(() => {
    // If there's an existing record, load its occurrence into the state
    if (disciplinaryRecord && disciplinaryRecord.occurrence) {
      setOccurrence(disciplinaryRecord.occurrence);
    }
  }, [disciplinaryRecord]);

  useEffect(() => {
    const newDecisionText = `After a thorough review of your case, it was found that you have violated our Code of Conduct. With the documents at hand and your admittance of this item, you are hereby issued this corrective action, ${correctiveAction}, for committing an offence categorized as ${offenceCategory} related to ${violationCategory}.`;
    setDecision(newDecisionText);
  }, [correctiveAction, offenceCategory, violationCategory]);

  useEffect(() => {
    const isoDate = new Date().toISOString();
    setNte((prev) => ({
      ...prev,
      entryDate: isoDate,
    }));

    setNod((prev) => ({
      ...prev,
      entryDate: isoDate,
    }));
  }, [employeeCode]); // Assuming you might want to reset these when a user selects a different employee

  const [nte, setNte] = useState<NTE>({
    ...disciplinaryRecord?.nte,
    employeeCode: disciplinaryRecord?.employeeCode || employeeCode,
    entryDate: disciplinaryRecord?.nte?.entryDate || new Date().toISOString(),
    dateSent: disciplinaryRecord?.nte?.dateSent || "",
    fileLink: disciplinaryRecord?.nte?.fileLink || "",
    remarks: disciplinaryRecord?.nte?.remarks || "",
  });

  const [nod, setNod] = useState<NOD>({
    ...disciplinaryRecord?.nod,
    employeeCode: disciplinaryRecord?.employeeCode || employeeCode,
    entryDate: disciplinaryRecord?.nod?.entryDate || new Date().toISOString(),
    dateSent: disciplinaryRecord?.nod?.dateSent || "",
    fileLink: disciplinaryRecord?.nod?.fileLink || "",
    remarks: disciplinaryRecord?.nod?.remarks || "",
    hrRemarks: disciplinaryRecord?.nod?.hrRemarks || [],
  });

  useEffect(() => {
    if (
      disciplinaryRecord &&
      disciplinaryRecord.nte.remarks &&
      !initialRemarksLoaded
    ) {
      // Load the initial remarks from the disciplinary record
      const updatedNTE = {
        ...nte,
        remarks: disciplinaryRecord.nte.remarks,
      };
      setNte(updatedNTE);
      setInitialRemarksLoaded(true); // Set to true to prevent reloading and disabling
    }
  }, [disciplinaryRecord, initialRemarksLoaded, nte]);

  useEffect(() => {
    if (disciplinaryRecord) {
      setDateOfViolation(disciplinaryRecord.dateOfViolation || "");
      setEntryDate(
        disciplinaryRecord.entryDate || new Date().toISOString().split("T")[0]
      );
      setSuspensionStartDate(disciplinaryRecord.suspensionStartDate);
      setSuspensionEndDate(disciplinaryRecord.suspensionEndDate);
      // Update NTE and NOD states as well
      setNte({
        ...disciplinaryRecord.nte,
        employeeCode: disciplinaryRecord.employeeCode || employeeCode,
      });
      setNod({
        ...disciplinaryRecord.nod,
        employeeCode: disciplinaryRecord.employeeCode || employeeCode,
      });
    }
  }, [disciplinaryRecord, employeeCode]);

  useEffect(() => {
    if (disciplinaryRecord) {
      setNte({
        ...disciplinaryRecord.nte,
        employeeCode: disciplinaryRecord.employeeCode, // Ensure employeeCode is set
      });

      setNod({
        ...disciplinaryRecord.nod,
        employeeCode: disciplinaryRecord.employeeCode, // Ensure employeeCode is set
      });
    }
  }, [disciplinaryRecord]);

  const handleNTEEntryDateChange = (event) => {
    setNte((prevNte) => ({
      ...prevNte,
      entryDate: event.target.value,
      dateSent: entryDate,
    }));
    console.log(nte);
  };

  useEffect(() => {
    // Assuming you want to submit the form automatically when both files are uploaded
    // and the form is otherwise ready to be submitted. Adjust conditions as needed.
    const isFormReady = isNTEFileUploaded && isNODFileUploaded;

    const submitDisciplinaryAction = async () => {
      // Construct the payload with the updated NTE and NOD details
      const payload = {
        id: 0,
        employeeCode,
        entryDate,
        nte,
        nod,
      };

      try {
        const response = await fetchWithAuth(
          `${API_URL}/DisciplinaryTrackers/${employeeCode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create disciplinary action");
        }

        toast.success("Disciplinary action created successfully");
        // Here, you might want to reset the form or redirect the user
      } catch (error) {
        console.error("Error creating disciplinary action:", error);
        toast.error("Failed to create disciplinary action.");
      }
    };

    if (isFormReady) {
      submitDisciplinaryAction();
    }
  }, [isNTEFileUploaded, isNODFileUploaded, nte, nod, employeeCode, entryDate]); // Depend on the state that triggers the submission

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/Employees`);
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data: Employee[] = await response.json();
        setEmployees(data);
        // Find and set the employee from the employee list based on the employee code
        const selectedEmployee = data.find(
          (emp) => emp.employeeCode === employeeCode
        );
        setEmployee(selectedEmployee || null);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees.");
      }
    };

    fetchEmployees();
    !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])
      ? setEmployeeCode(employeeObj.employeeCode)
      : "";
  }, [employeeCode]);

  // Create a new array with only the hrRemarkId and remarkText properties
  const selectedHrRemarks = hrRemarks
    .filter((remark) => remark.isSelected)
    .map(({ hrRemarkId, remarkText }) => ({ hrRemarkId, remarkText }));

  const handleSubmit = async (actionType) => {
    // Expected signature format
    const expectedSignature = `${employee?.firstName[0]}.${employee?.lastName}`;

    // Check if the employee signature is required and not provided or does not match
    if (employeeObj.role === "Employee") {
      if (!employeeSignature.trim()) {
        toast.error("Please provide your signature before submitting.");
        return; // Stop the submission if the signature is missing
      } else if (employeeSignature.trim() !== expectedSignature) {
        toast.error(`Signature must be in the format: ${expectedSignature}`);
        return; // Stop the submission if the signature does not match the expected format
      }
    }

    // Get the expected format for the manager signature, assuming manager's first and last name are accessible
    const expectedManagerSignature = `${employeeObj?.firstName[0]}.${employeeObj?.lastName}`;

    // Check if the manager signature is required and not provided or does not match
    if (employeeObj.role !== "Employee") {
      // Assuming only non-employees need to provide a manager signature
      if (!mangerSignature.trim()) {
        toast.error("Manager signature is required.");
        return;
      } else if (mangerSignature.trim() !== expectedManagerSignature) {
        toast.error(
          `Manager signature must be in the format: ${expectedManagerSignature}`
        );
        return;
      }
    }
    let endpoint;
    let method;
    let payload;

    // Define allowed roles for uploading NOD and any admin actions
    const adminRoles = [
      "IT Manager Admin",
      "Super Admin",
      "HR Manager Admin",
      "HRMS Admin",
    ];

    switch (actionType) {
      case "uploadNTE":
        // Endpoint for uploading NTE, allowed for any role technically, but here limited to Employee
        endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}/${nte.nteid}/SendNTE`;
        method = "PUT"; // Assuming updating an existing NTE
        payload = { ...nte };
        if (nte) {
          endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}/${disciplinaryRecord.id}/Update`;
          method = "PUT";
          payload = {
            ...disciplinaryRecord,
            nte, // Spread the existing record
            employeeSignature, // Update with new employee signature
            employeeSignatureDate, // Update with new signature date
          };
        }
        break;

      case "uploadNOD":
        // Endpoint for uploading NOD, restricted to admin roles
        if (!adminRoles.includes(employeeObj.role)) {
          toast.error("Unauthorized action.");
          return; // Exit if not an admin
        }

        endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}/${nod.nodid}/FillNOD`;
        method = "PUT"; // Assuming creation of a new NOD
        payload = { ...nod, hrRemarks: selectedHrRemarks };
        break;

      case "updateEmployeeSignature":
        endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}/${disciplinaryRecord.id}/Update`;
        method = "PUT";
        payload = {
          ...disciplinaryRecord,
          nte, // Spread the existing record
          employeeSignature, // Update with new employee signature
          employeeSignatureDate, // Update with new signature date
        };
        break;
      case "createDisciplinaryRecord":
        // Endpoint for creating a full disciplinary record, likely restricted to admin roles
        if (!adminRoles.includes(employeeObj.role)) {
          toast.error("Unauthorized action.");
          return; // Exit if not an admin
        }
        endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}`;
        method = "POST"; // Creating a new disciplinary record
        payload = {
          id: disciplinaryRecord?.id,
          correctiveAction,
          offenceCategory,
          employeeSignature,
          employeeSignatureDate,
          mangerSignature,
          mangerSignatureDate,
          suspensionStartDate,
          suspensionEndDate,
          decision,
          violationCategory,
          occurrence,
          details,
          employeeCode,
          entryDate,
          nte,
          nod: { ...nod, hrRemarks: selectedHrRemarks },
        };
        break;

      case "updateDisciplinaryRecord":
        // Endpoint for creating a full disciplinary record, likely restricted to admin roles
        if (!adminRoles.includes(employeeObj.role)) {
          toast.error("Unauthorized action.");
          return; // Exit if not an admin
        }
        endpoint = `${API_URL}/DisciplinaryTrackers/${employeeCode}/${disciplinaryRecord.id}/Update`;
        method = "PUT"; // Update a new disciplinary record
        payload = {
          id: disciplinaryRecord?.id,
          correctiveAction,
          offenceCategory,
          employeeSignature,
          employeeSignatureDate,
          mangerSignature,
          mangerSignatureDate,
          suspensionStartDate,
          suspensionEndDate,
          decision,
          violationCategory,
          occurrence,
          details,
          employeeCode,
          entryDate,
          nte,
          nod: { ...nod, hrRemarks: selectedHrRemarks },
        };
        break;

      default:
        console.error("Invalid action type");
        toast.error("Invalid action.");
        return;
    }

    try {
      console.log("here is the payload sending over", payload);
      const response = await fetchWithAuth(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to execute disciplinary action");
      }

      toast.success("Action completed successfully.");
      // If NTE is uploaded successfully, then update the employee signature
      // if (actionType === "uploadNTE") {
      //   await handleSubmit("updateEmployeeSignature"); // Call the update signature function
      // }
      if (onClose) onClose(); // Optionally close the form or modal
    } catch (error) {
      console.error("Error processing action:", error);
      toast.error("Failed to execute action.");
    }
  };

  useEffect(() => {
    if (showNTEForm) {
      // Assuming showNTEForm is a state variable controlling the visibility of the NTE form
      const currentDate = new Date().toISOString();
      setNte((prevNte) => ({
        ...prevNte,
        dateSent: currentDate,
      }));
    }
  }, [showNTEForm]);

  useEffect(() => {
    const currentDate = new Date().toISOString();
    setNte((prevNte) => ({
      ...prevNte,
      dateSent: currentDate,
    }));
  }, []);

  useEffect(() => {
    if (showNODForm) {
      // Assuming showNTEForm is a state variable controlling the visibility of the NTE form
      const currentDate = new Date().toISOString();
      setNod((prevNod) => ({
        ...prevNod,
        dateSent: currentDate,
      }));
    }
  }, [showNODForm]);

  useEffect(() => {
    const currentDate = new Date().toISOString();
    setNod((prevNod) => ({
      ...prevNod,
      dateSent: currentDate,
    }));
  }, []);

  const handleEmployeeChange = async (event: any, employee: Employee | any) => {
    if (employee == null) return;
    const employeeCode = employee.employeeCode;
    console.log(employeeCode);
    const newSelectedEmployee =
      employees.find((e) => e.employeeCode === employeeCode) || null;

    setEmployeeCode(employeeCode);
    setEmployee(newSelectedEmployee || null);
  };

  const handleUploadNTE = () => {
    setShowNTEForm(true);
    setShowNODForm(false);
  };

  const handleUploadNOD = () => {
    setShowNODForm(true);
    setShowNTEForm(false);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;

    console.log("New Date Selected:", newDate); // Debug: log the new date

    // Update the entry date
    setEntryDate(newDate);

    // Update the signature dates based on the role
    if (employeeObj.role === "Employee") {
      console.log("Setting Employee Signature Date:", newDate); // Debug: log when setting employee signature date
      setEmployeeSignatureDate(newDate);
    } else {
      console.log("Setting Manager Signature Date:", newDate); // Debug: log when setting manager signature date
      setMangerSignatureDate(newDate);
    }
  };

  const toggleSectionVisibility = (
    section: "NTE" | "NOD",
    isVisible: boolean
  ) => {
    if (section === "NTE") {
      setShowNTEForm(isVisible);
    } else {
      setShowNODForm(isVisible);
    }
  };

  const employeeObj = PermissionManager.EmployeeObj();

  return (
    <>
      <div className="w-full bg-white rounded-lg p-10">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className="text-neutral-800 text-3xl font-bold">
              Issue Disciplinary Action
            </div>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              disablePortal
              disabled={
                !/^(hr manager admin|hrms admin|super admin|sr\. operations manager)$/i.test(
                  employeeObj.role?.toLowerCase()
                ) || !!disciplinaryRecord
              }
              id="employee-select"
              options={employees.sort(
                (a, b) => -b.firstName.localeCompare(a.firstName)
              )}
              onChange={handleEmployeeChange}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}`
              }
              sx={{ width: "100%" }}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              disabled={true}
              fullWidth
              label="Employee Code"
              value={employeeCode}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          {/* Dropdown for Corrective Action */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="corrective-action-label">
                Corrective Action
              </InputLabel>
              <Select
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                labelId="corrective-action-label"
                id="corrective-action-select"
                value={correctiveAction}
                label="Corrective Action"
                onChange={(e) => setCorrectiveAction(e.target.value)}
              >
                <MenuItem value="Verbal Warning">Verbal Warning</MenuItem>
                <MenuItem value="Written Warning">Written Warning</MenuItem>
                <MenuItem value="Final Warning">Final Warning</MenuItem>
                <MenuItem value="Final Warning for Separation">
                  Final Warning for Separation
                </MenuItem>
                <MenuItem value="Dismissal">Dismissal</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Dropdown for Offence Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="offence-category-label">
                Offence Category
              </InputLabel>
              <Select
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                labelId="offence-category-label"
                id="offence-category-select"
                value={offenceCategory}
                label="Offence Category"
                onChange={(e) => setOffenceCategory(e.target.value)}
              >
                <MenuItem value="Minor">Minor</MenuItem>
                <MenuItem value="Major">Major</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="Grave">Grave</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Dropdown for Violation Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="violation-category-label">
                Violation Category
              </InputLabel>
              <Select
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                labelId="violation-category-label"
                id="violation-category-select"
                value={violationCategory}
                label="Violation Category"
                onChange={(e) => setViolationCategory(e.target.value)}
              >
                <MenuItem value="Attendance & Punctuality">
                  Attendance & Punctuality
                </MenuItem>
                <MenuItem value="Honesty & Integrity">
                  Honesty & Integrity
                </MenuItem>
                <MenuItem value="Negligence">Negligence</MenuItem>
                <MenuItem value="Inefficiency & Work Standard">
                  Inefficiency & Work Standard
                </MenuItem>
                <MenuItem value="Security, Safety & Order">
                  Security, Safety & Order
                </MenuItem>
                <MenuItem value="Operations Floor">Operations Floor</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
              fullWidth
              label="Department"
              value={employee?.department?.name || ""}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
              fullWidth
              label="Immediate Superior"
              value={employee?.immediateSuperior || ""}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
              fullWidth
              label="Position"
              value={employee?.positionCode?.name || ""}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
              label="Status"
              value={employee?.status?.name || ""}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
              label="Entry Date"
              type="date"
              variant="outlined"
              value={entryDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="occurrence-label">Occurrence</InputLabel>
              <Select
                labelId="occurrence-label"
                id="occurrence-select"
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                value={occurrence}
                label="Occurrence"
                onChange={(e) => setOccurrence(e.target.value as string)}
              >
                <MenuItem value="1st">1st</MenuItem>
                <MenuItem value="2nd">2nd</MenuItem>
                <MenuItem value="3rd">3rd</MenuItem>
                <MenuItem value="4th">4th</MenuItem>
                <MenuItem value="5th">5th</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Details of Incident"
              multiline
              disabled={employeeObj.role === "Employee"}
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              variant="outlined"
              InputProps={{
                style: {
                  // fontWeight: "bold", // Makes text bold
                  color: "#333", // Darker text for better readability
                  backgroundColor: "#f0f0f0", // Light grey background to highlight the area
                },
              }}
              // You can also style the label to be bold
              InputLabelProps={{
                shrink: true,
                style: {
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>
          {/* Decision Display */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Decision"
              multiline
              value={`After a thorough review of your case, it was found that you have violated our Code of Conduct. With the documents at hand and your admittance of this item, you are hereby issued this corrective action, ${correctiveAction}, for committing an offence categorized as ${offenceCategory} related to ${violationCategory}.`}
              onChange={(e) => setDecision(e.target.value)}
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: {
                  color: "#333",
                  backgroundColor: "#f0f0f0",
                },
              }}
              InputLabelProps={{
                shrink: true,
                style: {
                  fontWeight: "bold", // Bold label for emphasis
                },
              }}
            />
          </Grid>

          {/* Checkbox for Preventive Suspension */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSuspended}
                  disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                  name="preventiveSuspension"
                  color="primary"
                />
              }
              label="Place under Preventive Suspension"
            />
          </Grid>

          {/* Conditional TextFields for Suspension Start and End Date */}
          {isSuspended && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Suspension Start Date"
                  type="date"
                  disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                  variant="outlined"
                  value={suspensionStartDate}
                  onChange={(e) => setSuspensionStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Suspension End Date"
                  type="date"
                  disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                  variant="outlined"
                  value={suspensionEndDate}
                  onChange={(e) => setSuspensionEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Notice to Explain Section */}

          <Grid item xs={12}>
            {!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => toggleSectionVisibility("NTE", true)}
                disabled={showNTEForm}
              >
                + Fill Out Notice to Explain
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => toggleSectionVisibility("NTE", true)}
                disabled={showNTEForm}
              >
                + Add Notice to Explain
              </Button>
            )}
          </Grid>

          {showNTEForm && (
            <Paper
              className="mt-4"
              style={{ padding: "20px", marginBottom: "20px", width: "100%" }}
            >
              <Typography variant="h6" className="pb-6">
                Notice to Explain
              </Typography>
              <Grid container spacing={2}>
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="NTE Entry Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={nte.entryDate}
                    onChange={handleNTEEntryDateChange}
                  />
                </Grid> */}

                {/* Informational Text */}
                <Grid item xs={12}>
                  <Paper
                    style={{
                      padding: "15px",
                      backgroundColor: "#f5f5f5",
                      marginBottom: "20px",
                    }}
                  >
                    <Typography
                      variant="body1"
                      style={{ marginBottom: "10px" }}
                    >
                      You are hereby required to provide an explanation
                      regarding the above reported incident.
                    </Typography>
                    <Typography variant="body1">
                      Please submit a written explanation provided in the next
                      section why we will not issue a corrective action against
                      your behavior.
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: "10px" }}>
                      Kindly take note that if we do not receive any response
                      from you within five (5) working days upon receipt of this
                      Notice to Explain, we will assume that you are waiving
                      your right to be heard and the Human Resources will be
                      forced to come up with a decision based on the
                      documents/evidence at hand. Please give this your
                      immediate attention.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Written Explanation"
                    multiline
                    rows={4} // Adjust the number of rows as needed
                    variant="outlined"
                    value={nte.remarks}
                    onChange={(event) => {
                      if (!initialRemarksLoaded) {
                        // Allow changes only if initial remarks were not loaded
                        const updatedNTE = {
                          ...nte,
                          remarks: event.target.value,
                        };
                        setNte(updatedNTE);
                      }
                    }}
                    disabled={initialRemarksLoaded} // Disable if initial remarks were loaded from disciplinary record
                  />
                </Grid>

                <Grid item xs={12}>
                  {!disciplinaryRecord && (
                    <Button
                      type="button"
                      variant="contained"
                      // color="secondary"
                      onClick={() => toggleSectionVisibility("NTE", false)}
                    >
                      Cancel NTE
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Notice of Decision Section */}
          <Grid item xs={12}>
            {hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => toggleSectionVisibility("NOD", true)}
                disabled={showNODForm}
              >
                + Fill Out Notice of Decision
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => toggleSectionVisibility("NOD", true)}
                disabled={showNODForm}
              >
                + Fill Out Notice of Decision
              </Button>
            )}
          </Grid>

          {showNODForm && (
            <Paper className="mt-4" style={{ padding: "20px", width: "100%" }}>
              <Typography variant="h6" className="pb-6">
                Notice of Decision
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {/* <TextField
                    fullWidth
                    label="NOD Entry Date"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    value={nod.entryDate}
                    disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                    onChange={(e) =>
                      setNod((prev) => ({ ...prev, entryDate: e.target.value }))
                    }
                  /> */}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    HR Remarks
                  </Typography>

                  <div className="space-y-2">
                    {hrRemarks.map((remark) => (
                      <div
                        key={remark.hrRemarkId}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          id={`hr-remark-${remark.hrRemarkId}`}
                          checked={remark.isSelected || false}
                          disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                          onChange={(e) => {
                            // Handle checkbox change here
                            remark.isSelected = e.target.checked;
                            const selectedRemarks = hrRemarks.filter(
                              (remark) => remark.isSelected
                            );
                            console.log(selectedRemarks);
                            setHrRemarks([...hrRemarks]);
                          }}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <label
                          htmlFor={`hr-remark-${remark.hrRemarkId}`}
                          className="ml-2 text-sm font-medium text-gray-700"
                        >
                          {remark.remarkText}
                        </label>
                      </div>
                    ))}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  {!disciplinaryRecord && (
                    <Button
                      variant="contained"
                      // color="secondary"
                      onClick={() => toggleSectionVisibility("NOD", false)}
                    >
                      Cancel NOD
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Signature Fields */}
          <Grid container item xs={12} spacing={3}>
            {/* Signature Field for HR Manager */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manager Signature"
                placeholder={`${employeeObj?.firstName[0]}.${employeeObj?.lastName}`}
                variant="outlined"
                disabled={employeeObj.role === "Employee"}
                value={mangerSignature}
                onChange={(e) => setMangerSignature(e.target.value)}
                InputLabelProps={{ shrink: true }}
                style={{ marginTop: "8px" }}
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                required={hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                value={mangerSignatureDate}
                onChange={handleDateChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                defaultValue={new Date().toISOString().split("T")[0]}
                style={{ marginTop: "8px" }} // Add margin top for the date field
              />
            </Grid>

            {/* Signature Field for Employee */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee Signature"
                placeholder={`${employee?.firstName[0]}.${employee?.lastName}`}
                variant="outlined"
                disabled={hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                required={employeeObj.role === "Employee"}
                value={employeeSignature}
                onChange={(e) => setEmployeeSignature(e.target.value)}
                InputLabelProps={{ shrink: true }}
                style={{ marginTop: "8px" }}
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                disabled={hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                required={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                value={employeeSignatureDate}
                onChange={handleDateChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                defaultValue={new Date().toISOString().split("T")[0]}
                style={{ marginTop: "8px" }} // Add margin top for the date field
              />
            </Grid>
          </Grid>

          <Grid container className="mt-4 flex justify-end gap-2">
            {/* Cancel Button always visible */}
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                console.log("Cancel button clicked");
                if (onClose) onClose();
              }}
            >
              Cancel
            </Button>

            {/* Conditional Rendering of Action Buttons based on Role and State */}
            {employeeObj.role === "Employee" && (
              <Button
                type="submit"
                variant="contained"
                onClick={() => handleSubmit("uploadNTE")}
                sx={{
                  backgroundColor: "#ff6b6b",
                  "&:hover": { backgroundColor: "#ff8787" },
                }}
              >
                Submit NTE
              </Button>
            )}

            {(employeeObj.role.toLowerCase().includes("admin") ||
              employeeObj.role.toLowerCase().includes("manager")) &&
              disciplinaryRecord && (
                <Button
                  type="submit"
                  variant="contained"
                  onClick={() => handleSubmit("uploadNOD")}
                  sx={{
                    backgroundColor: "#ff6b6b",
                    "&:hover": { backgroundColor: "#ff8787" },
                  }}
                >
                  Submit NOD
                </Button>
              )}

            {(employeeObj.role.toLowerCase().includes("admin") ||
              employeeObj.role.toLowerCase().includes("manager")) && (
              <Button
                type="submit"
                variant="contained"
                onClick={() =>
                  handleSubmit(
                    disciplinaryRecord
                      ? "updateDisciplinaryRecord"
                      : "createDisciplinaryRecord"
                  )
                }
                sx={{
                  backgroundColor: "#ff6b6b",
                  "&:hover": { backgroundColor: "#ff8787" },
                }}
              >
                {disciplinaryRecord
                  ? "Update Disciplinary Action"
                  : "Issue Disciplinary Action"}
              </Button>
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default DisciplinaryForm;
