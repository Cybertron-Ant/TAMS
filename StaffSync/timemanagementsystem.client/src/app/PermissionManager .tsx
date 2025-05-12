import Roles from "../enums/Roles";
import { Employee } from "../interfaces/Employee";

const PermissionManager = () => {
  const employee = getEmployeeFromSession();
  const userPermissions = employee ? employee.employeePermissions : [];

  return userPermissions;
};

const RoleManager = () => {
  const employee = getEmployeeFromSession();
  const roleManager = employee ? employee.role : "";

  return roleManager;
};

const EmployeeCode = () => {
  const employee = getEmployeeFromSession();
  const employeeCode = employee ? employee.employeeCode : "";

  return employeeCode;
};

const EmployeeObj = () => {
  const employee = getEmployeeFromSession();
  const employeeObj = employee ? employee : null;

  return employeeObj;
};

const getEmployeeFromSession = () => {
  const employeeData = sessionStorage.getItem("employee");
  if (employeeData) {
    try {
      return JSON.parse(atob(employeeData)) as Employee;
    } catch (error) {
      console.error("Error parsing employee data from sessionStorage", error);
      return null; // Return null if parsing fails
    }
  } else {
    console.error("Unable to find logged in user information");
    return null; // Return null if employee data is not available
  }
};



export default { PermissionManager, RoleManager, EmployeeCode, EmployeeObj };
