import axios from "axios";
import { store } from "../src/store/store.js";

const api = axios.create({
    baseURL: "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
    const accessToken = store.getState().auth.accessToken;

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export default api;

