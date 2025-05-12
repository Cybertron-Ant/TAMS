import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../app/fetchWrapper";
interface EmployeeHistoryProps {
  employeeCode: string;
}

interface HistoryItem {
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
}
const EmployeeHistory: React.FC<EmployeeHistoryProps> = ({ employeeCode }) => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/SuspendedPullOutFloatings/History/${employeeCode}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: HistoryItem[] = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch employee history", error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeCode) {
      fetchHistory();
    }
  }, [employeeCode]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <div className="mb-4">
          <div className="text-3xl text-neutral-800 font-bold mt-2">
            Employee Movement History
          </div>
          <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
            <span className="opacity-60">Dashboard</span>
            <span className="opacity-60">/</span>
            <span>Employee History</span>
          </div>
        </div>
        {history.length > 0 ? (
          <div className="relative border-l border-gray-200 dark:border-gray-700">
            {history.map((item, index) => (
              <div
                key={item.id}
                className={`mb-10 ml-4 ${
                  index === history.length - 1 ? "pb-10" : ""
                }`}
              >
                <div className="absolute -left-3 top-0 flex justify-center items-center w-6 h-6 bg-blue-500 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  {/* SVG or icon here */}
                </div>
                <div className="pl-8">
                  <div className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-300">
                    {" "}
                    {/* Adjusted for visibility */}
                    <span className="text-black">
                      Effective Date:{" "}
                      {new Date(item.effectiveDate).toLocaleDateString()}
                    </span>
                    <br />
                    <span className="dark:text-black">
                      {item.newPositionTitle} at {item.newDepartmentName}
                    </span>{" "}
                    {/* Ensuring visibility in dark mode */}
                  </div>
                  <div className="mb-4 text-gray-700 dark:text-gray-400">
                    Moved from <strong>{item.currentPositionTitle}</strong> in{" "}
                    <strong>{item.currentDepartmentName}</strong>
                    <br />
                    Reason: {item.reason || "N/A"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    <strong>Employee Code:</strong> {item.employeeCode}
                    <br />
                    <strong>Employee Name:</strong> {item.firstName}{" "}
                    {item.lastName}
                    <br />
                    <strong>Status:</strong> {item.status}
                    <br />
                    <strong>Decision:</strong> {item.decision}
                  </div>
                </div>
                {index < history.length - 1 && (
                  <div className="absolute w-0.5 bg-gray-300 left-0 top-0 bottom-0 -ml-px"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>No history available for this employee.</div>
        )}
      </div>
    </>
  );
};

export default EmployeeHistory;
