import {
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { ChangeEvent, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import CloudSyncIcon from "@mui/icons-material/CloudSync";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";

interface Employee {
  id: number;
  employeeCode: string;
  entryDate: string;
  dateHired: string;
  status: string;
  reason: string;
  effectiveDate: string;
  decision: string;
  firstName: string;
  lastName: string;
  currentDepartmentId: number;
  newDepartmentId: number;
  currentDepartmentName: string;
  newDepartmentName: string;
  currentPositionId: number;
  newPositionId: number;
  currentPositionTitle: string;
  newPositionTitle: string;
  department: { departmentId: number; name: string }; // Optional if not always present
  positionCode: { positionCodeId: number; name: string }; // Optional if not always present
}

interface Department {
  departmentId: number;
  name: string;
}

interface PositionCode {
  positionCodeId: number;
  name: string;
}

const MoveEmployeeForm: React.FC<{
  moveData?: Employee;
  onClose?: () => void;
}> = ({ moveData, onClose }) => {
  const [newDepartment, setNewDepartment] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [dateHired, setHiredDate] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [decision, setDecision] = useState("");

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [currentDepartment, setCurrentDepartment] = useState<string>("");
  const [currentPosition, setCurrentPosition] = useState<string>("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    ""
  );

  const [positionCodes, setPositionCodes] = useState<PositionCode[]>([]);
  const [selectedPositionCode, setSelectedPositionCode] = useState("");
  const [selectedPositionCodeId, setSelectedPositionCodeId] = useState<
    number | 0
  >(0);

  const [formData, setFormData] = useState({
    employeeCode: moveData?.employeeCode || "",
    firstName: moveData?.firstName || "",
    lastName: moveData?.lastName || "",
    entryDate: moveData?.entryDate.split("T")[0] || "",
    dateHired: moveData?.dateHired.split("T")[0] || "",
    effectiveDate: moveData?.effectiveDate.split("T")[0] || "",
    currentDepartmentId: moveData?.currentDepartmentId || 0,
    currentPositionId: moveData?.currentPositionId || 0,
    newDepartmentId: moveData?.newDepartmentId.toString() || "",
    newPositionId: moveData?.newPositionId.toString() || "",
    currentPositionTitle: moveData?.currentPositionTitle || "",
    newPositionTitle: moveData?.newPositionTitle || "",
    currentDepartmentName: moveData?.currentDepartmentName || "",
    newDepartmentName: moveData?.newDepartmentName || "",
    decision: moveData?.decision || "",
    reason: moveData?.reason || "",
    status: moveData?.status || "",
  });

  useEffect(() => {
    if (moveData) {
      setFormData({
        employeeCode: moveData.employeeCode || "",
        firstName: moveData.firstName || "",
        lastName: moveData.lastName || "",
        entryDate: moveData.entryDate.split("T")[0] || "",
        dateHired: moveData.dateHired.split("T")[0] || "",
        effectiveDate: moveData.effectiveDate.split("T")[0] || "",
        currentDepartmentId: moveData.currentDepartmentId || 0,
        currentPositionId: moveData.currentPositionId || 0,
        newDepartmentId: moveData.newDepartmentId.toString() || "",
        newPositionId: moveData.newPositionId.toString() || "",
        currentPositionTitle: moveData.currentPositionTitle || "",
        newPositionTitle: moveData.newPositionTitle || "",
        currentDepartmentName: moveData.currentDepartmentName || "",
        newDepartmentName: moveData.newDepartmentName || "",
        decision: moveData.decision || "",
        reason: moveData.reason || "",
        status: moveData.status || "",
      });
    }
  }, [moveData]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    console.log("Received moveData:", moveData); // This should log the moveData whenever it changes
  }, [moveData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/Employees`);
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data: Employee[] = await response.json();
        setAllEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await fetchWithAuth(`${API_URL}/Departments`);
      const data: Department[] = await response.json();
      setDepartments(data);
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchPositionCodes = async () => {
      const response = await fetchWithAuth(`${API_URL}/PositionCodes`);
      const data: PositionCode[] = await response.json();
      setPositionCodes(data);
      if (data.length > 0) {
        setSelectedPositionCode(data[0].name); // Preselect the first position code by name
        setSelectedPositionCodeId(data[0].positionCodeId); // and its ID
      }
    };

    fetchPositionCodes();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Construct the payload with numeric IDs for department and position
    const submissionPayload = {
      ...formData,
      newDepartmentId: selectedDepartmentId, // Ensure this is a number
      newPositionId: selectedPositionCodeId, // Ensure this is a number
      entryDate: entryDate, // Directly use the state if already in correct format
      // Ensure other date fields are also formatted correctly
      reason: reason,
      dateHired: dateHired,
      effectiveDate: effectiveDate,
      CurrentPositionTitle: currentPosition, // Assuming this is the name, not the title
      NewPositionTitle: newPosition, // You might need to adjust based on your state structure
      CurrentDepartmentName: currentDepartment,
      NewDepartmentName: newDepartment,
    };

    try {
      const response = await fetchWithAuth(
        `${API_URL}/SuspendedPullOutFloatings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionPayload),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok.");

      // Handle successful form submission
      console.log("Form submitted successfully");
      toast.success("Form submitted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => navigate("/manageemployee"),
      });
    } catch (error) {
      console.error("There was a problem with your submission:", error);
      toast.error("There was a problem with your submission.");
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    // Assuming you're managing your form's state with a state variable named `formData`
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    const departmentId = parseInt(event.target.value, 10);
    const department = departments.find((d) => d.departmentId === departmentId);
    if (department) {
      setNewDepartment(department.name); // Already being done for display
      setSelectedDepartmentId(departmentId); // For submission
      // Additionally, update formData with the department name for submission
      setFormData((prev) => ({
        ...prev,
        newDepartmentName: department.name, // Assuming this is for a new department
        currentDepartmentName: department.name, // or update based on your form logic
      }));
    }
  };

  const handlePositionChange = (event: SelectChangeEvent<string>) => {
    const positionId = parseInt(event.target.value, 10);
    const position = positionCodes.find((p) => p.positionCodeId === positionId);
    if (position) {
      setNewPosition(position.name); // Already being done for display
      setSelectedPositionCodeId(positionId); // For submission
      // Additionally, update formData with the position title for submission
      setFormData((prev) => ({
        ...prev,
        newPositionTitle: position.name, // Assuming this is for a new position
        currentPositionTitle: position.name, // or update based on your form logic
      }));
    }
  };

  const handleDecisionChange = (event: SelectChangeEvent) => {
    const newDecision = event.target.value;
    setDecision(newDecision); // Update the decision state
    // Additionally, ensure this new value is reflected in your formData state for submission
    setFormData((prev) => ({
      ...prev,
      decision: newDecision,
    }));
  };

  // Updated to ensure employeeCode is correctly set in formData
  const handleEmployeeChange = (event: SelectChangeEvent) => {
    const employeeCode = event.target.value;
    setSelectedEmployee(employeeCode); // Keep track of the selected employee code for display

    // Set the selected employee's department and position as current in the form
    const selectedEmployee = allEmployees.find(
      (e) => e.employeeCode === employeeCode
    );
    if (selectedEmployee) {
      setCurrentDepartment(selectedEmployee.department.name);
      setCurrentPosition(selectedEmployee.positionCode.name);

      // Update formData with the employeeCode and current department/position IDs for submission
      setFormData((prev) => ({
        ...prev,
        employeeCode: employeeCode,
        currentDepartmentId: selectedEmployee.department.departmentId,
        currentPositionId: selectedEmployee.positionCode.positionCodeId,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="flex-end">
        {/* First Row */}
        <Grid item xs={12} marginTop={2}>
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">Select Employee</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={selectedEmployee}
              label="Select Employee"
              onChange={handleEmployeeChange}
            >
              {allEmployees.map((employee) => (
                <MenuItem
                  key={employee.employeeCode}
                  value={employee.employeeCode}
                >
                  {employee.firstName} {employee.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Second Row */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Employee Code"
            name="employeeCode"
            value={formData.employeeCode} // This reads the employeeCode from formData state
            onChange={handleInputChange} // This ensures any manual change is also captured
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Current Department"
            name="department"
            value={currentDepartment} // This reads the employeeCode from formData state
            onChange={handleInputChange}
            disabled // This ensures any manual change is also captured
          />
        </Grid>
        {/* <Grid item xs={6}>
          <Typography>Current Department: {currentDepartment}</Typography>
        </Grid> */}

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Current Position"
            name="department"
            value={currentPosition} // This reads the employeeCode from formData state
            onChange={handleInputChange}
            disabled // This ensures any manual change is also captured
          />
        </Grid>
        {/* <Grid item xs={6}>
          <Typography>Current Position: {currentPosition}</Typography>
        </Grid> */}

        {/* Third Row */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="new-department-label">New Department</InputLabel>
            <Select
              labelId="new-department-label"
              id="new-department"
              value={selectedDepartmentId.toString()} // Convert to string for the value prop
              label="New Department"
              required
              placeholder="Select New Department"
              onChange={handleDepartmentChange}
            >
              
              {departments.map((department) => (
                <MenuItem
                  key={department.departmentId}
                  value={department.departmentId.toString()}
                >
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* New Position Dropdown */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="new-position-label">New Position</InputLabel>
            <Select
              labelId="new-position-label"
              id="new-position"
              value={selectedPositionCodeId.toString()} // Convert to string for the value prop
              label="New Position"
              required
              onChange={handlePositionChange}
            >
              {positionCodes.map((position) => (
                <MenuItem
                  key={position.positionCodeId}
                  value={position.positionCodeId.toString()}
                >
                  {position.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Entry Date */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Entry Date"
            type="date"
            required
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Hired Date */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Hired Date"
            type="date"
            required
            value={dateHired}
            onChange={(e) => setHiredDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Reason */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Grid>

        {/* Effective Date */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Effective Date"
            type="date"
            required
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Decision */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="decision-label">Decision</InputLabel>
            <Select
              labelId="decision-label"
              id="decision"
              value={decision}
              required
              label="Decision"
              onChange={handleDecisionChange}
            >
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Denied">Denied</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Finalized">Finalized</MenuItem>
              {/* Add more decision options as needed */}
            </Select>
          </FormControl>
        </Grid>
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
            Move
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default MoveEmployeeForm;
