/**
 * A wrapper function for the Fetch API that adds an Authorization header with a Bearer token to every request.
 * This function retrieves the Bearer token from session storage.
 * @param {string} url - The URL to fetch data from.
 * @param {RequestInit} [options] - Additional options to configure the fetch request (e.g., method, headers, body).
 * @returns {Promise<Response>} - A Promise that resolves to the Response object representing the result of the fetch request.
 * @throws {Error} - Throws an Error if the fetch request fails, encounters an error or if the authToken is not found in session storage.
 * @version 1.0.0
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Retrieve the Bearer token from session storage
  const authToken = sessionStorage.getItem("authToken");

  // This ensures that an authentication token is available before making the fetch request.
  if (!authToken) {
    console.error("Authentication token not found in session storage.");
  }

  // Create headers object with Authorization header containing the Bearer token
  const headers: HeadersInit = {
    ...(options?.headers || {}),
    Authorization: `Bearer ${authToken}`,
  };

  // Merge the headers with the provided options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // Make the fetch request with the updated options
  return fetch(url, fetchOptions);
}
