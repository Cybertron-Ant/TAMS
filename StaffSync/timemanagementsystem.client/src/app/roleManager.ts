import Roles from "../enums/Roles";
import PermissionManager from "./PermissionManager ";

/**
 * Checks if the current employee has one of the specified roles.
 * This check is case-insensitive.
 *
 * @param roles - An array of roles to check against the employee's role.
 * @returns `true` if the employee has one of the specified roles, otherwise `false`.
 */
export const hasRoles = (roles: Roles[]): boolean => {
  const employee = PermissionManager.EmployeeObj();
  return (
    employee &&
    roles.some(
      (role: string) => role.toLowerCase() === employee.role.toLowerCase()
    )
  );
};

