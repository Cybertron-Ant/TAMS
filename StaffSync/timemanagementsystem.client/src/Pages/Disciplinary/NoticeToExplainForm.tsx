import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../app/fetchWrapper";

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
}

const NoticeToExplainForm: React.FC<{onClose:()=>void}> = ({onClose}) => {
  // Assume this is the employee code you want to preselect
  const preselectedEmployeeCode = "EMP-20240227235109-4488";
  const [employeeCode, setEmployeeCode] = useState(preselectedEmployeeCode);
  const [entryDate, setEntryDate] = useState("");
  const [dateSent, setDateSent] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const AWS_S3_URL = import.meta.env.VITE_HRMS_S3_URL;



  useEffect(() => {
    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/Employees`
        );
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees.");
      }
    };

    fetchEmployees();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return; // Return early if no file is selected
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetchWithAuth(
        `${AWS_S3_URL}/S3/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload file");

      const result = await response.json();
      console.log("here is the url " + result.previewUrl);
      if (result.previewUrl) {
        setFileLink(result.previewUrl); // Update the fileLink state immediately with the new URL
        toast.success("File uploaded successfully");
      } else {
        throw new Error("Preview URL is missing in the response.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    }

    console.log("ran");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await uploadFile;
    console.log("here is the file link " + fileLink);

    const payload = {
      employeeCode,
      entryDate,
      dateSent,
      fileLink,
      remarks,
    };

    try {
      const response = await fetchWithAuth(
        `${API_URL}/NoticeToExplain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit the notice");
      toast.success("Notice submitted successfully");
      navigate("/"); // Adjust the navigate path as needed
    } catch (error) {
      console.error("Error submitting the notice:", error);
      toast.error("Failed to submit the notice.");
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className="text-neutral-800 text-3xl font-bold">
              Notice To Explain
            </div>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">
                Select Employee
              </InputLabel>
              <Select
                labelId="employee-select-label"
                id="employee-select"
                value={employeeCode}
                label="Select Employee"
                onChange={(e) => setEmployeeCode(e.target.value)}
                // This makes the select disabled since we're using a read-only employee code field
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
              value={employeeCode}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Entry Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date Sent"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={dateSent}
              onChange={(e) => setDateSent(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="File Link"
              value={fileLink}
              InputProps={{
                readOnly: true, // Make the field readOnly if you don't want users to manually edit it
              }}
            />
            <Grid item xs={12}>
              <input type="file" onChange={handleFileChange} />
              <Button variant="contained" color="primary" onClick={uploadFile}>
                Upload File
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end" }}
            className="gap-2"
          ><Button variant="outlined" color="error" onClick= {onClose}>
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

export default NoticeToExplainForm;
