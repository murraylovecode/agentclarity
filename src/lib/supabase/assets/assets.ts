import { supabase } from "../client";
import axios from "axios";

export async function addAsset(userId: string, name: string, type: string, value: number) {
    const response = await axios.post("/addAssets", { user_id: userId, name: name, type: type, value: value })
    console.log(response)
}

export async function editAsset(userId: string, name: string, type: string, newValue: number) {

    const response = await axios.post("/editAssets", { user_id: userId, name: name, type: type, new_value: newValue })
    console.log(response)
}

export async function deleteAsset(userId: string, name: string, type: string) {

    const response = await axios.post("/deleteAssets", { user_id: userId, name: name, type: type })
    console.log(response)
}