import React, { useState } from "react";
import { verifyLoginMfa } from "../app/authSlice";
import { useSelector, useDispatch } from "../app/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { Button, CircularProgress, TextField } from "@mui/material";
import { RootState } from "../app/store";

const MfaVerification: React.FC = () => {
  const { empCode } = useParams<{ empCode: string }>();
  const [employeeCode, setEmployeeCode] = useState(empCode);
  const [token, setToken] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(
      verifyLoginMfa({ employeeCode: employeeCode.trim(), token: token.trim() })
    )
      .unwrap()
      .then((response) => {
        // Check if the verification was successful
        if (response.message === "MFA verification successful and logged in") {
          if (response["employee"]["firstLoginDate"] == null) {
            navigate("/update-password");
          } else {
            navigate("/"); // Navigate to root path
          }
        }
      })
      .catch((error) => {
        console.error("Verification failed:", error);
        // Handle any errors here, if necessary
      });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[url('/assets/auth_background.svg')]">
      <div className="w-[30%] mx-auto mt-10 shadow-lg p-6 bg-white rounded-lg">
        <img
          src="/assets/logo.png"
          alt="QuoteIcon"
          className="mb-3 w-[200px] mx-auto"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          MFA Verification
        </h2>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              className="w-full"
              id="employeeCode"
              name="employeeCode"
              label="Employee Code"
              type="text"
              required
              variant="outlined"
              margin="dense"
              placeholder="Enter employee code"
              onChange={(e) => setEmployeeCode(e.target.value)}
              value={employeeCode}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  // Target the input root inside TextField
                  borderRadius: "8px", // Apply rounded corners to the input
                },
              }}
            />
          </div>
          <div>
            <TextField
              className="w-full"
              id="token"
              name="token"
              label="Token"
              type="text"
              required
              variant="outlined"
              margin="dense"
              placeholder="Enter your token"
              onChange={(e) => setToken(e.target.value)}
              value={token}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  // Target the input root inside TextField
                  borderRadius: "8px", // Apply rounded corners to the input
                },
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            className="w-full py-2 px-4 text-sm font-semibold text-white"
            sx={{
              borderRadius: "8px", // Adjust the border radius as needed
              "&:disabled": {
                backgroundColor: "gray.400",
              },
              paddingBlock: "10px",
              fontWeight: "500",
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MfaVerification;
