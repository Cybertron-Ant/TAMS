import {Employee} from "../../../interfaces/Employee";

export default interface IRecruitmentTracker {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  dateApplied: string;
  source: string;
  dateInvited: string;
  firstFollowUp: string;
  secondFollowUp: string;
  thirdFollowUp: string;
  interviewDate: string;
  interviewRemarks: string;
  initialInterviewer?: Employee;
  initialInterviewerId: string;
  initialInterviewResult?: {
    id: string;
    type: string;
  };
  initialInterviewResultId: string;
  finalInterviewDate: string;
  finalInterviewRemarks: string;
  finalInterviewer?: Employee;
  finalInterviewerId: string;
  finalInterviewResult?: {
    id: string;
    type: string;
  };
  finalInterviewResultId: string;
  firstFollowUpRemarks: string;
  secondFollowUpRemarks: string;
  thirdFollowUpRemarks: string;
  document: string;
  adminComment: string
  candidateScore: string
}
