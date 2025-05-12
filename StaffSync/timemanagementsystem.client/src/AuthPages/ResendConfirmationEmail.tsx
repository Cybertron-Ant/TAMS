import React, { useState } from "react";
import { fetchWithAuth } from "../app/fetchWrapper";
import { Button, CircularProgress, TextField } from "@mui/material";

const ResendConfirmation = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `${API_URL}/Account/resend-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setMessage(
          "Confirmation email has been resent. Please check your inbox."
        );
      } else {
        throw new Error("Failed to resend confirmation email.");
      }
    } catch (error: any) {
      // Use `any` or a more specific error type if you have one
      console.error("Error resending email:", error);
      setMessage(error.message || "An error occurred.");
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
          Resend Confirmation Email
        </h2>
        {message && (
          <p className="my-4 text-center text-sm text-red-600">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            className="w-full"
            id="email"
            name="email"
            label="Email Address"
            type="text"
            required
            variant="outlined"
            margin="dense"
            placeholder="Enter email address"
            value={email}
            onChange={handleEmailChange}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                // Target the input root inside TextField
                borderRadius: "8px", // Apply rounded corners to the input
              },
            }}
          />
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
              "Resend Email"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResendConfirmation;
