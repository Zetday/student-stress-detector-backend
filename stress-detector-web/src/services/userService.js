import { getApiUrl } from "../../api.config";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");
  let response;

  try {
    response = await fetch(getApiUrl(endpoint), {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    return {
      error: true,
      message: "Tidak dapat terhubung ke server. Coba lagi nanti.",
    };
  }

  const result = await response.json().catch(() => ({
    message: "Response server tidak valid.",
  }));

  if (!response.ok) {
    return {
      error: true,
      message: result.message || "Terjadi kesalahan pada server.",
    };
  }

  return {
    error: false,
    data: result.data,
    message: result.message,
  };
}

export function getProfile() {
  return request("/profiles/me");
}
