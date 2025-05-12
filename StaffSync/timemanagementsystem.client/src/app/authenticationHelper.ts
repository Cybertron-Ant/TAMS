import { fetchWithAuth } from "./fetchWrapper";

import { toast } from "react-toastify";
import { cleanUpSessionStorage } from "./utils";

const API_URL = import.meta.env.VITE_TMS_PROD;
const LOGIN_ROUTE = "/login";
const SECONDS_UNTIL_REDIRECT = 2;

export default class AuthenticationHelper {
  /**
   * Displays a warning message to the user based on the reason for logout.
   *
   * @param {LogoutReason} reason - The reason for logout.
   */
  static displayLogoutMessage(reason: LogoutReason): void {
    const sessionExpiredWarnings = [
      "Your session has timed out. Please log in again.",
      "Session expired. Log in to continue.",
      "You have been logged out due to inactivity. Please log in.",
    ];

    const authTokenNotFoundWarnings = [
      "Authentication token is missing. Please log in again.",
      "Auth token not found. Please log in.",
      "Missing authentication token. Please reauthenticate.",
    ];

    const authTokenNotFoundInfos = [
      "Make sure your browser settings allow cookies for staying logged in.",
      "Enable cookies in your browser settings to stay logged in.",
      "Ensure cookies are enabled to maintain your login session.",
    ];

    const generalLogoutSuccesses = [
      "You have logged out successfully.",
      "Logout successful. See you next time!",
      "Logged out. Have a great day!",
    ];

    // Helper function to get a random message from an array
    const getRandomMessage = (messages: string[]) =>
      messages[Math.floor(Math.random() * messages.length)];

    // Display appropriate toast messages based on the logout reason
    switch (reason) {
      case LogoutReason.SESSION_EXPIRED:
        toast.warning(getRandomMessage(sessionExpiredWarnings));
        break;
      case LogoutReason.AUTH_TOKEN_NOT_FOUND:
        toast.warning(getRandomMessage(authTokenNotFoundWarnings));
        toast.info(getRandomMessage(authTokenNotFoundInfos));
        break;
      case LogoutReason.GENERAL_LOGOUT:
      default:
        toast.success(getRandomMessage(generalLogoutSuccesses));
        break;
    }
  }

  /**
   * Checks if the user is logged in by verifying the login status.
   *
   * @returns {Promise<boolean>} A promise that resolves to true if the user is authenticated, false otherwise.
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const resp = await fetchWithAuth(`${API_URL}/Account/login-status`);

      // Check for 401 Unauthorized status
      if (resp.status === 401) {
        this.logout(LogoutReason.SESSION_EXPIRED);
        this.redirectToLogin(LOGIN_ROUTE, SECONDS_UNTIL_REDIRECT);
        return false;
      }

      const data: RespData = await resp.json();
      const userIsAuthenticated = data && data.isAuthenticated;

      // Check for authenticated status
      if (!userIsAuthenticated) {
        return false;
      }

      // Authenticated User
      return true;
    } catch (error) {
      console.error("An error occurred, please try again later.", error);
      this.logout(LogoutReason.SESSION_EXPIRED);
      this.redirectToLogin(LOGIN_ROUTE, SECONDS_UNTIL_REDIRECT);
      return false;
    }
  }

  /**
   * Logs out the user.
   * This function should be implemented to handle the logout process.
   */
  static logout(reason: LogoutReason = LogoutReason.GENERAL_LOGOUT) {
    // try {
    //   const resp = await fetchWithAuth(`${API_URL}/Account/logout`, {
    //     method: "POST",
    //   });
    // } catch (error) {
    //   console.error("An error occurred, please try again later.", error);
    // } finally {
    cleanUpSessionStorage();
    this.displayLogoutMessage(reason);
    // }
  }

  /**
   * This function does a vanilla JavaScript redirect to the login route after a specified delay in seconds
   * @param loginRoute The route to the login page of the application
   * @param delay Seconds this function should delay until executed (Default: 2)
   */
  static redirectToLogin(
    loginRoute: string,
    delay: number = SECONDS_UNTIL_REDIRECT
  ) {
    setTimeout((_) => (location.href = loginRoute), delay * 1000);
  }
}

/**
 * Define an enumeration/list for different logout reasons
 */
export enum LogoutReason {
  SESSION_EXPIRED = "SESSION_EXPIRED",
  AUTH_TOKEN_NOT_FOUND = "AUTH_TOKEN_NOT_FOUND",
  GENERAL_LOGOUT = "GENERAL_LOGOUT",
}
export type RespData = { isAuthenticated: boolean; message: string };
