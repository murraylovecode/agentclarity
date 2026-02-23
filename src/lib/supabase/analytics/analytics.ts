import axios from "axios";
axios.defaults.baseURL = "https://agentclarity.onrender.com";

export async function getAdminAnalytics(userId: string) {
    const data = await axios.post("/getAnalytics", { "user_id": userId })
    console.log("here")
    console.log(data)
    return data;
}