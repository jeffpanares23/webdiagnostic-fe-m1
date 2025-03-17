import axios from "axios";
import baseUrl from "../config";

const apiClient = axios.create({
  baseURL: `${baseUrl}/api/auth`, // Update with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Export functions for API calls
export const login = (credentials) => apiClient.post("/login", credentials);

export default apiClient;
