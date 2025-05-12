import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { BreakTime } from "../../interfaces/BreakTime";

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
}




const AddTimeSheet: React.FC = () => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const [breakTimeTypes, setBreakTimeTypes] = useState<BreakTime[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeSheet, setTimeSheet] = useState<Partial<TimeSheet>>({
    employeeCode: "",
    punchIn: "",
    punchOut: "",
    date: "",
    breakType: "",
    breakTypeId: 1,
    isActive: false,
    firstName: "",
    lastName: "",
  });
  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    return text.includes("success")
      ? { success: true, message: text }
      : { success: false, message: text };
  };

  const fetchBreakTimeTypes = () => {
    fetchWithAuth(
      `${API_URL}/BreakType`
    )
      .then(parseResponse)
      .then((data) => {
        if (data.success === false) {
          console.error("Error fetching Break Types:", data.message);
          setBreakTimeTypes(null);
        } else {
          setBreakTimeTypes(data);
          // setSelectedBreakType(data[0]); //This is because the clock in break type should be the first item in the list
        }
      })
      .catch((error) => {
        console.error("Error fetching active timesheet:", error);
        setBreakTimeTypes(null);
      });
  };
 

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetchWithAuth(
        `${API_URL}/Employees`
      );
      const data = await response.json();
      setEmployees(data);
    };

    fetchEmployees();
    fetchBreakTimeTypes();
  }, []);

  const handleEmployeeChange = (event: SelectChangeEvent) => {
    const employeeCode = event.target.value as string;
    setTimeSheet({ ...timeSheet, employeeCode });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTimeSheet({
      ...timeSheet,
      [name]:
        name === "currentHours" ||
        name === "lunchBreak" ||
        name === "breakDuration" ||
        name === "weeklyHours" ||
        name === "totalWeeklyHours"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Adjust the API endpoint as necessary
    const response = await fetchWithAuth(
      `${API_URL}/TimeSheet/${timeSheet.employeeCode}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeSheet),
      }
    );

    if (response.ok) {
      alert("TimeSheet added successfully");
      // Reset form or handle success
    } else {
      alert("Failed to add TimeSheet");
      // Handle error
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add Time Sheet
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={timeSheet.employeeCode}
                onChange={handleEmployeeChange}
                label="Select Employee"
              >
                {employees.map((employee) => (
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Employee Code"
              name="employeeCode"
              value={timeSheet.employeeCode}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="First In"
              name="firstIn"
              InputLabelProps={{ shrink: true }}
              value={timeSheet.punchIn}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="First Out"
              name="firstOut"
              InputLabelProps={{ shrink: true }}
              value={timeSheet.punchIn}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select BreakType</InputLabel>
              <Select
                value={timeSheet.breakTypeId}
                // onChange={handleEmployeeChange}
                label="Break Type"
              >
                {breakTimeTypes.map((breakType) => (
                  <MenuItem
                    key={breakType.id}
                    value={breakType.id}
                  >
                    {breakType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              fullWidth
              label="Assigned Shift"
              name="assignedShift"
              value={timeSheet.assignedShift}
              onChange={handleChange}
            />
          </Grid> */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={timeSheet.date}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddTimeSheet;


