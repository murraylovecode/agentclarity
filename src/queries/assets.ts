import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

export function queryAssets(userId: string) {
    return queryOptions({
        queryKey: ["assets"],
        queryFn: () => getAssetsForUser(userId)
    })
}

async function getAssetsForUser(accessToken: string) {
    const data = await axios.post("/getAllAssets", {}, { headers: { Authorization: `Bearer: ${accessToken}` }})
    return data

}