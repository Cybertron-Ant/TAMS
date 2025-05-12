import {
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../app/fetchWrapper";
import { toast } from "react-toastify";
import { Department } from "../interfaces/Employee";

type Props = {
  open: boolean;
  onClose?: () => void;
  resource: Department;
  isOperationSuccessfull: (state: boolean) => void;
};

const TransferDepartment: React.FC<Props> = ({
  open,
  onClose,
  resource,
  isOperationSuccessfull,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState(0);
  const [newDepartment, setNewDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    getDepartments().then((value: any) => {
      setCurrentDepartment(resource.departmentId);
    });
  }, []);

  const handleClose = () => {
    onClose?.();
  };

  const getDepartments = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Departments`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        const err = await response.json();
        console.error("Unable to fetch departments", err);
      } else {
        setDepartments(data);
      }
    } catch (error) {
      console.error("Unable to fetch departments", error);
    }
  };

  const updateEmployeeDepartments = async (formData: {
    currentDepartmentId: number;
    newDepartmentId: number;
  }) => {
    try {
      setIsLoading(true);

      const response = await fetchWithAuth(
        `${API_URL}/Employees/MoveEmployeesDepartment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Unable to move employees to new department", data);
        toast.error(data['message']);
      } else {
        isOperationSuccessfull(true);
        toast.success(data['message']);
      }
    } catch (error) {
      console.error("Unable to move employees to new department", error);
      isOperationSuccessfull(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = {
              currentDepartmentId: currentDepartment,
              newDepartmentId: newDepartment,
            };

            // move employees to new department here
            updateEmployeeDepartments(formData);

            handleClose()
          },
        }}
      >
        <DialogTitle>Reassign Employees</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Before deleting the current department, please select a new
            department to transfer the associated employees to.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: "15px" }}>
            <InputLabel id="select-current-department-label">
              Current Department
            </InputLabel>
            <Select
              disabled
              labelId="select-current-department-label"
              id="select-current-department"
              name="current-department"
              value={currentDepartment}
              label="Current Department"
              onChange={(event) =>
                setCurrentDepartment(event.target.value as number)
              }
            >
              {departments && departments.map((department: Department) => (
                <MenuItem
                  key={department.departmentId}
                  value={department.departmentId}
                >
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            disablePortal
            fullWidth
            autoFocus
            id="select-new-department"
            options={departments.filter(
              (department: Department) =>
                department.departmentId !== currentDepartment
            )}
            sx={{ mt: "15px" }}
            getOptionLabel={(department) => department.name}
            onChange={(
              _event: React.SyntheticEvent<Element, Event>,
              value: Department
            ) => {
              console.log(value.departmentId);
              setNewDepartment(value.departmentId);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                value={newDepartment}
                name="departmentId"
                label="New Department"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} sx={{ mx: "5px" }} />
            ) : (
              <></>
            )}
            Reassign & Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferDepartment;
