import { getAdminAnalytics } from "@/lib/supabase/analytics/analytics";
import { queryOptions } from "@tanstack/react-query";

export function queryAnalytics(userId: string) {
    return queryOptions({
        queryKey: ["queryAnalytics"],
        queryFn: () => getAdminAnalytics(userId)
    })   
}