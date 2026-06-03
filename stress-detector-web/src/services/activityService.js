import api from "./api";

export const createActivity = (payload) =>
  api.post("/activities", payload);