import React, { useState } from "react";
// import { useDispatch, useSelector } from 'react-redux';
import { verifyLoginMfa } from "../app/authSlice";
import { useSelector, useDispatch } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { fetchWithAuth } from "../app/fetchWrapper";
import { toast } from "react-toastify";
import { Employee } from "../interfaces/Employee";

interface FormData {
  employeeCode: string;
  currentPassword: string;
  newPassword: string;
}

const UpdatePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPasswordError, setCurrentPasswordError] = useState<string>("");
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();

  const handleToggleCurrentPassword = () => {
    setShowCurrentPassword(
      (prevShowCurrentPassword) => !prevShowCurrentPassword
    );
  };

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleToggleCPassword = () => {
    setShowCPassword((prevShowCPassword) => !prevShowCPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const employee = (): Employee => {
      if (!!sessionStorage.getItem("employee")) {
        return JSON.parse(atob(sessionStorage.getItem("employee") as string));
      } else {
        console.error("Unable to find logged in user information");
      }
    };

    const formData: FormData = {
      currentPassword,
      newPassword,
      employeeCode: employee().employeeCode,
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
          `${API_URL}/Account/change-password`,
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const err = await response.json();
          console.error("Unable to update password", err);
          setCurrentPasswordError(err);
          // Clear error message after 5 seconds
          const [seconds, millisecond] = [5, 1_000];
          setTimeout(() => {
            setCurrentPasswordError("");
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
        <img
          src="/assets/logo.png"
          alt="QuoteIcon"
          className="mb-3 w-[200px] mx-auto"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Update Your Password
        </h2>
        <p className="mb-4 text-center text-sm">
          Almost done. Enter your new password and you're good to go.
        </p>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
        {currentPasswordError && (
          <p className="mt-4 text-center text-sm text-red-600">
            {currentPasswordError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              className="w-full"
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              required
              error={!!currentPasswordError}
              variant="outlined"
              margin="dense"
              autoComplete="new-password"
              placeholder="Enter your current password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              value={currentPassword}
              sx={{
                "& .MuiOutlinedInput-root": {
                  // Target the input root inside TextField
                  borderRadius: "8px", // Apply rounded corners to the input
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleCurrentPassword}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
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
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
