import PermissionManager from "./PermissionManager ";
import { fetchWithAuth } from "./fetchWrapper";

class AccountHelper {
  public static async refreshAccountInformation(): Promise<void> {
    const API_URL = import.meta.env.VITE_TMS_PROD;
    const employeeCode = PermissionManager.EmployeeCode();
    
    try {
      const response = await fetchWithAuth(
        `${API_URL}/Account/information?employeeCode=${employeeCode}`
      );
      if (!response.ok) throw new Error("Failed to fetch account information");
      const resp = await response.json();
      const data = resp["data"];

      this.updateSessionStorage(data);
    } catch (error) {
      console.error("Error fetching account information:", error);
    }
  }

  private static updateSessionStorage(employeeResponseData: {
    [k: string]: any;
  }) {
    if (employeeResponseData === null) {
      throw new Error("No employee data found to update storage");
    }

    const parsedInformation = btoa(JSON.stringify(employeeResponseData));
    sessionStorage.setItem("employee", parsedInformation);
  }
}

export default AccountHelper;
