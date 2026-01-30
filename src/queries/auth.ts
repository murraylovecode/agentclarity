import { getUserId } from "@/lib/supabase/login/getUserDetails.client";
import { queryOptions } from "@tanstack/react-query";

export function queryUserId() {
    return queryOptions({
        queryKey: ["authUser"],
        queryFn: getUserId
    })
}