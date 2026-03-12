import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export async function getAdminAnalytics(accessToken: string) {
    const data = await axios.post("/getAnalytics", { headers: { Authorization: `Bearer: ${accessToken}` }})
    return data;
}