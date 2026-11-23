const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    console.error("NETWORK ERROR:", error);

    throw new Error(
      "Cannot connect to backend. Make sure the backend is running."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      status: response.status,
      endpoint,
      data
    });

    const message =
      import.meta.env.DEV && data.detail
        ? `${data.message || "Request failed."} ${data.detail}`
        : data.message || "Request failed.";

    throw new Error(message);
  }

  return data;
}

export default api;
