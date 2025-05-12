import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, CircularProgress, TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    var response = null;

    try {
      response = await fetch(`${API_URL}/Account/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      toast.success(data.message || "Password reset email sent successfully!");
      setEmail("")
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[url('/assets/auth_background.svg')]">
      <div className="bg-white p-5 rounded-lg shadow-lg">
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
          Forgot Password?
        </h2>
        <p className="mb-4 text-center text-sm">
          Almost done. Enter the email address
          <br /> assoiciated with your account to regain access to the HRMS
          system.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            className="w-full"
            label="Email"
            type="email"
            autoComplete="email"
            required
            margin="dense"
            variant="outlined"
            onChange={handleEmailChange}
            value={email}
          />
          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#007FFF",
              "&:hover": {
                backgroundColor: "#0059b2",
              },
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

export default ForgotPassword;
