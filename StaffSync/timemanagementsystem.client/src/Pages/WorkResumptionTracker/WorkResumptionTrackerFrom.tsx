import { CloudSyncOutlined } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone';

interface Employee {
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: { departmentId: number; name: string };
    positionCode: { positionCodeId: number; name: string };
  }

type Props = {}

const WorkResumptionTrackerFrom = (props: Props) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(false);



  const handleEmployeeChange = (event: SelectChangeEvent) => {
    const employeeCode = event.target.value;
    setSelectedEmployee(employeeCode); // Keep track of the selected employee code for display

    // Set the selected employee's department and position as current in the form
    const selectedEmployee = allEmployees.find(
      (e) => e.employeeCode === employeeCode
    );
    if (selectedEmployee) {
      // Update formData with the employeeCode and current department/position IDs for submission
      setFormData((prev: any) => ({
        ...prev,
        employeeCode: employeeCode,
      }));
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    if (files.length <= 1) {
      setUploadProgress(0);
    }
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles); // Handle multiple files
    // For demonstration, set uploadProgress to 60
    setUploadProgress(60);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
  
    // Update the state based on the input field name
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "image/jpeg": [],
      "application/pdf": [],
    },
    multiple: true, // Enable multiple file uploads
  });
  
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOffline(event.target.checked);
    if (!event.target.checked) {
      setFiles([]);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-h-[60vh] overflow-auto p-4 bg-white shadow-md rounded-lg">
      <form className="grid grid-cols-1 gap-4 p-4 ">
  <Grid item xs={12}>
    <div className="flex flex-col">
      <InputLabel htmlFor="employee-select-label">Employee Code</InputLabel>
      <Select
        labelId="employee-select-label"
        id="employee-select"
        value={selectedEmployee}
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
    </div>
  </Grid>

  <Grid item xs={12}>
    <div className="flex flex-col">
      <InputLabel htmlFor="dateOfAbsences">Date Of Absences</InputLabel>
      <TextField
        type="date"
        id="dateOfAbsences"
        name="dateOfAbsences"
        value={formData.dateOfAbsences || ""}
        onChange={handleFormChange}
        required
        fullWidth
      />
    </div>
  </Grid>

  <Grid item xs={12}>
    <div className="flex flex-col">
      <InputLabel htmlFor="adminHearingDate">Admin Hearing Date</InputLabel>
      <TextField
        type="date"
        id="adminHearingDate"
        name="adminHearingDate"
        value={formData.adminHearingDate || ""}
        onChange={handleFormChange}
        fullWidth
      />
    </div>
  </Grid>

  <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox checked={isOffline} onChange={handleCheckboxChange} />
              }
              label="Offline Submission"
            />
          </Grid>

          <Grid item xs={12} className="flex justify-center items-center p-4">
            <div
              {...getRootProps({ className: "dropzone" })}
              className="flex flex-col justify-center items-center p-10 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 ease-in-out space-y-4"
            >
              <input {...getInputProps()} />
              <CloudSyncOutlined
                className="text-blue-500 animate-bounce"
                style={{ fontSize: 60 }}
              />
              <Typography className="text-gray-800 text-base font-medium">
                Drag 'n' drop some files here, or click to select files
              </Typography>
              <Typography className="text-gray-500 text-sm">
                Support for multiple files (PDF, JPEG)
              </Typography>
            </div>
            {files.map((file, index) => (
              <div key={index} className="mt-4 flex flex-col items-center">
                <Typography className="text-gray-800 font-semibold">
                  {file.name} - {uploadProgress}%
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleRemoveFile(file.name)}
                  className="mt-4"
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
              </div>
            ))}
          </Grid>
</form>
    </div>
  )
}

export default WorkResumptionTrackerFrom