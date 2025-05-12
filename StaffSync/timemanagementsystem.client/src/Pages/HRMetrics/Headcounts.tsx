import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { fetchWithAuth } from "../../app/fetchWrapper"; // Ensure this is correctly imported
import ExportDataComponent from "../../Components/ExportDataComponent";

interface DepartmentHeadcount {
  departmentName: string;
  employeeCount: number;
}

interface Headcounts {
  overallHeadcount: number;
  departmentalHeadcounts: DepartmentHeadcount[];
}

const Headcounts: React.FC = () => {
  const [data, setData] = useState<Headcounts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${API_URL}/HRMetrics/Headcounts`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch headcounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (!data) {
    return (
      <Typography variant="body1" color="textSecondary">
        No data available
      </Typography>
    );
  }

  const pieChartData = data.departmentalHeadcounts.map((dept, index) => ({
    id: index,
    value: dept.employeeCount,
    label: dept.departmentName,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <div className="flex justify-between">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Headcounts</h3>
      <div>
      <ExportDataComponent  rows={pieChartData}/>
      </div>
      </div>

      <div className="flex justify-center">
        <PieChart
          series={[
            {
              data: pieChartData,
              innerRadius: 30,
              outerRadius: 150,
              paddingAngle: 5,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 180,
              cx: 150,
              cy: 150,
            },
          ]}
          width={700}
          height={700}
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <ul className="list-disc space-y-2">
          {data.departmentalHeadcounts.map((dept, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">
                {dept.departmentName}
              </span>
              <span className="text-gray-600">
                Employees: {dept.employeeCount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Headcounts;
