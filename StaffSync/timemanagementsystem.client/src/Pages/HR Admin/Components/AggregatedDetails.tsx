import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import moment from "moment-timezone";
import { calculateElapsedTime, formatDate, formatTimeToPanamaTime } from "../../../app/utils";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import { toast } from "react-toastify";


/**
 * 
 * @param param0
 * @returns 
 */
const AggregatedDetails = ({ open, onClose, record }) => {
    if (!record) return null;
    
  const {
    employeeCode,
    // date,
    firstName,
    lastName,
    startDate,
    endDate,
    punchOut,
    breakType,

} = record;

interface IBreakAggregate{
    breakTypeId:number;
    breakTypeName:string;
    employeeCode:string;
    endDate:string;
    firstName:string;
    lastName:string;
    startDate:string;
    totalLoggedHours:number;
}

const [breakAggregatedList, setBreakAggregatedList] = useState<IBreakAggregate[]>([]);
const [loader, setLoader] = useState(false);
const API_URL = import.meta.env.VITE_TMS_PROD;


useEffect(()=>{
    fetchBreakAggreatedList()
}, []);

const fetchBreakAggreatedList = async()=> {
    setLoader(true);
    try{
        let response = await fetchWithAuth(`${API_URL}/TimeSheet/Aggregated/employee/${employeeCode}?startDate=${startDate}&endDate=${endDate}`);
        let data = await response.json() as IBreakAggregate[];
        setBreakAggregatedList(data);
    }catch{
        toast.error("Unable to fetch the BreakTime Aggregation Details")
    }finally{
        setLoader(false);
    }
}


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Aggregated Data</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Employee Code
                    </Typography>
                    <Typography variant="h6">
                      {employeeCode || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Start Date
                    </Typography>
                    <Typography variant="h6">{formatDate(startDate)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      End Date
                    </Typography>
                    <Typography variant="h6">{formatDate(endDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="h6">
                      {firstName && lastName
                        ? `${firstName} ${lastName}`
                        : "N/A"}
                    </Typography>
                  </Grid>
                  
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {loader && <Grid item xs={12} className="grid place-items-center">
                <CircularProgress />
          </Grid>}

          {breakAggregatedList.map((breakAgg)=><Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Break Type
                    </Typography>
                    <Typography variant="h6">
                      {breakAgg.breakTypeName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total Hours
                    </Typography>
                    <Typography variant="h6">
                        {breakAgg.totalLoggedHours.toFixed(2)}
                    </Typography>
                        
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>)}

        
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AggregatedDetails;
