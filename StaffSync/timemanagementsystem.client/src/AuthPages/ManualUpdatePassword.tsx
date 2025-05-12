import { Visibility, VisibilityOff } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../app/fetchWrapper";
import { Employee } from "../interfaces/Employee";

interface FormData {
  userId: string;
  newPassword: string;
}

const ManualUpdatePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();
  const { employeeCode } = useParams<{ employeeCode: string }>();

  const [employee, setEmployee] = useState<Employee | null>();

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleToggleCPassword = () => {
    setShowCPassword((prevShowCPassword) => !prevShowCPassword);
  };

  /**
   * Fetch the employee that will be updated with a new password
   */
  const fetchEmployee = async () => {
    // Set loading of the page to true until the employee information is fetched
    setLoading(true);

    // fetch employee from the api
    try {
      const response = await fetchWithAuth(
        `${API_URL}/Employees/${employeeCode}`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch employee with code: ${employeeCode}`);
      const data = await response.json();

      // Assuming that the data
      setEmployee(data);

      // set loading to false if successful
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shifts data:", error);
    }
  };

  // ran on component startup
  useEffect(() => {
    fetchEmployee();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData: FormData = {
      newPassword,
      userId: employee.employeeCode,
    };

    if (newPassword != confirmPassword) {
      // Disable loading state on error
      setIsLoading(false);

      setError(
        "Hmm, it looks like your passwords don't match. Let's give it another shot."
      );
      // Clear error message after 5 seconds
      const [seconds, millisecond] = [5, 1_000];
      setTimeout(() => {
        setError("");
      }, seconds * millisecond);
    } else {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/Account/manual-reset-password`,
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const err = await response.json();
          console.error("Unable to update password", err);
          setError(err);
          // Clear error message after 5 seconds
          const [seconds, millisecond] = [5, 1_000];
          setTimeout(() => {
            setError("");
          }, seconds * millisecond);
        } else {
          toast.success("Password updated successfully");
          // Navigate to dashboard after password is updated
          navigate("/");
        }
      } catch (error) {
        console.error("Unable to update password", error);
        toast.error(
          "Oops! Something went wrong while changing your password. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[url('/assets/auth_background.svg')]">
      <div className="w-[30%] mx-auto mt-10 shadow-lg p-6 bg-white rounded-lg">
        <div className="flex justify-between mb-4">
          <Button
            sx={{
              backgroundColor: "grey",
              textTransform: "none",
              color: "white",
              "&:hover": { backgroundColor: "#2d2d2d" },
            }}
            onClick={() => history.back()}
          >
            <ArrowBackIcon sx={{ fontSize: "18px", mr: "5px" }} /> Go Back
          </Button>
        </div>
        <img
          src="/assets/logo.png"
          alt="A.G.S Company Logo"
          className="mb-3 w-[200px] mx-auto"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Manual Password Update
        </h2>
        <p className="mb-4 text-center text-sm">
          Almost done. Enter the new password for
          <strong>
            {" "}
            {(employee && employee.firstName) || "Loading..."}
          </strong>{" "}
          you're good to go.
        </p>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              className="w-full"
              id="password"
              name="password"
              label="New Password"
              type={showPassword ? "text" : "password"}
              required
              variant="outlined"
              margin="dense"
              autoComplete="new-password"
              placeholder="Enter your password"
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!error}
              value={newPassword}
              sx={{
                "& .MuiOutlinedInput-root": {
                  // Target the input root inside TextField
                  borderRadius: "8px", // Apply rounded corners to the input
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div>
            <TextField
              className="w-full"
              id="cPassword"
              name="cPassword"
              label="Confirm New Password"
              type={showCPassword ? "text" : "password"}
              required
              variant="outlined"
              margin="dense"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
              value={confirmPassword}
              sx={{
                "& .MuiOutlinedInput-root": {
                  // Target the input root inside TextField
                  borderRadius: "8px", // Apply rounded corners to the input
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleCPassword} edge="end">
                      {showCPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || loading}
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
            {isLoading || loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ManualUpdatePassword;
