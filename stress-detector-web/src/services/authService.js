import api from "./api";

export const register = async (payload) => {
  const response = await api.post("/users", payload);

  return response.data.data;
};

export const login = async (payload) => {
  try {
    const response = await api.post("/authentications", payload);
    return { error: false, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return { error: true, message };
  }
};

export const loginWithGoogle = async (payload) => {
  try {
    const response = await api.post("/authentications/google", payload);
    return { error: false, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return { error: true, message };
  }
};

export const logout = async (refreshToken) => {
  const response = await api.delete("/authentications", {
    data: {
      refreshToken,
    },
  });

  return response.data.data;
};

export const requestPasswordReset = async (payload) => {
  try {
    const response = await api.post("/authentications/forgot-password", payload);
    return {
      error: false,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return { error: true, message };
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await api.post("/authentications/reset-password", payload);
    return {
      error: false,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return { error: true, message };
  }
};
