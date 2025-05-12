import React from "react";
import LeaveForm from "../HR Admin/LeaveManagement/LeaveForm";
import HRRequests from "../../Components/HRRequests";

const RequestHRDocument: React.FC<{ title?: string }> = ({
  title = "Request HR Document",
}): JSX.Element => {
  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Request HR Document
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>{title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Request Document Form */}
        <HRRequests />
      </div>
    </>
  );
};

export default RequestHRDocument;
