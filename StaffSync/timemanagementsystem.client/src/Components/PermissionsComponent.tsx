import React, { useState } from 'react';

interface Permission {
  permissionId: number;
  permissionName: string;
}

interface EmployeePermission {
  employeeId: string;
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

interface PermissionsComponentProps {
  selectEmployee: Employee | null;
  value: number;
}

const PermissionsComponent: React.FC<PermissionsComponentProps> = (props) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employeePermissions, setEmployeePermissions] = useState<EmployeePermission[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Update selectedEmployee when props.selectEmployee changes
  React.useEffect(() => {
    setSelectedEmployee(props.selectEmployee);
  }, [props.selectEmployee]);

  const handleCheckboxChange = (permissionId: number, isChecked: boolean) => {
    if (selectedEmployee) {
      const updatedPermissions = isChecked
        ? [
            ...employeePermissions,
            { employeeId: selectedEmployee.id, permissionId, authLevelId: 1 },
          ]
        : employeePermissions.filter(
            (permission) => permission.permissionId !== permissionId
          );
      setEmployeePermissions(updatedPermissions);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-8">
        {props.value}
        <p>{permissions.toString()}</p>
        
      {permissions.map((permission: Permission) => {
        const isChecked = employeePermissions.some(
          (empPermission) => empPermission.permissionId === permission.permissionId
        );
        return (
          <div key={permission.permissionId} className="flex flex-col space-y-2">
            <div className="grid grid-cols-4 space-x-2 items-center">
              <div className="col-span-3 flex space-x-2 items-center">
                <input
                  type="checkbox"
                  id={String(permission.permissionId)}
                  defaultChecked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(permission.permissionId, e.target.checked)
                  }
                />
                <label htmlFor={String(permission.permissionId)} className="ml-2">
                  {permission.permissionName}
                </label>
              </div>
              <div className="col-span-1 flex space-x-2 items-center">
                <select
                  name={`select-${permission.permissionId}`}
                  id={`select-${permission.permissionId}`}
                  className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  value={employeePermissions.find(
                    (empPermission) => empPermission.permissionId === permission.permissionId
                  )?.authLevelId || 1}
                  onChange={(e) => {
                    const authLevelId = parseInt(e.target.value);
                    setEmployeePermissions((prevPermissions) =>
                      prevPermissions.map((perm) =>
                        perm.permissionId === permission.permissionId
                          ? { ...perm, authLevelId }
                          : perm
                      )
                    );
                  }}
                >
                  <option value={1}>Viewer</option>
                  <option value={2}>Editor</option>
                  <option value={3}>Manager</option>
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionsComponent;
