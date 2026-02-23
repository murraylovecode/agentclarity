import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

axios.defaults.baseURL = "https://agentclarity.onrender.com";

export function queryAssets(userId: string) {
    return queryOptions({
        queryKey: ["assets"],
        queryFn: () => getAssetsForUser(userId)
    })
}

async function getAssetsForUser(userId: string) {
    const data = await axios.post("/getAllAssets", { user_id: userId })
    return data

}