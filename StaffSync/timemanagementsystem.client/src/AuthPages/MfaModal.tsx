import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { verifyLoginMfa, verifyMFACode } from '../app/authSlice';
import { useDispatch } from '../app/hooks';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../app/fetchWrapper';
import { toast } from 'react-toastify';
import PermissionManager from '../app/PermissionManager ';

interface props {
    open: boolean,
    handleState: () => void
    handleConfirm: () => void
}

const MfaModal: React.FC<props> = ({open, handleState, handleConfirm}) => {
//   const { empCode } = useParams<{ empCode: string }>();
//   const [employeeCode, setEmployeeCode] = useState(empCode);

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]); // Create a refs array
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const employee = PermissionManager.EmployeeObj();

  useEffect(() => {
    const sendMFA = async () => {
        // Assuming EmployeeObj.email contains the email address you want to send
        const requestBody = JSON.stringify({
            email: employee.email,  // Assuming 'email' is the correct field expected by the API
            model: {} // Include the 'model' property if it's required, adjust based on actual API requirements
        });
    
        const response = await fetchWithAuth(`${API_URL}/Account/send-mfa-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody
        });
    
        if (response.ok) {
            toast.success("MFA code sent successfully.");
        } else {
            // Handle error response, potentially showing more detailed error messages
            toast.error(`Error: code not sent `);
        }
    }
    
    open ? sendMFA() : null
  }, [open])
  

  const handleSubmit = async () => {
    // Assuming otp is an array, transform it to a string without commas for the API call
    const formattedOtp = otp.join(''); // More succinct and clear than using toString().replace(/,/g, '')
    
    try {
      const data =
  await dispatch(verifyMFACode({ UserID: employee.userId, token: formattedOtp }))
  .unwrap();
      if (data.message === "2FA verification successful") {
      toast.success("MFA verification successful");
      setOtp([]);
      handleState()
      handleConfirm()
    } else {
      // This block may actually be redundant if errors are correctly thrown in the thunk
      throw new Error("Verification unsuccessful"); 
    }
    } catch (error) {
      console.error("Verification failed: " + error.message);
    toast.error("Verification failed");
    }
  }

  const handleChange = (event, index) => {
    const value = event.target.value;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input field if the value is not empty
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Enter MFA Token</DialogTitle>
        <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      <form onSubmit={handleSubmit}>
      {otp.map((data, index) => (
        <FormControl 
        key={index}
        >
            <TextField
          required
          type="text"
          value={data}
          onChange={(e) => handleChange(e, index)}
          onFocus={(e) => e.target.select()}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center', width: '50px' }
          }}
          inputRef={(el) => inputRefs.current[index] = el} // Assign ref to each input
        />
        </FormControl>
      ))}
      </form>
    </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleState} color="primary">
            Cancel
          </Button>
          
          <Button onClick={handleSubmit} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default MfaModal;
