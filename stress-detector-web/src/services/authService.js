const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
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

export function register({ name, email, password }) {
  return request("/users", {
    method: "POST",
    body: JSON.stringify({
      fullname: name,
      email,
      password,
      role: "user",
    }),
  });
}

export function login({ email, password }) {
  return request("/authentications", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}
