import { getPastData } from "@/lib/supabase/past/getPastData";
import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export function queryTransactions(userId: string) {
    return queryOptions({
        queryKey: ["getTotalAmounts"],
        queryFn: () => extractData(userId)
    })
}

async function extractData(userId: string) {
    const balancesRes = await axios.post("/getAllBalances", { user_id: userId });
    const investmentsRes = await axios.post("/getAllInvestments", { user_id: userId });
    const liabilitiesRes = await axios.post("/getAllLiabilities", { user_id: userId })
    const transactionsRes = await axios.post("/getAllTransactions", { user_id: userId })
    const assetsRes = await axios.post("/getAllAssets", { user_id: userId })

    console.log(assetsRes)

    return [balancesRes, investmentsRes, liabilitiesRes, transactionsRes, assetsRes]
}

export function queryPastTransactions(userId: string) {
    return queryOptions({
        queryKey: ["getPastAmounts"],
        queryFn: () => extractPastData(userId)
    })
}

async function extractPastData(userId: string) {
    const pastData = await getPastData(userId)

    return [pastData]
}