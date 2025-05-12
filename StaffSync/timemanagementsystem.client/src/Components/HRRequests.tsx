import React, { useEffect, useState } from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../app/fetchWrapper"; // Adjust the import path as needed
import { toast } from "react-toastify";
import PermissionManager from "../app/PermissionManager ";
import { hasRoles } from "../app/roleManager";
import Roles from "../enums/Roles";

const HRRequests = () => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const AWS_S3_URL = import.meta.env.VITE_HRMS_S3_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const [typeHRRequests, setTypeHRRequests] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: 0,
    typeHRRequestId: "",
    docLink: "",
    requestDate: "",
    sentDocDate: "",
    employeeCode: "",
    typeHRRequest: {
      id: 0,
      type: "",
    },
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    const initData = async () => {
      fetchTypeHRRequests();
      fetchEmployees();

      if (location.state && location.state.request) {
        const { request } = location.state;
        setFormData({
          id: request.id || 0,
          typeHRRequestId: request.typeHRRequest.id.toString(), // Ensure this is set correctly as a string
          docLink: request.docLink || "",
          requestDate: request.requestDate,
          sentDocDate: request.sentDocDate || "",
          employeeCode: request.employeeCode,
          typeHRRequest: {
            id: request.typeHRRequest.id || 0,
            type: request.typeHRRequest.type,
          },
        });
        setIsUpdateMode(true);
      }

      if (
        !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])
      ) {
        handleInputChange("employeeCode", employeeObj.employeeCode);
      }
    };

    initData();
  }, [location.state]);

  const fetchTypeHRRequests = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/TypeHRRequest`);
      const data = await response.json();
      setTypeHRRequests(data);
    } catch (error) {
      console.error("Error fetching TypeHRRequests:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Employees/List/${employeeObj.employeeCode}`);
      const data = await response.json();
      setAllEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const endpoint = isUpdateMode
      ? `${API_URL}/HRRequest/${formData.id}`
      : `${API_URL}/HRRequest/${formData.employeeCode}`;
    const method = isUpdateMode ? "PUT" : "POST";

    try {
      const response = await fetchWithAuth(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sentDocDate: new Date().toISOString(),
          requestDate: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to process HR request");
      toast.success(
        `HR Request ${isUpdateMode ? "updated" : "submitted"} successfully`
      );
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error(
        `Error ${isUpdateMode ? "updating" : "submitting"} HR request:`,
        error
      );
      toast.error(
        `Error ${isUpdateMode ? "updating" : "submitting"} HR request.`
      );
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetchWithAuth(`${AWS_S3_URL}/S3/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const result = await response.json();
      setFormData((prev) => ({ ...prev, docLink: result.previewUrl }));
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    }
  };

  const employeeObj = PermissionManager.EmployeeObj();

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="employee-select-label">
                  Select Employee
                </InputLabel>
                <Select
                  labelId="employee-select-label"
                  value={formData.employeeCode}
                  onChange={(e) =>
                    handleInputChange("employeeCode", e.target.value)
                  }
                  label="Select Employee"
                  disabled={isUpdateMode || !hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
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
            <Grid item xs={12}>
              <TextField
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                fullWidth
                label="Employee Code"
                value={formData.employeeCode}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="hr-request-type-label">
                  HR Request Type
                </InputLabel>
                <Select
                  labelId="hr-request-type-label"
                  value={formData.typeHRRequestId} // This should reflect the ID
                  onChange={(e) =>
                    handleInputChange("typeHRRequestId", e.target.value)
                  }
                  label="HR Request Type"
                >
                  {typeHRRequests.map((request) => (
                    <MenuItem key={request.id} value={request.id.toString()}>
                      {request.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])}
                fullWidth
                label="Document Link"
                value={formData.docLink}
                onChange={(e) => handleInputChange("docLink", e.target.value)}
                InputProps={{ readOnly: true }}
              />
              {!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) ? (
                ""
              ) : (
                <div className="mt-4">
                  <input type="file" onChange={handleFileChange} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={uploadFile}
                  >
                    Upload File
                  </Button>
                </div>
              )}
            </Grid>
            <Grid item xs={12}>
              {/* Render the submit button under the following conditions:
      - User is an 'Employee', not in update mode, and no document has been uploaded yet.
      - User is 'Super Admin' or 'HR Manager Admin' regardless of update mode or document link status. */}
              {((!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) &&
                !isUpdateMode &&
                formData.docLink === "") ||
                hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin])) && (
                <Button type="submit" variant="contained" color="primary">
                  {isUpdateMode ? "Update Request" : "Submit Request"}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

export default HRRequests;
