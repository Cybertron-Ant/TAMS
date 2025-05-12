import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { fetchWithAuth } from "../../app/fetchWrapper"; // Ensure this is correctly imported
import { toast } from "react-toastify";
import { ExportData } from "../../app/utils";
import ExportDataComponent from "../../Components/ExportDataComponent";

interface AbsenteeismRates {
  rates: Record<string, number>;
  overallRate: number;
}

const AbsenteeismRates: React.FC = () => {
  const [data, setData] = useState<AbsenteeismRates | null>(null);
  const [timeframeRate, setTimeframeRate] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_URL}/HRMetrics/OverallAbsenteeismRates`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch absenteeism rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeframeRate = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const timeframeResponse = await fetchWithAuth(
        `${API_URL}/HRMetrics/AbsenteeismRates?startDate=${startDate}&endDate=${endDate}`
      );
      const timeframeResult = await timeframeResponse.json();

      setData(timeframeResult);
    } catch (error) {
      console.error(
        "Failed to fetch attrition rate for the selected timeframe:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setStartDate("");
    setEndDate("");
    fetchData(); // Fetch overall rates again
  };

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

  const barChartData = Object.entries(data.rates).map(([key, value]) => ({
    name: key,
    value,
  }));

  const barChartColumnData = Object.entries(data.rates).map(([key, value]) => ({
    name: key,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <div className="flex items-center space-x-2">
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1"
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          onClick={fetchTimeframeRate}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch Rate
        </Button>
        <Button
          variant="outlined"
          onClick={resetData}
          disabled={loading}
          className="bg-white hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded"
        >
          Reset
        </Button>
        {/* <Button onClick={() => ExportData.toExcel(barChartData)}
         disabled={loading}
          className="bg-white hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">Export</Button> */}
          <ExportDataComponent rows={barChartData}/>

      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        Absenteeism Rates
      </h3>
      <div className="flex justify-center">
        <BarChart
          series={[{ data: barChartData.map((entry) => entry.value) }]}
          height={290}
          xAxis={[
            {
              data: barChartData.map((entry) => entry.name),
              scaleType: "band",
            },
          ]}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <ul className="list-disc space-y-2">
          {Object.entries(data.rates).map(([key, value]) => (
            <li key={key} className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">{key}</span>
              <span className="text-gray-600">{value.toFixed(2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AbsenteeismRates;
