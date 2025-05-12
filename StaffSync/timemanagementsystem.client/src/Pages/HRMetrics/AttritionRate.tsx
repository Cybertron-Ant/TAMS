import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Typography,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { Gauge } from "@mui/x-charts/Gauge";
import { fetchWithAuth } from "../../app/fetchWrapper";

const AttritionRate: React.FC = () => {
  const [overallRate, setOverallRate] = useState<number | null>(null);
  const [timeframeRate, setTimeframeRate] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Set initial loading to false
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    const fetchOverallRate = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        const response = await fetchWithAuth(
          `${API_URL}/HRMetrics/OverallAttritionRate`
        );
        const result = await response.json();
        setOverallRate(result.attritionRate);
      } catch (error) {
        console.error("Failed to fetch overall attrition rate:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchOverallRate();
  }, []);

  const fetchTimeframeRate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const timeframeResponse = await fetchWithAuth(
        `${API_URL}/HRMetrics/AttritionRate?startDate=${startDate}&endDate=${endDate}`
      );
      const timeframeResult = await timeframeResponse.json();

      setTimeframeRate(timeframeResult.attritionRate);
    } catch (error) {
      console.error(
        "Failed to fetch attrition rate for the selected timeframe:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 w-full rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Attrition Rates</h2>
      <div className="flex flex-col space-y-4">
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
        </div>
        {loading && <CircularProgress />}
        <div className="flex justify-center space-x-6">
          {overallRate !== null && (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Overall Attrition Rate
              </h3>
              <Gauge
                width={200}
                height={200}
                value={overallRate}
                min={0}
                max={100}
                label={`${overallRate.toFixed(2)}%`}
              />
            </div>
          )}
          {timeframeRate !== null && (
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Attrition Rate Within Timeframe
              </h3>
              <Gauge
                width={200}
                height={200}
                value={timeframeRate}
                min={0}
                max={100}
                label={`${timeframeRate.toFixed(2)}%`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttritionRate;
