import { getAccessToken } from "./authService";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const { auth = true, headers = {}, ...requestOptions } = options;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  if (auth) {
    const token = await getAccessToken();
    if (!token) {
      throw new ApiError("Your session has expired. Please log in again.", 401);
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Express API. Make sure the backend is running.",
      0
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload?.error?.details || null
    );
  }

  return payload;
}

export async function getHealth() {
  const response = await apiRequest("/health", { auth: false });
  return response.data;
}

export async function getMe() {
  const response = await apiRequest("/me");
  return response.data;
}

export async function updateMe(changes) {
  const response = await apiRequest("/me", {
    method: "PATCH",
    body: JSON.stringify(changes)
  });
  return response.data;
}

export async function getDashboardSummary() {
  const response = await apiRequest("/dashboard/summary");
  return response.data.summary;
}

export { API_BASE_URL };
