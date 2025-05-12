import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PermissionManager from "../../app/PermissionManager ";
import { enableTwoFactorAuth } from "../../app/authSlice";
import { useDispatch } from "../../app/hooks";

const UserProfile: React.FC = () => {
  const employee = PermissionManager.EmployeeObj();
  const dispatch = useDispatch();
  const [isRequesting2FA, setIsRequesting2FA] = useState(false);
  console.log(employee?.employeeCode);
  const navigate = useNavigate();
  const handleEnable2FA = async () => {
    if (!employee || !employee.employeeCode) {
      console.error("Employee code is not available.");
      return;
    }

    setIsRequesting2FA(true);
    try {
      // Dispatch the enableTwoFactorAuth thunk with the employee code
      await dispatch(enableTwoFactorAuth(employee.employeeCode)).unwrap();
      // If successful, you can show a success message or handle the state update here
      navigate("/verify-mfa");
      console.log("Two-factor authentication enabled successfully.");
    } catch (error) {
      // If there's an error, you can handle it here, e.g., show an error message
      console.error("Failed to enable two-factor authentication:", error);
    } finally {
      setIsRequesting2FA(false);
    }
  };

  if (!employee) {
    return <div className="text-center mt-5">Please log in.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-5 border rounded shadow bg-white">
      <h1 className="text-2xl font-semibold mb-5">User Profile</h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name
        </label>
        <p className="p-2 bg-gray-100 rounded">
          {employee.firstName} {employee.lastName}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <p className="p-2 bg-gray-100 rounded">{employee.email}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Role
        </label>
        <p className="p-2 bg-gray-100 rounded">{employee.role}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          UserId
        </label>
        <p className="p-2 bg-gray-100 rounded">{employee.userId}</p>
      </div>
      {/* Add more fields as necessary */}

      <button
        onClick={handleEnable2FA}
        className={`mt-4 px-4 py-2 rounded text-white ${
          isRequesting2FA ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
        } focus:outline-none focus:shadow-outline`}
        disabled={isRequesting2FA}
      >
        {isRequesting2FA ? "Requesting..." : "Enable Two-Factor Authentication"}
      </button>
    </div>
  );
};

export default UserProfile;
