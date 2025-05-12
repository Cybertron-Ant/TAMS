import React from "react";
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
  CardHeader,
  Divider,
} from "@mui/material";
import moment from "moment-timezone";
import { calculateElapsedTime } from "../../app/utils";

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  const date = moment.tz(dateTimeString, "America/Panama");
  return date.format("hh:mm:ss A");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = moment.tz(dateString, "America/Panama");
  return date.format("MMMM D, YYYY");
};

const formatHours = (decimalHours) => {
  if (isNaN(decimalHours) || decimalHours === null) return "N/A";

  const absoluteHours = Math.abs(decimalHours);
  const hours = Math.floor(absoluteHours);
  const minutes = Math.round((absoluteHours - hours) * 60);

  return `${hours} hours, ${minutes} minutes`;
};

/**
 * 
 * @param param0 Object<>
 * @returns 
 */
const TimeSheetDetails = ({ open, onClose, record }) => {
  if (!record) return null;

  const {
    employeeCode,
    date,
    firstName,
    lastName,
    punchIn,
    punchOut,
    breakType,

  } = record;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Timesheet Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Employee Code
                    </Typography>
                    <Typography variant="h6">
                      {employeeCode || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Date
                    </Typography>
                    <Typography variant="h6">{formatDate(date)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
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

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Break Type
                    </Typography>
                    <Typography variant="h6">
                      {breakType ? breakType : "--"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Punch In
                    </Typography>
                    <Typography variant="h6">{formatTime(punchIn)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Punch Out
                    </Typography>
                    <Typography variant="h6">{formatTime(punchOut)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total Hours
                    </Typography>
                    <Typography variant="h6">
                      {calculateElapsedTime(punchIn, punchOut)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

        
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

export default TimeSheetDetails;
