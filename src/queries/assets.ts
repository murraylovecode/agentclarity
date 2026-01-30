import { getAssets } from "@/lib/supabase/assets/assets";
import { queryOptions } from "@tanstack/react-query";

export function queryAssets(userId: string) {
    return queryOptions({
        queryKey: ["assets"],
        queryFn: () => getAssetsForUser(userId)
    })
}

async function getAssetsForUser(userId: string) {
    const data = await getAssets(userId)

    return data

}