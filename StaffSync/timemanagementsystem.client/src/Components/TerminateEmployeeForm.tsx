import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../app/fetchWrapper";
import PermissionManager from "../app/PermissionManager ";
import { all } from "axios";
import { AttritionType } from "../enums/AttritionType";
import { hasRoles } from "../app/roleManager";
import Roles from "../enums/Roles";

interface Props {
  employeeCode?: string;
  attritionType: AttritionType;
  sendModalCloseRequest: (openModalState: boolean) => void;
}

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: { departmentId: number; name: string };
  positionCode: { positionCodeId: number; name: string };
}

interface ModeOfSeperation {
  modeOfSeparationId: string;
  name: string;
}

interface FormData {
  employeeCode: string;
  daEffDate: string;
  lastDayOfWork: string;
  modeOfSeparationId: string;
  reason: string;
}

const TerminateEmployeeForm: React.FC<Props> = ({
  employeeCode,
  attritionType,
  sendModalCloseRequest,
}) => {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allSeperations, setAllSeperations] = useState<ModeOfSeperation[]>([
    {
      modeOfSeparationId: "",
      name: "",
    },
  ]);
  const [formData, setFormData] = useState({
    employeeCode,
    daEffDate: "",
    lastDayOfWork: "",
    modeOfSeparationId: "",
    reason: "",
  });
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const employeeObj = PermissionManager.EmployeeObj();

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchModesOfSeperation = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/ModeOfSeparations`);
      if (!response.ok) throw new Error("Failed to fetch modes of seperation");
      const data: ModeOfSeperation[] = await response.json();
      setAllSeperations(data);

      if (!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])) {
        setFormData({
          ...formData,
          modeOfSeparationId: data.filter((record: ModeOfSeperation) =>
            record.name.toLowerCase().includes("resign")
          )[0].modeOfSeparationId,
        });
      }
    } catch (error) {
      console.error("Error fetching modes of seperation:", error);
    }
  };

  useEffect(() => {
    fetchModesOfSeperation();
  }, []);

  const terminateEmployee = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Employees/Terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to terminate employee");
      }

      toast.success("Employee Terminated!");
      // Send modal close request to parent component
      sendModalCloseRequest(false);
    } catch (error) {
      toast.error("Error terminating employee!");
      console.error("Error terminating employee:", error);
    }
  };

  return (
    <>
      <div className="py-2">
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">
                Select Employee
              </InputLabel>
              <Select
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                labelId="employee-select-label"
                id="employee-select"
                label="Select Employee"
                value={
                  !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])
                    ? employeeObj.employeeCode
                    : formData.employeeCode
                }
                onChange={(event) => {
                  const selectedCode = event.target.value;
                  setFormData({
                    ...formData,
                    employeeCode: selectedCode,
                  });
                }}
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

          <Grid item xs={6}>
            {allSeperations.length != 0 && (
              <FormControl fullWidth>
                <InputLabel id="mode-of-seperation-label">
                  Mode of Seperation
                </InputLabel>
                <Select
                  disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                  labelId="mode-of-seperation-label"
                  id="mode-of-seperation"
                  label="Select Employee"
                  value={formData.modeOfSeparationId}
                  onChange={(event) => {
                    const selectedCode = event.target.value;
                    setFormData({
                      ...formData,
                      modeOfSeparationId: selectedCode,
                    });
                  }}
                >
                  {allSeperations.map((mode) => (
                    <MenuItem
                      key={mode.modeOfSeparationId}
                      value={mode.modeOfSeparationId}
                    >
                      {mode.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          <Grid hidden item xs={6}>
            <TextField
              disabled={true}
              fullWidth
              label="EmployeeCode"
              name="employeeCode"
              value={formData.employeeCode}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Effective Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              name="daEffDate"
              onChange={(event) => {
                const selectedCode = event.target.value;
                setFormData({
                  ...formData,
                  daEffDate: selectedCode,
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Day Of Work"
              type="date"
              InputLabelProps={{ shrink: true }}
              name="lastDayOfWork"
              onChange={(event) => {
                const selectedCode = event.target.value;
                setFormData({
                  ...formData,
                  lastDayOfWork: selectedCode,
                });
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              type="text"
              name="reason"
              multiline={true}
              rows={4}
              onChange={(event) => {
                const selectedCode = event.target.value;
                setFormData({
                  ...formData,
                  reason: selectedCode,
                });
              }}
            />
          </Grid>
          <Grid item display="flex" justifyContent="end" xs={12}>
            <Button
              onClick={() => {
                sendModalCloseRequest(false);
              }}
              color="primary"
              variant="outlined"
            >
              No, Cancel
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              type="submit"
              onClick={terminateEmployee}
              color="error"
              variant="contained"
            >
              {!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])
                ? "Yes, Resign"
                : "Yes, Terminate"}
            </Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default TerminateEmployeeForm;
