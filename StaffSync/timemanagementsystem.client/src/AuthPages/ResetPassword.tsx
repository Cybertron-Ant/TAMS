import { Visibility, VisibilityOff } from "@mui/icons-material";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation } from "react-router-dom";

interface FormData {
  email: string;
  token: string;
  newPassword: string;
}

const ResetPassword: React.FC = () => {
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const [newPassword, setNewPassword] = useState<string>("");
  const [email, token] = [useQuery().get("email"), useQuery().get("token")];

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPasswordError, setCurrentPasswordError] = useState<string>("");
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    console.log("Parameter Information", email, token);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData: FormData = {
      email,
      token,
      newPassword,
    };

    try {
      const response = await fetch(
        `${API_URL}/Account/reset-password`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error("Unable to reset password", err);
        setCurrentPasswordError(err);
        // Clear error message after 5 seconds
        const [seconds, millisecond] = [5, 1_000];
        setTimeout(() => {
          setCurrentPasswordError("");
        }, seconds * millisecond);
      } else {
        toast.success("Password reset successfully");
        // Navigate to dashboard after password is updated
        navigate("/");
      }
    } catch (error) {
      console.error("Unable to reset password", error);
      toast.error(
        "Oops! Something went wrong while resetting your password. Please try again later."
      );
    } finally {
      setIsLoading(false);
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
            onClick={() => navigate("/login")}
          >
            <ArrowBackIcon sx={{ fontSize: "18px", mr: "5px" }} /> Visit Login
          </Button>
        </div>
        <img
          src="/assets/logo.png"
          alt="QuoteIcon"
          className="mb-3 w-[200px] mx-auto"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Reset Your Password
        </h2>
        <p className="mb-4 text-center text-sm">
          Almost done. Enter your new password and you're good to go.
        </p>
        <p className="mb-4 text-center text-sm">
          <strong>{email}</strong>
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
          <div className="hidden">
            <TextField
              className="w-full"
              id="token"
              name="token"
              label="Token"
              type="text"
              required
              disabled
              variant="outlined"
              margin="dense"
              autoComplete="new-password"
              placeholder="Enter your token"
              error={!!error}
              value={token}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
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
                  borderRadius: "8px",
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

          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            className="w-full py-2 px-4 text-sm font-semibold text-white"
            sx={{
              borderRadius: "8px",
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
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
