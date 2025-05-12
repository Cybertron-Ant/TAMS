// src/store/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store"; // Adjust the import path as necessary
import { fetchWithAuth } from "./fetchWrapper";
import { EmployeeState } from "../interfaces/Employee";
// import { useNavigate } from "react-router-dom";


const initialState: EmployeeState = {
  employee: null,
  isLoading: false, // Initialize isLoading
  user: null, // Initialize user
  error: null,
  require2FA: false,
};

const API_URL = import.meta.env.VITE_TMS_PROD;

// Async thunk for enabling two-factor authentication
export const enableTwoFactorAuth = createAsyncThunk(
  "auth/enableTwoFactorAuth",
  async (employeeCode: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/Account/enable-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeCode), // This will ensure the string is correctly enclosed in double quotes
      });
      if (!response.ok) throw new Error("Failed to enable MFA.");
      return await response.json();
    } catch (error: unknown) {
      // Error handling logic remains the same
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Async thunk for verifying two-factor authentication
export const verifyTwoFactor = createAsyncThunk(
  "auth/verifyTwoFactor",
  async (
    data: { userId: string; token: string; rememberMe: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/Account/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to verify MFA.");
      return await response.json();
    } catch (error: unknown) {
      // Check if the error is an instance of Error and thus has a message property
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      // If it's not an Error instance or doesn't have a message, return a generic message
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};
// const navigate = useNavigate();

export const login = createAsyncThunk(
  "auth/login",
  async (formData: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/Account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Check response content type
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          // When response is JSON and request failed
          const error = await response.json();
          return rejectWithValue(error.message || "Login failed");
        } else {
          // When response is not JSON
          const errorText = await response.text();
          return rejectWithValue(errorText || "An unexpected error occurred");
        }
      }

      // Assuming response is successful and JSON formatted
      const data = await response.json();

      // Check for existence and store the user authToken into the browsers session storage
      if (data["authToken"]) {
        sessionStorage.setItem("authToken", data["authToken"]);
      }

      // Store employee data to session storage
      if (data["employee"]) {
        sessionStorage.setItem(
          "employee",
          btoa(JSON.stringify(data["employee"]))
        );
      }

      // Handling specific actions like 2FA based on the response
      if (data.action && data.action === "login-mfa") {
        // For example, handling 2FA requirement
        console.log("2FA required", data);
        return { ...data, require2FA: true };
      }

      // Successful login without 2FA requirement
      return { ...data, require2FA: false };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during login:", error.message);
        return rejectWithValue("Network error or server not responding");
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

interface verifyMFACodeProps {
  UserID: string;
  token: string;
}

export const verifyMFACode = createAsyncThunk(
  "auth/verifyMFACode",
  async ({ UserID, token }: verifyMFACodeProps, {rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/Account/verify-mfa-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserID, token }),
      });

      const data = response.json()

      if(!response.ok){
        const error = await response.json();
        console.log(error);
      }
      return data;
    }
    catch(error){
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
  )

  interface VerifyLoginMfaArgs {
    employeeCode: string;
    token: string;
  }

export const verifyLoginMfa = createAsyncThunk(
  "auth/verifyLoginMfa",
  // Use the defined type for the function's parameters
  async ({ employeeCode, token }: VerifyLoginMfaArgs, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/Account/login-mfa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeCode, token }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        return rejectWithValue(error.message || "An error occurred");
      }

      // Assuming response is successful and JSON formatted
      const data = await response.json();

      //Commented out because login already sets ut

      // // Check for existence and store the user authToken into the browsers session storage
      // if (data["authToken"]) {
      //   sessionStorage.setItem("authToken", data["authToken"]);
      // }

      // // Store employee data to session storage
      // if (data["employee"]) {
      //   sessionStorage.setItem(
      //     "employee",
      //     btoa(JSON.stringify(data["employee"]))
      //   );
      // }

      return data;
    } catch (error) {
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const submitLeave = createAsyncThunk(
  "auth/submitLeave",
  async (
    sickCallData: {
      dateOfAbsence: string;
      reason: string;
      expectedReturnDate: string;
      shift: string;
      submittedDocument: boolean;
      employeeCode: string;
      timeOfNotice: string;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const employee = state.auth.employee;
    if (!employee) {
      return rejectWithValue("No employee data found");
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/LeaveTrackers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authorization headers if needed
        },
        body: JSON.stringify({
          ...sickCallData,
          employeeCode: employee.employeeCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to submit sick call"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Define your slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmployee: (state, action: PayloadAction<EmployeeState["employee"]>) => {
      state.employee = action.payload;
    },
    logout: (state) => {
      state.employee = null;
    },
    // You may add more reducers here
  },
  extraReducers: (builder) => {
    // Handle async thunks' states, e.g., fulfilled, pending, rejected
    builder
      .addCase(enableTwoFactorAuth.fulfilled, (state, action) => {
        // Handle successful MFA enablement
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        // Handle successful MFA verification
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.require2FA = action.payload.require2FA;
        if (!state.require2FA) {
          // If 2FA is not required, update user/employee info here
          state.user = action.payload.user; // Assuming your payload has user info
          state.employee = action.payload.employee; // Or whatever data you need
        }
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyLoginMfa.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyLoginMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.employee = action.payload.employee;
        state.error = null;
      })
      .addCase(verifyLoginMfa.rejected, (state, action) => {
        state.isLoading = false;
        // Use type assertion to treat action.payload as a string
        state.error = (action.payload as string) || "An unknown error occurred";
      }); // Handling submitLeave thunk
    builder
      .addCase(submitLeave.pending, (state) => {
        // Optionally handle pending state, e.g., show loading indicator
      })
      .addCase(submitLeave.fulfilled, (state, action) => {
        // Handle successful sick call submission
        // You might want to update your state or show a success message
      })
      .addCase(submitLeave.rejected, (state, action) => {
        // Handle errors
        // You might want to store the error in state or show an error message
      });

    // Handle other thunks as necessary
  },
});

// Export actions and reducer
export const { setEmployee, logout } = authSlice.actions;
export default authSlice.reducer;
