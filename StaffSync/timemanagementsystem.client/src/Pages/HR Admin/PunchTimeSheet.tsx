import { Button, ButtonGroup, Card, CardContent, ClickAwayListener, Dialog, Grid, Grow, MenuItem, MenuList, Paper, Popper, Typography } from "@mui/material";
import moment from "moment-timezone";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PermissionManager from "../../app/PermissionManager ";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { Employee } from "../../interfaces/Employee";
import { BreakTime } from "../../interfaces/BreakTime";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { useNavigate } from "react-router";
import { BreakTypeAuthForm } from "../../Components/BreakTypeAuthForm";
import LoadingButton from "../../Components/LoadingButton";
import ConfirmationModal from "../../Components/ConfirmationModal";



interface Props {
  handleCloseModal?: () => void;
}

const API_URL = import.meta.env.VITE_TMS_PROD;

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text.includes("success")
    ? { success: true, message: text }
    : { success: false, message: text };
};

const PunchTimeSheet: React.FC<Props> = ({ handleCloseModal }) => {
  const employee = PermissionManager.EmployeeObj();
  // const dateInPhilippines = moment().tz("America/Panama").format();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    employee
  );
  const [activeTimeSheets, setActiveTimeSheets] = useState<TimeSheet[]>(
    []
  );
  const [elapsedTimes, setElapsedTimes] = useState<string[]>(["--:--:--"]);
  const [breakTimeTypes, setBreakTimeTypes] = useState<BreakTime[]>([]);
  const [selectedBreakType, setSelectedBreakType] = useState<BreakTime>();

  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showBreakAuthModal, setShowBreakAuthModal] = useState<boolean>(false);
  const [passwordValidated, setPasswordValidated] = useState<boolean>(false);
  const [confirmationPopup, setConfirmationPopup] = useState<boolean>(false);
  const [confirmPopupCb, setConfirmPopupCb] = useState<VoidFunction>(()=>{});
  const navigate = useNavigate();




const handleMenuItemClick = (
  breakType: BreakTime,
  index: number
) => {
  
  setSelectedBreakType(breakType);
  setSelectedIndex(index);
  setOpen(false);
};

const handleToggle = () => {
  setOpen((prevOpen) => !prevOpen);
};

const updatedBreakValidationStatus = (isValidated) =>{
  setPasswordValidated(isValidated);
}

const handleClose = (event: Event) => {
  if (
    anchorRef.current &&
    anchorRef.current.contains(event.target as HTMLElement)
  ) {
    return;
  }

  setOpen(false);
};

const handleCloseBreakModal = (event: Event) => {
  setShowBreakAuthModal(false);
};

const handleBreakTimeAuth = (formData: {password: string}) =>{
    fetchWithAuth(`${API_URL}/BreakType/Validate`,{
      method: "POST",
      body: JSON.stringify({
        ...selectedBreakType,
        ...formData // will override the password set in the selectedBreakType
      }),
      headers: { "Content-Type": "application/json" },

    }).then((response)=>{
      if(response.ok){
        
        toast.success("Successfully authenticated for break");
        setPasswordValidated(true);
        return true
        
      }else{
        toast.error("Unable to authorize for break");
        setPasswordValidated(false);
        return false;

      }
    }).then((isValidated)=> {
        if(isValidated){
          handlePunchIn(isValidated)
        }
      handlePunchIn()
    }).catch((error)=>{
      toast.error("Something went wrong when trying to authorize breaktime access");
      setPasswordValidated(false);

    })
}

  const calculateElapsedTime = (punchIn: string): string => {
    if (!punchIn) return "--:--:--";

    // Convert to Philippines timezone
    const punchInDate = moment.tz(punchIn, "America/Panama");
    const punchOutDate = moment.tz("America/Panama");

    const elapsedTime = punchOutDate.diff(punchInDate, "seconds");
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newElapsedTimes = activeTimeSheets.map((activeTimeSheet) =>
        activeTimeSheet?.punchIn && !activeTimeSheet?.punchOut
          ? calculateElapsedTime(activeTimeSheet.punchIn)
          : "--:--:--"
      );
      setElapsedTimes(newElapsedTimes);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTimeSheets]);
  
  
  const formattedpunchIn = (activeTimeSheet:TimeSheet)=> {
    return activeTimeSheet?.punchIn
    ? moment.tz(activeTimeSheet.punchIn, "America/Panama").format("hh:mm:ss A")

    : "--:--:--";
  }
  const fetchTimesheets = (breakTypeId?: number) => {
    let url = `${API_URL}/TimeSheet/Active/${selectedEmployee.employeeCode}`;
    if(breakTypeId){
        url = `${API_URL}/TimeSheet/Active/${selectedEmployee.employeeCode}?breakTypeId=${selectedBreakType.id}`;
    }
    fetchWithAuth(
      url
    )
      .then(parseResponse)
      .then((data) => {
        if (data.success === false) {
          setActiveTimeSheets([]);
        } else {
          setActiveTimeSheets(data);
          
        }
        let index = 0;
        let breakTime = breakTimeTypes.find((breakTime)=>  {
          if(breakTime.id == (data as TimeSheet).breakTypeId){
            setSelectedIndex(index);
            return breakTime;
          };
          index++;
        });
        // setSelectedBreakType(breakTime); // selectedBreakType is already set in the fetchBreakType

      })
      .catch((error) => {
        console.error("Error fetching active timesheet:", error);
        setActiveTimeSheets([]);
      });
  };  
  
  const fetchBreakTimeTypes = () => {
    fetchWithAuth(
      `${API_URL}/BreakType`
    )
      .then(parseResponse)
      .then((data) => {
        if (data.success === false) {
          console.error("Error fetching Break Types:", data.message);
          setBreakTimeTypes(null);
        } else {
          setBreakTimeTypes(data);
          setSelectedBreakType(data[0]); //This is because the clock in break type should be the first item in the list
        }
      })
      .catch((error) => {
        console.error("Error fetching active timesheet:", error);
        setBreakTimeTypes(null);
      });
  };

  useEffect(() => {
    fetchBreakTimeTypes();
    if (selectedEmployee) {
      // Fetch the active timesheet for the selected employee
      fetchTimesheets();

    }
  }, [selectedEmployee]);

  // handle punch in 
  const handlePunchIn = async (isValidated?:boolean) => {
    if(selectedBreakType?.password && !isValidated){
      setPasswordValidated(false);
      setShowBreakAuthModal(true);
      return;
    }else if (selectedEmployee && (!selectedBreakType?.password || (selectedBreakType?.password && isValidated))) {
      fetchWithAuth(
        `${API_URL}/TimeSheet/Create?employeeCode=${selectedEmployee.employeeCode}`,
        {
          method: "POST",
          body: JSON.stringify({
            punchIn: moment().tz("America/Panama").format(), // This punch in is not being used by the API
            isActive: true,
            date: moment().tz("America/Panama").format(), // This date not being used by the API
            breakTypeId: selectedBreakType?.id,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
        .then(parseResponse)
        .then((data) => {
          if (data.success === false) {
            toast.warn(data.message);
          } else {
            toast.success(data.message);
            setActiveTimeSheets(data.timeSheet ?? []);
            setShowBreakAuthModal(false);
          }
        })
        .catch((error) => {
          console.error("Error during punch-in:", error);
          toast.warn(
            "An error occurred on our end while attempting to punch in"
          );

        });
    }
  };

  const handlePunchOut = (activeTimeSheet?: TimeSheet) => {
    if (selectedEmployee && activeTimeSheet) {
      fetchWithAuth(
        `${API_URL}/TimeSheet/${selectedEmployee.employeeCode}/PunchOut/${activeTimeSheet.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then(parseResponse)
        .then((data) => {
          if (data.success === false) {
            console.error("Error during punch-out:", data.message);
          } else {
            toast.success(data.message);
            setActiveTimeSheets(data.timesheets);
            setElapsedTimes(["--:--:--"]);
            if( (data.timesheets as TimeSheet[]).length == 0){
              navigate("/managetimesheet");
            }
          }
        })
        .catch((error) => {
          console.error("Error during punch-out:", error);
          toast.warn(
            "An error occurred on our end while attempting to punch out"
          );
        });
    }
  };


  return (
    <>
      <div className="mb-4 ">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Employee Timesheet
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Timesheet</span>
          <span className="opacity-60">/</span>
          <span>Punch In - Punch Out</span>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col h-full rounded-md">
        {selectedEmployee && (
          <div>
            <p className="my-3">
              Selected Employee: {selectedEmployee.firstName}{" "}
              {selectedEmployee.lastName}
            </p>
            <LoadingButton
              sx={{ mr: "10px" }}
              color="success"
              variant="contained"
              onClick={() => handlePunchIn()}
              // disabled={!!activeTimeSheet}
            >

              Punch In
            </LoadingButton>


      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
        
      >
        <Button disabled={true} sx={{
          '&.Mui-disabled': {
          backgroundColor: '#1976D2',
          color: 'white',
        },
        }}>{breakTimeTypes[selectedIndex]?.name}</Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select time"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={()=>{handleClose}}>
                <MenuList id="split-button-menu" autoFocusItem >
                  {breakTimeTypes.map((option, index) => (

                    <MenuItem
                      key={option.name}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(option, index)}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
          </div>
        )}

        {activeTimeSheets?.map((activeTimeSheet, index)=>(
        <div className="mt-5" key={index}>
        <p className="text-xl font-semibold">{breakTimeTypes.find((b)=> b.id == activeTimeSheet.breakTypeId).name}</p>
        <Grid  container spacing={2}>
          <Grid item xs={5}>
            <Card>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Punched In At
                </Typography>
                <Typography variant="h5" component="div">
                  {formattedpunchIn(activeTimeSheet)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={5}>
            <Card>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Elapsed Time
                </Typography>
                <Typography variant="h5" component="div">
                  {elapsedTimes[index]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2} className="flex items-center">
          <Button
              sx={{ mr: "10px" }}
              color="error"
              variant="contained"
              onClick={()=>{
                if(index == 0 && activeTimeSheets.length > 1){ // if user wants to clock out and there is more than one timesheet active.
                    setConfirmationPopup(true);
                    setConfirmPopupCb(()=>{ return ()=>handlePunchOut(activeTimeSheet)})
                }else{

                  handlePunchOut(activeTimeSheet)
                }
              }}
            >
              {(index == 0)? 'Punch Out': 'End ' + breakTimeTypes.find((b)=> b.id == activeTimeSheet.breakTypeId).name}
            </Button>
          </Grid>
          
        </Grid>
      
      </div>))}
      </div>
      <Dialog open={showBreakAuthModal} onClose={handleCloseBreakModal}>
        {(
          <BreakTypeAuthForm
            breakType={selectedBreakType}
            onClose = {handleCloseBreakModal}
            onSubmit = {handleBreakTimeAuth}
          />
        )}
      </Dialog>
      <ConfirmationModal open={confirmationPopup} onConfirm={confirmPopupCb} onClose={()=>{setConfirmationPopup(false)}} title="Are you sure you want to clock out?" content="Clocking out means that any break you have active will be punched out. Are you sure you want to clock out?"></ConfirmationModal>
    </>

  );
};


export default PunchTimeSheet;
