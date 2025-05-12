import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../app/fetchWrapper";
import MfaModal from "../../AuthPages/MfaModal";
import { verifyLoginMfa } from "../../app/authSlice";
import { useDispatch } from "../../app/hooks";
import PermissionManager from "../../app/PermissionManager ";
import { formatDate, parseResponse, toTitleCase } from "../../app/utils";
import { BreakTime } from "../../interfaces/BreakTime";


const defaultTimeSheetData: TimeSheet = {
  id: 0,
  employeeCode: "",
  punchIn: "",
  punchOut: new Date().toLocaleTimeString(),
  breakTypeId: 1,
  isActive: false,
  date: new Date().toISOString(),
  firstName: "",
  lastName: "",
};

const TimeSheetForm: React.FC = () => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const location = useLocation();
  const navigate = useNavigate();
  const [timeSheetData, setTimeSheetData] = useState<TimeSheet>(defaultTimeSheetData);
  const [open, setOpen] = useState(false);
  const [isMFA, setIsMFA] = useState(false);
  const [breakTimeTypes, setBreakTimeTypes] = useState<BreakTime[]>([]);
  const { employeeCode, timesheetId } = location.state || {};

  const handleModal = () => {
    setOpen(!open);
  };

  const fetchBreakTimeTypes = () => {
    fetchWithAuth(
      `${API_URL}/BreakType`
    )
      .then(parseResponse)
      .then((data) => {
        if (data.success === false) {
          console.error("Error fetching Break Types:", data.message);
          setBreakTimeTypes([]);
        } else {
          setBreakTimeTypes(data);
          // setSelectedBreakType(data[0]); //This is because the clock in break type should be the first item in the list
        }
      })
      .catch((error) => {
        console.error("Error fetching active timesheet:", error);
        setBreakTimeTypes([]);
      });
  };

  useEffect(() => {
    // If editing, initialize form with existing data
    const stateData = location.state as { timeSheetData?: TimeSheet };
    console.log(stateData)
    if (stateData?.timeSheetData) {
      setTimeSheetData(stateData.timeSheetData);
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch specific timesheet data for editing
    const fetchTimeSheetData = async () => {
      if (employeeCode && timesheetId) {
        const url = `${API_URL}/TimeSheet/Details/${employeeCode}/${timesheetId}`;

        try {
          const response = await fetchWithAuth(url);
          const data = await response.json();

          if (response.ok) {
            setTimeSheetData(data);
          } else {
            throw new Error(
              `Failed to fetch timesheet data: ${response.statusText}`
            );
          }

        } catch (error) {
          console.error("Fetch error:", error);
          toast.error("Failed to load timesheet data.");
        }
      }
    };

    fetchTimeSheetData();
  }, [employeeCode, timesheetId]);

  useEffect(()=>{
    fetchBreakTimeTypes();

  }, []);

  const parseDateTime = (dateTimeStr: string): string => {
    // Create a new Date object from the input string
    const date = new Date(dateTimeStr);
  
    // Extract components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Format the date and time for the input element
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  
    return formattedDateTime;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type } = event.target;
    setTimeSheetData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : type === "checkbox" ? event.target.checked : value,

    }));

  };
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;

    setTimeSheetData({ ...timeSheetData, breakTypeId:parseInt(value, 10) });
    console.log(timeSheetData)
  };
  const submitLogic = async () => {
      // Check if employeeCode and id are present in timeSheetData
      if (timeSheetData.employeeCode && timeSheetData.id) {
        const url = `${API_URL}/TimeSheet/Update/${timeSheetData.employeeCode}/${timeSheetData.id}`;
        let data = timeSheetData;
        if(timeSheetData.isActive == true){
          data = {...data, punchOut: null} // didn't update state here because state is async so wont be updated by time request is sent
        }

        try {
          const response = await fetchWithAuth(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            let errorBody: {message:string} = await response.json();
            throw new Error(errorBody.message);
          }

          toast.success("Timesheet updated successfully!");
          navigate("/managetimesheet");
        } catch (error) {
          console.log(error);
          let message = error

          if(error.message){
            message = error.message;
          }
          toast.error(message);
        }
      } else {
        toast.error("Missing employee code or timesheet ID.");
      }   
  };

  // Corrected the onClick event type for the Button component
  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    submitLogic();
  };

  useEffect(() => {
    isMFA ? submitLogic() : null;
  }, [isMFA]);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
            <Button className="flex gap-2 items-center" onClick={()=> navigate("/managetimesheet")}>
              <ArrowBackIcon fontSize="large"></ArrowBackIcon> 
              <p>Back</p>
            </Button>
            <Typography variant="h4" gutterBottom>
              {timeSheetData.id ? "Edit Time Sheet" : "Add New Time Sheet"}
            </Typography>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Employee Code"
              name="employeeCode"
              disabled={true}
              value={timeSheetData.employeeCode}
              InputProps={{readOnly: true}}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Select BreakType</InputLabel>
              <Select
                value={timeSheetData.breakTypeId.toString()}
                label="Break Type"
                onChange={handleSelectChange}
              >
                {breakTimeTypes.map((breakType) => (
                  <MenuItem
                    key={breakType.id.toString()}
                    value={breakType.id.toString()}
                  >
                    {breakType.name}
                  </MenuItem>
                ))}
                
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              disabled={true}
              type="text"
              label="First Name"
              name="First Name"
              InputLabelProps={{ shrink: true }}
              InputProps={{readOnly: true}}
              value={timeSheetData.firstName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth

              type="text"
              label="Last Name"
              name="lastName"
              disabled={true}
              InputLabelProps={{ shrink: true, }}
              InputProps={{readOnly: true}}
              value={timeSheetData.lastName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="punch In"
              name="punchIn"
              InputLabelProps={{ shrink: true }}
              value={parseDateTime(timeSheetData.punchIn)}
              onChange={handleChange}

            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="punch Out"
              name="punchOut"
              InputLabelProps={{ shrink: true }}
              value={timeSheetData.isActive ? "" :parseDateTime(timeSheetData.punchOut ?? new Date().toLocaleTimeString())}
              onChange={handleChange}

            />
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
              value={formatDate(timeSheetData.date,{formatString: "yyyy-MM-dd"})}
              onChange={handleChange}

            />
          </Grid>
          <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    id="isActive"
                    checked={timeSheetData.isActive}
                    onChange={handleChange}
                  />
                }
                label="Timesheet Active"
              />
            </Grid>
         
        </Grid>
        <Grid item xs={12} container justifyContent="center">
          <Button variant="contained" color="primary" onClick={handleSubmit}>
          {timeSheetData.id ? "Update" : "Submit"}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default TimeSheetForm;
