import { supabase } from "@/lib/supabase/client";


export async function getPastData(userId) {
    const { data, error } = await supabase
    .from("past_data")
    .select("*")
    .eq("user_id", userId)

    if (data.length == 0) {
        return false;
    }
    else {
        return data;
    }
}