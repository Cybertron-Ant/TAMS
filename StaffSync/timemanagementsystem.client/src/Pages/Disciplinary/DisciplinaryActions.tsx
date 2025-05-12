import React from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import Button from "@mui/material/Button"; // Importing Button from MUI
import { DisciplinaryAction } from "./Disciplinary";



interface DisciplinaryActionsProps {
  actions: DisciplinaryAction[];
  onTakeAction: (actionId: number) => void; // Prop for handling action click
}

const DisciplinaryActions: React.FC<DisciplinaryActionsProps> = ({
  actions,
  onTakeAction,
}) => {
  return (
    <div className="w-full p-7 h-full bg-white rounded-lg shadow-lg flex flex-col gap-5">
      <h2 className="text-2xl font-bold mb-4">Disciplinary Actions</h2>
      <ul className="divide-y divide-gray-200">
        {actions.map((action) => (
          <li
            key={action.id}
            className="py-4 flex justify-between items-center space-x-4"
          >
            <div className="flex-grow space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                {action.employeeName}
              </p>
              <p className="text-sm text-gray-500">
                {action.dateOfViolation} - {action.violationCategory}
              </p>
              <p className="text-sm text-gray-500">{action.detailsOfReport}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              {action.hrRemark.includes("improvement") && (
                <CheckCircleOutlineIcon className="text-green-500" />
              )}
              {action.hrRemark.includes("terminated") && (
                <CancelIcon className="text-red-500" />
              )}
              {action.hrRemark.includes("reminder") && (
                <WarningAmberIcon className="text-yellow-500" />
              )}
              <p className="text-sm font-medium">{action.hrRemark}</p>
            </div>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => onTakeAction(action.id)}
            >
              Take Action
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisciplinaryActions;
