export default interface ILeaveTracker {
  id: string;
  employeeCode: any;
  attendanceId: string;
  attendance: string;
  approvalStatusId: string;
  approvalStatus: string;
  expectedDateOfReturn: any;
  dateOfAbsence: string;
  reason: string;
  expectedReturnDate: string;
  shiftId: string;
  shift: string;
  timeOfNotice: any;
  submittedDocument: boolean;
  employeeImage: string;
  firstName: string;
  lastName: string;
  recommendation: string;
  documentLink: string;
  leaveBalance: number;
}
