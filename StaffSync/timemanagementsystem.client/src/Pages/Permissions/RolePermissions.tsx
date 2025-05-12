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
} from "@mui/material";
import { toast } from "react-toastify";

interface Permission {
  permissionId: number;
  permissionName: string;
  authLevelId: number;
}
interface RolePermission{
  roleId: string;
  permissionId: number;
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

interface Role {
  id:string;
  name: string;
  normalizedName: string;
}


const RolePermissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    null
  );
  const [selectedPermissions, setSelectedPermissions] = useState<
    RolePermission[]
  >([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [selectValues, setSelectValues] = useState<{ [key: number]: number }>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchPermissions();
    fetchAllRoles();
  }, [selectedRole]);

  // Fetches all permissions and set the permissions data state.
  const fetchPermissions = async () => {
    try {
      const permissionResponse = await fetchWithAuth(`${API_URL}/Permissions`);
      if (!permissionResponse.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const permissionData = await permissionResponse.json();
      setPermissions(permissionData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetchess all roles and set the role data state.
  const fetchAllRoles = async () => {
    try {
      const roles = await fetchWithAuth(
        `${API_URL}/Account/roles`
      );
      if (!roles.ok) {
        throw new Error("Failed to fetch employees");
      }
      const rolesData = await roles.json();
      setAllRoles(rolesData);
    } catch (error) {
      console.error("Error fetching employee permissions:", error);
      setAllRoles([]);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const rolePermissions = await fetchWithAuth(
        `${API_URL}/rolepermissions/${roleId}`
      );

      if (!rolePermissions.ok) {
        throw new Error("Failed to fetch employee permissions");
      }

      const rolePermissionsData: RolePermission[] =
        await rolePermissions.json();

      setRolePermissions(rolePermissionsData);

      const initialValues: { [key: number]: number } = {};
      rolePermissionsData.forEach((perm) => {
        initialValues[perm.permissionId] = perm.authLevelId;
      });
      setSelectValues(initialValues);
    } catch (error) {
      console.error("Error fetching employee permissions:", error);
      setRolePermissions([]);
      setSelectValues({});
    }
  };

  const handleRoleChange = async (event: SelectChangeEvent) => {
    const roleId = event.target.value;
    console.log("RoleID: ", roleId)

    const newselectedRole =
      allRoles.find((r) => r.id === roleId) || null;

    setSelectedRole(newselectedRole);
    setSelectedPermissions([]); // Reset selected permissions
    setHasChanges(false); // Reset changes flag
    console.log(newselectedRole)
    if (newselectedRole) {
      await fetchRolePermissions(newselectedRole.id);
    }
  };

  const handleSelectChange = (permissionId: number, value: number) => {
    const existingPermission = rolePermissions.find(
      (perm) => perm.permissionId === permissionId
    );
    const currentValue = selectValues[permissionId];

    // Check if the new value is different from the current value
    if (value !== currentValue) {
      setHasChanges(true); // This ensures the button shows up when there's a change
    }

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
        roleId: selectedRole?.id || "",
        permissionId: permissionId,
        authLevelId: value,
      });
    }

    setSelectedPermissions(updatedPermissions);
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Select a role first.");
      return;
    }

    const response = await fetchWithAuth(
      `${API_URL}/RolePermissions/${selectedRole.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPermissions),
      }
    );

    if (response.ok) {
      setHasChanges(false); // Reset the change tracker
      toast.success("Permissions updated successfully.");
      fetchRolePermissions(selectedRole.id);
    } else {
      toast.error("Failed to update permissions.");
    }
  };

  const savePermission = async (selectedRole, permissionId) => {
    try {
      if (!selectedRole) {
        toast.warning("No role selected.");
        return;
      }

      // Check if the permission already exists at the desired auth level
      const existingPerm = rolePermissions.find(
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
        roleId: selectedRole.id,
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
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error("Failed to save permission.");
    }
  };

  const handleRemovePermissions = async (selectedRole:Role, permissionId) => {
    try {
      if (!selectedRole || !permissionId) {
        throw new Error("No role or permission selected.");
      }

      const response = await fetchWithAuth(
        `${API_URL}/RolePermissions/${selectedRole.id}/${permissionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchRolePermissions(selectedRole.id);

      if (response.ok) {
        // Update UI or perform any necessary actions upon successful deletion
        toast.success("Permission deleted successfully");
      } else {
        throw new Error("Failed to delete permission.");
      }
    } catch (error) {
      // console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission.");
    }
  };


  return (
    <div className="mb-4">
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Role Permissions
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>RolePermissions</span>
        </div>
      </div>
      <form onSubmit={handleSavePermissions}>
        <div className="p-4 bg-white flex flex-col rounded-md">
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole ? selectedRole.id : ""}
              label="Select Role"
              onChange={handleRoleChange}
            >
              {allRoles.map((role) => (
                <MenuItem
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="grid grid-cols-3 gap-4 p-8">
            {permissions.map((permission: Permission) => {
              const isChecked = rolePermissions.some(
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
                            selectedRole,
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
                              selectedRole,
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
            {selectedRole && (
              <button
                type="submit"
                className="mt-4 px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              >
                Update Role Permissions
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RolePermissions;
