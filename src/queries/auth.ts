import { getSessionAccessToken, getUserId } from "@/lib/supabase/login/getUserDetails.client";
import { queryOptions } from "@tanstack/react-query";

export function queryUserId() {
    return queryOptions({
        queryKey: ["authUser"],
        queryFn: getUserId
    })
}

export function queryAccessToken() {
    return queryOptions({
        queryKey: ["authUserJWT"],
        queryFn: getSessionAccessToken
    })
}