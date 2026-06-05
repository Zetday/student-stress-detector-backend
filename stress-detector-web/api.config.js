const DEFAULT_API_BASE_URL = "http://localhost:3000";

function normalizeBaseUrl(url) {
  const trimmedUrl = String(url || "").trim();

  if (!trimmedUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmedUrl.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
);

export function getApiUrl(path = "") {
  const normalizedPath = String(path || "");

  if (!normalizedPath) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}
