export interface EmploymentType {
  employmentTypeId: number;
  name: string;
}
export interface PositionCode {
  positionCodeId: number;
  name: string;
  currentPositionSuspendedPullOutFloatings: any; // Adjust type as necessary
  newPositionSuspendedPullOutFloatings: any; // Adjust type as necessary
}

export interface Gender {
  genderId: number;
  name: string;
}

export interface Department {
  departmentId: number;
  name: string;
  currentDepartmentSuspendedPullOutFloatings: any; // Adjust type as necessary
  newDepartmentSuspendedPullOutFloatings: any; // Adjust type as necessary
}

export interface MaritalStatus {
  maritalStatusId: number;
  name: string;
}

export interface Team {
  teamId: number;
  name: string;
}

export interface ModeOfSeparation {
  modeOfSeparationId: number;
  name: string;
}

export interface Status {
  employeeStatusId: number;
  name: string;
}

export interface Employee {
  role: string;
  userId: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  middleName: string;
  nameSuffix: string;
  active: boolean;
  mobileNo: string;
  immediateSuperior: string;
  addressForeign: string;
  birthDate: string;
  dateHired: string;
  dateSeparated: string;
  emailAddress: string;
  location: string;
  dateCleared: string;
  employmentTypeId: number;
  employmentType: EmploymentType;
  positionCodeId: number;
  positionCode: PositionCode;
  genderId: number;
  gender: Gender;
  departmentId: number;
  department: Department;
  maritalStatusId: number;
  maritalStatus: MaritalStatus;
  teamId: number;
  team: Team;
  modeOfSeparationId: number;
  modeOfSeparation: ModeOfSeparation;
  employeeStatusId: number;
  status: Status;
  lastLoginDate: string;
  sickCallHotlineTrackers: any; // Adjust type as necessary
  agshrtaEmployeeOnboardingTrackers: any; // Adjust type as necessary
  pemeMedicardDetails: any; // Adjust type as necessary
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  // Navigation Properties
  workResumptionTrackers?: TObject[];
  leaveTrackers?: TObject[];
  medicardTrackers?: TObject[];
  suspendedPullOutFloatings?: TObject[];
  noticesToExplain?: TObject[];
  noticesOfDecision?: TObject[];
  finalPayMonitorings?: TObject[];
  medicineMonitorings?: TObject[];
  attritions?: TObject[];
  separationNotices?: TObject[];
  newHiresLists?: TObject[];
  newHireTrackers?: TObject[];
  agshrtAEmployeeOnboardingTrackers?: TObject[];
  pememedicardDetails?: TObject[];
  dailyTrackerPEMEResults?: TObject[];
  jobOfferTrackers?: TObject[];
  timeSheets?: TObject[];
  disciplinaryTrackers?: TObject[];
  leaveBalances?: TObject[];
  hrRequest?: TObject[];
  personalEmail:string;
  sssNo?:string;
  ctcNo?:string;
  tinNo?:string;
  taxCode?:string;
  region?:string;

  pagIbigNo?:string;

  hdmfid?:string;

  philHealthNo?:string;

  nationalityCode?:string;

  immediateSuperiorCode?:string;

  rehirable?:boolean;

  accessCode?:string;

  zipCodeAR?:string;

  zipCodeAF?:string;

  employeePermissions: any[];
}

export interface EmployeeState {
  employee: Employee | null;
  isLoading: boolean; // Add this line
  user: any | null; // Adjust the type as needed, e.g., create a User interface
  error: string | null;
  require2FA: false; // Add this line
}

export interface Role {
  name: string;

  id: string;
}

export interface EmployeeStatus {
  employeeStatusId: number;
  name: string;
}
/**
 * Generic Object Type
 */
type TObject = { [key: string]: any };

/**
 * Represents an employee in the system.
 */

