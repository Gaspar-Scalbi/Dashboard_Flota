import axios from "./axios.js";

export const loginRequest = (usuario) => axios.post("/login", usuario);
export const verifyTokenRequest = () => axios.get("/verifyToken");
export const logoutRequest = () => axios.post("/logout");
