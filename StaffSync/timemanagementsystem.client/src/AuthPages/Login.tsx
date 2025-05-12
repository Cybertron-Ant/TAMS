import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setEmployee } from "../app/authSlice";
import { login } from "../app/authSlice";
import { useSelector, useDispatch } from "../app/hooks";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import {
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";

// Define the type for your form state
type FormData = {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usernameOrEmail: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "rememberMe" ? checked : value, // Handle checkbox separately
    }));
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { require2FA, user } = useSelector((state) => state.auth); // Adjust based on your actual state structure
  useEffect(() => {
    if (user && !require2FA) {
      navigate("/dashboard"); // Navigate to dashboard if logged in and 2FA not required
    }
    //  else if (require2FA) {
    //   navigate("/verify-mfa-login"); // Adjust this to your 2FA verification route
    // }
  }, [user, require2FA, navigate]);

  // Here we use the loginAsync thunk
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Reset errors

    try {
      setIsLoading(true);
      // Dispatching the login thunk using formData from state
      const resultAction = await dispatch(login(formData)).unwrap();
      toast.success("Logged in successfully");
      console.log("Successfully logged in:", resultAction);

      // Conditional navigation based on the response
      if (resultAction.require2FA) {
        navigate("/login-mfa"); // Navigate to 2FA verification if required
      } else {
        if (resultAction.employee.firstLoginDate == null) {
          navigate("/update-password");
        } else {
          navigate("/"); // Navigate to dashboard otherwise
        }
      }
    } catch (rejectedValueOrSerializedError) {
      console.error("Login failed:", rejectedValueOrSerializedError);
      setError(rejectedValueOrSerializedError as string); // Update the UI to show the error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[url('/assets/auth_background.svg')]">
      <div className="grid grid-cols-[5fr_4fr] w-[60%] mx-auto rounded-md overflow-clip">
        <div className="bg-[url('/assets/login_background.jpg')] bg-cover relative">
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <div className="relative z-10 h-full flex flex-col justify-end items-start p-10">
            <img
              src="/assets/quote_icon.svg"
              alt="QuoteIcon"
              className="mb-3"
            />
            <p className="text-white font-semibold leading-5">
              Empower your workforce with a seamless <br />
              HR experience. Login to our Timesheet Management System and
              unlock the potential of your organization.
            </p>
          </div>
        </div>
        <div className="bg-white p-5">
          <div className="flex justify-center">
            <img
              src="/assets/logo.png"
              alt="Company Logo"
              className="w-[260px] h-200 mb-2"
            />
          </div>
          <h3 className="text-lg font-semibold text-center mb-5">
           Shepherd BPO TimeSheet Management System
          </h3>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-2">
            <div>
              <div>
                <TextField
                  className="w-full"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  label="Email / Username"
                  type="text"
                  autoComplete="username"
                  required
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  value={formData.usernameOrEmail}
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
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
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
              {/* Forgot Password Link */}
              {/* <div className="text-right">
                <Button
                  onClick={() => navigate("/forgot-password")}
                  style={{ textTransform: "none" }} // Keeps the text style neutral
                  color="primary"
                >
                  Forgot Password?
                </Button>
              </div> */}
            </div>
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onChange={handleChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div> */}
              <div>
                <FormControlLabel
                  htmlFor="rememberMe"
                  value="end"
                  control={
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      onChange={handleChange}
                    />
                  }
                  label="Remember Me"
                  labelPlacement="end"
                />
              </div>
            </div>
            {/* <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div> */}
            <div>
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
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
