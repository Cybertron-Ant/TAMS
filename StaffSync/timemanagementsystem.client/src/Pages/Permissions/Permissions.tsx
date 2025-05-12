import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../app/fetchWrapper";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Modal,
  Box,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import { toast } from "react-toastify";
import PermissionManager from "../../app/PermissionManager ";
import AccountHelper from "../../app/accountHelper";

interface Permission {
  permissionId: number;
  permissionName: string;
  authLevelId: number;
}

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: { departmentId: number; name: string };
  positionCode: { positionCodeId: number; name: string };
}

interface EmployeePermission {
  employeeId: string;
  permissionId: number;
  authLevelId: number;
}

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedPermissions, setSelectedPermissions] = useState<
    EmployeePermission[]
  >([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [employeePermissions, setEmployeePermissions] = useState<
    EmployeePermission[]
  >([]);
  const [selectValues, setSelectValues] = useState<{ [key: number]: number }>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchPermissions();
  }, [selectedEmployee]);

  const fetchPermissions = async () => {
    try {
      const permissionResponse = await fetchWithAuth(`${API_URL}/Permissions`);
      if (!permissionResponse.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const permissionData = await permissionResponse.json();
      setPermissions(permissionData);

      const employeeResponse = await fetchWithAuth(`${API_URL}/Employees`);
      if (!employeeResponse.ok) {
        throw new Error("Failed to fetch employees");
      }
      const employeeData = await employeeResponse.json();
      setAllEmployees(employeeData);

      if (selectedEmployee) {
        await fetchEmployeePermissionIds(selectedEmployee.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchEmployeePermissionIds = async (employeeId: string) => {
    try {
      const employeePermissionResponse = await fetchWithAuth(
        `${API_URL}/EmployeePermissions/${employeeId}`
      );

      if (!employeePermissionResponse.ok) {
        throw new Error("Failed to fetch employee permissions");
      }

      const employeePermissionData: EmployeePermission[] =
        await employeePermissionResponse.json();

      setEmployeePermissions(employeePermissionData);

      const initialValues: { [key: number]: number } = {};
      employeePermissionData.forEach((perm) => {
        initialValues[perm.permissionId] = perm.authLevelId;
      });
      setSelectValues(initialValues);
    } catch (error) {
      console.error("Error fetching employee permissions:", error);
      setEmployeePermissions([]);
      setSelectValues({});
    }
  };

  const handleEmployeeChange = async (event: any, employee: Employee | any) => {
    if (employee == null) return;
    const employeeCode = employee.employeeCode;
    const newSelectedEmployee =
      allEmployees.find((e) => e.employeeCode === employeeCode) || null;

    setSelectedEmployee(newSelectedEmployee);
    setSelectedPermissions([]); // Reset selected permissions
    setHasChanges(false); // Reset changes flag

    if (newSelectedEmployee) {
      await fetchEmployeePermissionIds(newSelectedEmployee.id);
    }
  };

  const handleSelectChange = (permissionId: number, value: number) => {
    const existingPermission = employeePermissions.find(
      (perm) => perm.permissionId === permissionId
    );
    const currentValue = selectValues[permissionId];

    // Check if the new value is different from the current value
    setHasChanges(true); // This ensures the button shows up when there's a change

    // Update selectValues for immediate UI feedback
    setSelectValues((prev) => ({
      ...prev,
      [permissionId]: value,
    }));

    // Update selectedPermissions state to reflect the change
    const updatedPermissions = selectedPermissions.map((perm) =>
      perm.permissionId === permissionId
        ? { ...perm, authLevelId: value }
        : perm
    );

    // If the permission doesn't exist in the list, add it
    if (
      !updatedPermissions.some((perm) => perm.permissionId === permissionId)
    ) {
      updatedPermissions.push({
        employeeId: selectedEmployee?.id || "",
        permissionId: permissionId,
        authLevelId: value,
      });
    }

    setSelectedPermissions(updatedPermissions);
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error("Select an employee first.");
      return;
    }

    const response = await fetchWithAuth(
      `${API_URL}/EmployeePermissions/CreateMultiple`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPermissions),
      }
    );

    if (response.ok) {
      setHasChanges(false); // Reset the change tracker
      toast.success("Permissions updated successfully.");
      fetchEmployeePermissionIds(selectedEmployee.id);
      await AccountHelper.refreshAccountInformation();
    } else {
      toast.error("Failed to update permissions.");
    }
  };

  const savePermission = async (selectedEmployee, permissionId) => {
    try {
      if (!selectedEmployee) {
        toast.warning("No employee selected.");
        return;
      }

      // Check if the permission already exists at the desired auth level
      const existingPerm = employeePermissions.find(
        (perm) =>
          perm.permissionId === permissionId &&
          perm.authLevelId === selectValues[permissionId]
      );
      if (existingPerm) {
        toast.info(
          "This permission at the required level is already assigned."
        );
        return; // Exit if the exact permission level already exists
      }

      // Set initial authLevelId based on the UI selection or default to 1
      const initialAuthLevelId = selectValues[permissionId] || 1;

      const newPermission = {
        employeeId: selectedEmployee.id,
        permissionId: permissionId,
        authLevelId: initialAuthLevelId, // Use the current selection or default
      };

      // Add the new permission if it's not already present or at a different level
      setSelectedPermissions((prevPermissions) => {
        // Check if the permission already exists at a different level
        const index = prevPermissions.findIndex(
          (perm) => perm.permissionId === permissionId
        );
        if (index > -1) {
          // Update existing permission authLevelId if found
          const updatedPermissions = [...prevPermissions];
          updatedPermissions[index] = newPermission;
          return updatedPermissions;
        } else {
          // Add as new permission if not found
          return [...prevPermissions, newPermission];
        }
      });

      // Ensure selectValues is updated
      setSelectValues((prevValues) => ({
        ...prevValues,
        [permissionId]: initialAuthLevelId,
      }));

      toast.success("Permission added or updated, select authority level now.");
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error("Failed to save permission.");
    }
  };

  const handleRemovePermissions = async (selectedEmployee: Employee, permissionId: number) => {
    try {
      if (!selectedEmployee || !permissionId) {
        throw new Error("No employee or permission selected.");
      }
      const response = await fetchWithAuth(
        `${API_URL}/EmployeePermissions/${selectedEmployee.id}/${permissionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchPermissions();
      const { userId } = PermissionManager.EmployeeObj();
      if (response.ok) {
        // Update UI or perform any necessary actions upon successful deletion
        toast.success("Permission deleted successfully");

        if (selectedEmployee.id == userId) {
          await AccountHelper.refreshAccountInformation();
        }
      } else {
        throw new Error("Failed to delete permission.");
      }
    } catch (error) {
      // console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission.");
    }
  };

  const makeSuperAdmin = async () => {
    if (!selectedEmployee) {
      toast.error("No employee selected.");
      return;
    }

    const superAdminPermissions = permissions.reduce((acc, permission) => {
      // Check if the permission is already set to manager level
      const existingPerm = employeePermissions.find(
        (perm) => perm.permissionId === permission.permissionId
      );
      if (!existingPerm || existingPerm.authLevelId !== 3) {
        acc.push({
          employeeId: selectedEmployee.id,
          permissionId: permission.permissionId,
          authLevelId: 3,
        });
      }
      return acc;
    }, []);

    if (superAdminPermissions.length === 0) {
      toast.info("All permissions are already set to manager level.");
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${API_URL}/EmployeePermissions/CreateMultiple`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(superAdminPermissions),
        }
      );

      if (response.ok) {
        toast.success("Super Admin permissions set successfully");
        fetchEmployeePermissionIds(selectedEmployee.id); // Refresh permissions display
      } else {
        const errMsg = await response.text(); // Handle the response appropriately
        throw new Error(`Failed to set Super Admin permissions: ${errMsg}`);
      }
    } catch (error) {
      console.error("Error setting Super Admin permissions:", error);
      toast.error("Failed to set Super Admin permissions");
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Permissions
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Permissions</span>
        </div>
      </div>
      <form onSubmit={handleSavePermissions}>
        <div className="p-4 bg-white flex flex-col rounded-md">
          <Autocomplete
            disablePortal
            id="employee-select"
            options={allEmployees.sort(
              (a, b) => -b.firstName.localeCompare(a.firstName)
            )}
            onChange={handleEmployeeChange}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`
            }
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField {...params} label="Select Employee" />
            )}
          />
          <div className="mt-5 ">
            <Button
              onClick={makeSuperAdmin}
              variant="contained"
              color="primary"
            >
              Make Super Admin
            </Button>
          </div>
         
          <div className="grid grid-cols-3 gap-4 p-8">
            {permissions.map((permission: Permission) => {
              const isChecked = employeePermissions.some(
                (perm) => perm.permissionId === permission.permissionId
              );

              const isAdded = selectedPermissions.some(
                (perm) => perm.permissionId === permission.permissionId
              );
              return (
                <div
                  key={permission.permissionId}
                  className="flex flex-col space-y-2"
                >
                  <div className="grid grid-cols-6 space-x-2 items-center">
                    <div className="col-span-2 flex space-x-2 items-center overflow-hidden">
                      <label
                        htmlFor={String(permission.permissionId)}
                        className="ml-2"
                      >
                        {permission.permissionName}
                      </label>
                    </div>
                    <div className="col-span-2 flex space-x-2 items-center">
                      <select
                        disabled={
                          !isChecked &&
                          !selectedPermissions.some(
                            (perm) =>
                              perm.permissionId === permission.permissionId
                          )
                        }
                        name={`select-${permission.permissionId}`}
                        id={`select-${permission.permissionId}`}
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
                        value={selectValues[permission.permissionId] || ""} // Default to 1 if not set
                        onChange={(e) => {
                          handleSelectChange(
                            permission.permissionId,
                            parseInt(e.target.value)
                          );
                        }}
                      >
                        <option value={1}>Viewer</option>
                        <option value={2}>Editor</option>
                        <option value={3}>Manager</option>
                      </select>
                    </div>
                    <div className="col-span- flex items-center">
                      <IconButton
                        disabled={isChecked || isAdded}
                        onClick={() =>
                          savePermission(
                            selectedEmployee,
                            permission.permissionId
                          )
                        }
                      >
                        {isChecked || isAdded ? (
                          <CheckCircleIcon className="text-green-500" />
                        ) : (
                          <AddCircleIcon />
                        )}
                      </IconButton>
                      {isChecked || isAdded ? (
                        <IconButton
                          onClick={() =>
                            handleRemovePermissions(
                              selectedEmployee,
                              permission.permissionId
                            )
                          }
                        >
                          <RemoveCircleIcon className="text-red-500" />
                        </IconButton>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            {hasChanges && selectedEmployee && (
              <button
                type="submit"
                className="mt-4 px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              >
                {selectedPermissions.some((perm) =>
                  employeePermissions.some(
                    (ePerm) =>
                      ePerm.permissionId === perm.permissionId &&
                      ePerm.authLevelId !== perm.authLevelId
                  )
                )
                  ? "Update Permissions"
                  : "Save New Permissions"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Permissions;
