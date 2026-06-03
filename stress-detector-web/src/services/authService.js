import api from "./api";

export const register = async (payload) => {
  const response = await api.post("/users", payload);

  return response.data;
};

export const login = async (payload) => {
  const response = await api.post(
    "/authentications",
    payload
  );

  return response.data;
};