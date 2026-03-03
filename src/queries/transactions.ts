import { getPastData } from "@/lib/supabase/past/getPastData";
import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export function queryTransactions(accessToken: string) {
    return queryOptions({
        queryKey: ["getTotalAmounts"],
        queryFn: () => extractData(accessToken)
    })
}

async function extractData(accessToken: string) {
    const balancesRes = await axios.post("/getAllBalances", {}, { headers: { Authorization: `Bearer: ${accessToken}` }});
    const investmentsRes = await axios.post("/getAllInvestments", {}, { headers: { Authorization: `Bearer: ${accessToken}` }});
    const liabilitiesRes = await axios.post("/getAllLiabilities", {}, { headers: { Authorization: `Bearer: ${accessToken}` }})
    const transactionsRes = await axios.post("/getAllTransactions", {}, { headers: { Authorization: `Bearer: ${accessToken}` }})
    const assetsRes = await axios.post("/getAllAssets", {}, { headers: { Authorization: `Bearer: ${accessToken}` }})

    return [balancesRes, investmentsRes, liabilitiesRes, transactionsRes, assetsRes]
}

export function queryPastTransactions(accessToken: string) {
    return queryOptions({
        queryKey: ["getPastAmounts"],
        queryFn: () => extractPastData(accessToken)
    })
}

async function extractPastData(userId: string) {
    const pastData = await getPastData(userId)

    return [pastData]
}