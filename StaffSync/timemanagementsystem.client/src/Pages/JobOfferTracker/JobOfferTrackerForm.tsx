import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Props = {};

interface JobOffer {
  id: number;
  name: string;
  position: string;
  location: string;
  salary: number;
  status: string;
  interviewScore: number;
}

const initialFormData: Partial<JobOffer> = {
  name: "",
  position: "",
  location: "",
  salary: 0,
  status: "",
  interviewScore: 0,
};

const JobOfferTrackerForm = (props: Props) => {
  const [formData, setFormData] = useState<Partial<JobOffer>>(initialFormData);
  const [selectedRow, setSelectedRow] = useState<JobOffer | null>(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (selectedRow) {
        await fetchWithAuth(`${API_URL}/JobOfferTrackers/${selectedRow.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetchWithAuth(`${API_URL}/JobOfferTrackers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }
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
        onClose: () => navigate("/joboffertracker"), // Navigate to "/joboffertracker" after success
      });
    } catch (error) {
      console.error("Error updating/adding job offer:", error);
      toast.error("There was a problem with your submission.");
    }
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      status: value,
    }));
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Box className="grid grid-cols-1 overflow-auto">
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          required
          margin="normal"
        />
        <TextField
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleFormChange}
          required
          margin="normal"
        />
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleFormChange}
          margin="normal"
        />
        <TextField
          type="number"
          label="Salary"
          name="salary"
          value={formData.salary}
          onChange={handleFormChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={handleSelectChange}
            required
          >
            <MenuItem value="0">Not Sent</MenuItem>
            <MenuItem value="1">Sent</MenuItem>
            <MenuItem value="2">Negotiating</MenuItem>
            <MenuItem value="3">Accepted</MenuItem>
            <MenuItem value="4">Rejected</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="Interview Score"
          name="interviewScore"
          value={formData.interviewScore}
          onChange={handleFormChange}
          margin="normal"
        />
        <div className="flex justify-end">
          <Button type="submit" variant="contained" color="primary">
            {selectedRow ? "Update" : "Add"}
          </Button>
        </div>
      </Box>
    </form>
  );
};

export default JobOfferTrackerForm;
