import React, { useState, useEffect } from "react";
import {
  Grid,
  FormControl,
  TextField,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { formatDate } from "../../app/utils";
import { Employee, Gender } from "../../interfaces/Employee";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_TMS_PROD;

interface FormData extends Employee {
  password: string;
  confirmPassword: string;
  userName: string;
}

const EditEmployeeForm = ({ viewedEmployee }) => {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [formData, setFormData] = useState<Partial<FormData>>({
    firstName: "",
    lastName: "",
    email: "",
    genderId: 0,
    middleName: "",
    nameSuffix: "",
    mobileNo: "",
    immediateSuperior: "",
    addressForeign: "",
    birthDate: "",
    emailAddress: "",
  });

  useEffect(() => {
    const fetchGenders = async () => {
      const response = await fetchWithAuth(`${API_URL}/Genders`);
      const data: Gender[] = await response.json();
      setGenders(data);
    };

    const updateEmployee = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/Employees/${viewedEmployee.employeeCode}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      }
      );

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message);
      } else{
        toast.error(result.message);
      }

      } catch (error) {
        console.error(error)
      }

    }

    fetchGenders();
  }, []);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
    console.log(formData)
  };
  console.log(viewedEmployee)

  return (
    <Grid item xs={12} className="w-full bg-white rounded-lg p-7">
      <h2>Edit Employee</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Render form fields */}
        <FormControl fullWidth>
          <TextField
            disabled
            label="Employee Code"
            value={viewedEmployee?.employeeCode || ""}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Phone"
            value={formData?.mobileNo == "" ? viewedEmployee?.mobileNo : ""}
            onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Name Suffix</InputLabel>
          <TextField
            name="nameSuffix"
            id="nameSuffix"
            value={formData?.nameSuffix == "" ? viewedEmployee?.nameSuffix : ""}
            label="Name Suffix"
            placeholder="Name Suffix"
            variant="outlined"
            onChange={(e) =>
              handleFieldChange("nameSuffix", e.target.value as string)
            }
          />

        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="First Name"
            value={formData?.firstName == "" ? viewedEmployee?.firstName : ""}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Last Name"
            value={formData?.lastName == "" ? viewedEmployee?.lastName : ""}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            type={"date"}
            disabled
            label="Joined Date"
            value={viewedEmployee?.dateHired || ""}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Email"
            type="email"
            value={formData?.email == "" ? viewedEmployee?.email : ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            type={"date"}
            label="Birthday"
            value={formData?.birthDate == "" ? viewedEmployee?.birthDate : ""}
            onChange={(e) => handleFieldChange("birthDate", e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Address"
            value={formData?.addressForeign == "" ? viewedEmployee?.addressForeign : ""}
            onChange={(e) =>
              handleFieldChange("addressForeign", e.target.value)
            }
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            id="gender"
            value={formData?.genderId == 0 ? viewedEmployee?.genderId : ""}
            label="Gender"
            placeholder="Gender"
            variant="outlined"
            onChange={(e) =>
              handleFieldChange("gender", e.target.value as string)
            }
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="1">Male</MenuItem>
            <MenuItem value="2">Female</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Report to"
            value={formData?.immediateSuperior == "" ? viewedEmployee?.immediateSuperior : ""}
            onChange={(e) =>
              handleFieldChange("immediateSuperior", e.target.value)
            }
          />
        </FormControl>
      </div>
    </Grid>
  );
};

export default EditEmployeeForm;
