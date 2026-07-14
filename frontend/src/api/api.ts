import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "A variável VITE_API_URL não foi configurada."
  );
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});