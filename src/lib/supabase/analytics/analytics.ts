import axios from "axios";
axios.defaults.baseURL = "http://localhost:3000";

export async function getAdminAnalytics(accessToken: string) {
    const data = await axios.post("/getAnalytics", { headers: { Authorization: accessToken }})
    return data;
}