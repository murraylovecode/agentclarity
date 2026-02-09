import { supabase } from "../client";

export async function addAsset(userId: string, name: string, type: string, value: number) {
    const { data, error } = await supabase
    .from("user_assets")
    .insert({
        "user_id": userId,
        "name": name,
        "type": type,
        "value": value
    })
}

export async function getAssets(userId: string) {
    const { data, error } = await supabase
    .from("user_assets")
    .select("*")
    .eq("user_id", userId)

    return data
}

export async function editAsset(userId: string, name: string, type: string, newValue: number) {

    const { error } = await supabase
    .from("user_assets")
    .update({ "value": newValue })
    .eq("user_id", userId)
    .eq("type", type)
    .eq("name", name);
}

export async function deleteAsset(userId: string, name: string, type: string, value: number) {

    const { error } = await supabase
    .from("user_assets")
    .delete()
    .eq("user_id", userId)
    .eq("type", type)
    .eq("name", name)
    .eq("value", value);
}