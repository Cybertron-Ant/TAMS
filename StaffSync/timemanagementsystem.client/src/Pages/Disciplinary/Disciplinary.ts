// src/types.ts
export interface DisciplinaryTracker {
  id: number;
  employeeCode: string;
  offenceCategory: string;
  violationCategory: string;
  entryDate: string;
  dateOfViolation: string;
  adminHearingDate: string;
  suspensionStartDate: string | null;
  suspensionEndDate: string | null;
  decision: string;
  explanationDate: string;
  coachingDocLink: string;
  correctiveAction: string;
  mangerSignature: string | null;
  mangerSignatureDate: string | null;
  employeeSignature: string | null;
  employeeSignatureDate: string | null;
  occurrence: string;
  details: string;
  nature: string;
  nte: NTE; // Ensure NTE is defined or imported
  nod: NOD; // Ensure NOD is defined or imported
}

export interface NTE {
  nteid: number;
  employeeCode: string;
  entryDate: string;
  dateSent: string;
  fileLink: string;
  remarks: string;
}

export interface NOD {
  nodid: number;
  employeeCode: string;
  entryDate: string;
  dateSent: string;
  fileLink: string;
  remarks: string;
  hrRemarks: HRRemark[];
}

export interface HRRemark {
  hrRemarkId: number;
  remarkText: string;
  isSelected?: boolean;
  noticesOfDecision: NOD[]; // Recursive if needed, else remove
}

export interface DisciplinaryAction {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string | null;
  employeeName: string;
  dateOfViolation: string;
  offenceCategory: string;
  violationCategory: string;
  entryDate: string;
  correctiveAction: string;
  mangerSignature: string | null;
  mangerSignatureDate: string | null;
  employeeSignature: string | null;
  employeeSignatureDate: string | null;
  adminHearingDate: string | null;
  suspensionStartDate: string | null;
  suspensionEndDate: string | null;
  decision: string | null;
  explanationDate: string | null;
  coachingDocLink: string | null;
  occurrence: string | null;
  details: string | null;
  nature: string | null;
  detailsOfReport: string;
  hrRemark: string;
  nte: NTE | null;
  nod: NOD | null;
}
