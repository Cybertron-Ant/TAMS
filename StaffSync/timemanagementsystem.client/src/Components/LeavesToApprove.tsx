import React from "react";

interface Leave {
  name: string;
  position: string;
  returnDate: string;
}
interface LeavesToApproveProps {
  leaves: Leave[];
}

const LeavesToApprove: React.FC<LeavesToApproveProps> = ({ leaves }) => {
  return (
    <div className="w-full  p-7 bg-white rounded-lg flex-col justify-start h-full items-start gap-5">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-2xl font-bold">Employees on Leave</h2>
        <div className="px-2.5 py-1 bg-green-500 rounded-lg text-white text-base font-medium">
          {leaves.length}
        </div>
      </div>
      {leaves.map((leave: Leave, index: number) => (
        <div
          key={index}
          className="flex justify-between items-center w-full py-3.5 border-b border-neutral-200"
        >
          <div className="flex items-center gap-4">
            <div className="text-lg font-normal">{leave.name}</div>
            <div className="text-sm text-neutral-700">{leave.position}</div>
          </div>
          <div className="text-sm font-bold">{leave.returnDate}</div>
        </div>
      ))}
    </div>
  );
};

export default LeavesToApprove;
