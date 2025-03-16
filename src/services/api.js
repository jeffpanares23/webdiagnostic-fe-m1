import axios from "axios";
const baseUrl = "https://bdt.proweaver.tools/web-diagnostic-api/public";
// Set up a base URL for your backend API
const apiClient = axios.create({
  baseURL: `${baseUrl}/api/auth`, // Update with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Export functions for API calls
export const login = (credentials) => apiClient.post("/login", credentials);

export default apiClient;
