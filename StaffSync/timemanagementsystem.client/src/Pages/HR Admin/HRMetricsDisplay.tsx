import React, { useState, useEffect } from "react";
import { DateRangePicker } from "@mui/lab";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Gauge } from "@mui/x-charts/Gauge";
import MetricTabsComponent from "../../Components/MetricTabs";
import MetricTabs from "../../Components/MetricTabs";

interface AbsenteeismRates {
  rates: Record<string, number>;
  overallRate: number;
}

interface DepartmentHeadcount {
  departmentName: string;
  employeeCount: number;
}

interface Headcounts {
  overallHeadcount: number;
  departmentalHeadcounts: DepartmentHeadcount[];
}

interface AttritionRate {
  attritionRate: number;
}

const HRMetricsDisplay = () => {
  const [metrics, setMetrics] = useState<{
    absenteeismRates?: AbsenteeismRates;
    headcounts?: Headcounts;
    overallAttritionRate?: number;
    attritionRateWithinTimeframe?: number;
  }>({});

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const API_URL = import.meta.env.VITE_TMS_PROD;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          absenteeismRes,
          headcountsRes,
          overallAttritionRes,
          attritionTimeframeRes,
        ] = await Promise.all([
          fetchWithAuth(`${API_URL}/HRMetrics/OverallAbsenteeismRates`).then(
            (res) => res.json()
          ),
          fetchWithAuth(`${API_URL}/HRMetrics/Headcounts`).then((res) =>
            res.json()
          ),
          fetchWithAuth(`${API_URL}/HRMetrics/OverallAttritionRate`).then(
            (res) => res.json()
          ),
          dateRange[0] && dateRange[1]
            ? fetchWithAuth(
                `${API_URL}/HRMetrics/AttritionRate?startDate=${
                  dateRange[0].toISOString().split("T")[0]
                }&endDate=${dateRange[1].toISOString().split("T")[0]}`
              ).then((res) => res.json())
            : Promise.resolve({ attritionRate: undefined }),
        ]);

        setMetrics({
          absenteeismRates: absenteeismRes,
          headcounts: headcountsRes,
          overallAttritionRate: overallAttritionRes.attritionRate,
          attritionRateWithinTimeframe: attritionTimeframeRes.attritionRate,
        });
      } catch (error) {
        console.error("Failed to fetch HR metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const fetchAttritionRate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/HRMetrics/AttritionRate?startDate=${startDate}&endDate=${endDate}`;
      const attritionRateRes = await fetchWithAuth(url).then((res) =>
        res.json()
      );

      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        attritionRateWithinTimeframe: attritionRateRes.attritionRate,
      }));
    } catch (error) {
      console.error("Failed to fetch attrition rate:", error);
    } finally {
      setLoading(false);
    }
  };

  const barChartData = metrics.absenteeismRates
    ? Object.entries(metrics.absenteeismRates.rates).map(([key, value]) => ({
        name: key,
        value,
      }))
    : [];

  const pieChartData = metrics.headcounts
    ? metrics.headcounts.departmentalHeadcounts.map((dept, index) => ({
        id: index,
        value: dept.employeeCount,
        label: dept.departmentName,
      }))
    : [];

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  // Handler for when end date changes
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    // <LocalizationProvider dateAdapter={AdapterDayjs}>
    //   <div className="bg-white shadow-md rounded-lg p-8">
    //     <h2 className="text-xl font-semibold mb-6">HR Metrics</h2>
    //     {loading ? (
    //       <CircularProgress />
    //     ) : (
    //       <>
    //         <div className="mb-6">
    //           <h3 className="text-lg font-medium mb-4">Absenteeism Rates</h3>
    //           {metrics.absenteeismRates && (
    //             <div className="mb-6">
    //               <h3 className="text-lg font-medium mb-4">
    //                 Absenteeism Rates Bar Chart
    //               </h3>
    //               <BarChart
    //                 series={[
    //                   { data: barChartData.map((entry) => entry.value) },
    //                 ]}
    //                 height={290}
    //                 xAxis={[
    //                   {
    //                     data: barChartData.map((entry) => entry.name),
    //                     scaleType: "band",
    //                   },
    //                 ]}
    //                 margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
    //               />
    //             </div>
    //           )}
    //           {metrics.absenteeismRates ? (
    //             <div>
    //               <Typography variant="h6" component="h2" gutterBottom>
    //                 Absenteeism Rates
    //               </Typography>
    //               <List>
    //                 {Object.entries(metrics.absenteeismRates.rates).map(
    //                   ([key, value]) => (
    //                     <ListItem key={key}>
    //                       <ListItemText
    //                         primary={
    //                           <Typography variant="body1">{key}</Typography>
    //                         }
    //                         secondary={
    //                           <Typography variant="body2">
    //                             {value.toFixed(2)}%
    //                           </Typography>
    //                         }
    //                       />
    //                     </ListItem>
    //                   )
    //                 )}
    //                 <Divider variant="inset" component="li" />
    //                 <ListItem>
    //                   <ListItemText
    //                     primary={
    //                       <Typography variant="body1">Overall Rate</Typography>
    //                     }
    //                     secondary={
    //                       <Typography variant="body2" color="textPrimary">
    //                         {metrics.absenteeismRates.overallRate.toFixed(2)}%
    //                       </Typography>
    //                     }
    //                   />
    //                 </ListItem>
    //               </List>
    //             </div>
    //           ) : (
    //             <Typography variant="body1" color="textSecondary">
    //               No data available
    //             </Typography>
    //           )}
    //         </div>

    //         <div className="mb-6">
    //           <h3 className="text-lg font-medium mb-4">Headcounts</h3>
    //           {metrics.headcounts && (
    //             <div className="mb-6">
    //               <h3 className="text-lg font-medium mb-4">
    //                 Departmental Headcount Distribution
    //               </h3>
    //               <PieChart
    //                 series={[
    //                   {
    //                     data: pieChartData,
    //                     innerRadius: 30,
    //                     outerRadius: 150,
    //                     paddingAngle: 5,
    //                     cornerRadius: 5,
    //                     startAngle: -90,
    //                     endAngle: 180,
    //                     cx: 150,
    //                     cy: 150,
    //                   },
    //                 ]}
    //                 width={700}
    //                 height={700}
    //               />
    //             </div>
    //           )}
    //           {metrics.headcounts ? (
    //             <div>
    //               <Typography variant="h6" component="h2" gutterBottom>
    //                 Overall Headcount: {metrics.headcounts.overallHeadcount}
    //               </Typography>
    //               <Divider variant="middle" />
    //               <List>
    //                 {metrics.headcounts.departmentalHeadcounts.map(
    //                   (dept, index) => (
    //                     <ListItem key={index}>
    //                       <ListItemText
    //                         primary={
    //                           <Typography variant="body1">
    //                             {dept.departmentName}
    //                           </Typography>
    //                         }
    //                         secondary={
    //                           <Typography variant="body2">
    //                             Employees: {dept.employeeCount}
    //                           </Typography>
    //                         }
    //                       />
    //                     </ListItem>
    //                   )
    //                 )}
    //               </List>
    //             </div>
    //           ) : (
    //             <Typography variant="body1" color="textSecondary">
    //               No data available
    //             </Typography>
    //           )}
    //         </div>

    //         <div className="mb-6">
    //           {metrics.overallAttritionRate !== undefined && (
    //             <div className="mb-6">
    //               <Typography variant="h6" component="h2" gutterBottom>
    //                 Overall Attrition Rate
    //               </Typography>
    //               <Stack
    //                 direction={{ xs: "column", md: "row" }}
    //                 spacing={{ xs: 1, md: 3 }}
    //                 justifyContent="center"
    //               >
    //                 <Gauge
    //                   width={200}
    //                   height={200}
    //                   value={metrics.overallAttritionRate}
    //                   min={0}
    //                   max={100} // Assuming 100% is the maximum possible attrition rate
    //                   label={`${metrics.overallAttritionRate.toFixed(2)}%`}
    //                 />
    //               </Stack>
    //             </div>
    //           )}
    //           <p className="text-sm">
    //             Overall Attrition Rate is:{" "}
    //             {metrics.overallAttritionRate?.toFixed(2)}%
    //           </p>
    //         </div>

    //         {/* <div className="mb-6">
    //           <DateRangePicker
    //             startText="Start date"
    //             endText="End date"
    //             value={dateRange}
    //             onChange={(newValue) => {
    //               setDateRange(newValue);
    //             }}
    //             renderInput={(startProps, endProps) => (
    //               <>
    //                 <TextField {...startProps} className="mr-4" />
    //                 <TextField {...endProps} />
    //               </>
    //             )}
    //           />
    //         </div> */}
    //         <div className="mb-6">
    // <TextField
    //   label="Start date"
    //   type="date"
    //   value={startDate}
    //   onChange={(e) => setStartDate(e.target.value)}
    //   className="mr-4"
    //   InputLabelProps={{ shrink: true }}
    // />
    // <TextField
    //   label="End date"
    //   type="date"
    //   value={endDate}
    //   onChange={(e) => setEndDate(e.target.value)}
    //   InputLabelProps={{ shrink: true }}
    // />
    //           <Button
    //             variant="contained"
    //             color="primary"
    //             onClick={fetchAttritionRate}
    //             style={{ marginLeft: "20px" }}
    //             disabled={loading}
    //           >
    //             Fetch Attrition Rate
    //           </Button>
    //         </div>
    //         {loading ? (
    //           <CircularProgress />
    //         ) : (
    //           metrics.attritionRateWithinTimeframe !== undefined && (
    //             <div className="mb-6">
    //               <Typography variant="h6" component="h2" gutterBottom>
    //                 Attrition Rate Within Timeframe
    //               </Typography>
    //               <Stack
    //                 direction={{ xs: "column", md: "row" }}
    //                 spacing={{ xs: 1, md: 3 }}
    //                 justifyContent="center"
    //               >
    //                 <Gauge
    //                   width={200}
    //                   height={200}
    //                   value={metrics.attritionRateWithinTimeframe}
    //                   min={0}
    //                   max={100} // Assuming 100% is the maximum possible attrition rate
    //                   label={`${metrics.attritionRateWithinTimeframe.toFixed(
    //                     2
    //                   )}%`}
    //                 />
    //               </Stack>
    //               <Typography variant="body1">
    //                 Overall Attrition Rate for the given timeframe is:
    //                 {metrics.attritionRateWithinTimeframe.toFixed(2)}%
    //               </Typography>
    //             </div>
    //           )
    //         )}
    //       </>
    //     )}
    //   </div>
    // </LocalizationProvider>
    <MetricTabs />
  );
};

export default HRMetricsDisplay;
