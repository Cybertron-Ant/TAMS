import React from "react";

interface EmployeeMove {
  id: number;
  employeeCode: string;
  entryDate: string;
  dateHired: string;
  status: string;
  reason: string;
  effectiveDate: string;
  decision: string;
  firstName: string;
  lastName: string;
  currentDepartmentId: number;
  newDepartmentId: number;
  currentDepartmentName: string;
  newDepartmentName: string;
  currentPositionId: number;
  newPositionId: number;
  currentPositionTitle: string;
  newPositionTitle: string;
  department: { departmentId: number; name: string };
  positionCode: { positionCodeId: number; name: string };
}

interface MoveDetailsProps {
  moveData: EmployeeMove;
  onClose: () => void;
}

const MoveDetails: React.FC<MoveDetailsProps> = ({ moveData, onClose }) => {
  return (
    <div className="bg-white p-4 h-full w-full">
      <h2 className="text-xl font-bold mb-4">Employee Move Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Employee Code:</strong> {moveData.employeeCode}
        </div>
        <div>
          <strong>First Name:</strong> {moveData.firstName}
        </div>
        <div>
          <strong>Last Name:</strong> {moveData.lastName}
        </div>
        <div>
          <strong>Entry Date:</strong> {moveData.entryDate.split("T")[0]}
        </div>
        <div>
          <strong>Date Hired:</strong> {moveData.dateHired.split("T")[0]}
        </div>
        <div>
          <strong>Status:</strong> {moveData.status}
        </div>
        <div>
          <strong>Reason:</strong> {moveData.reason}
        </div>
        <div>
          <strong>Effective Date:</strong>{" "}
          {moveData.effectiveDate.split("T")[0]}
        </div>
        <div>
          <strong>Decision:</strong> {moveData.decision}
        </div>
        <div>
          <strong>Current Department:</strong> {moveData.currentDepartmentName}
        </div>
        <div>
          <strong>New Department:</strong> {moveData.newDepartmentName}
        </div>
        <div>
          <strong>Current Position:</strong> {moveData.currentPositionTitle}
        </div>
        <div>
          <strong>New Position:</strong> {moveData.newPositionTitle}
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MoveDetails;
