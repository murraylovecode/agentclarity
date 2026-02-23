import { supabase } from "../client";
import axios from "axios";
axios.defaults.baseURL = "https://agentclarity.onrender.com";

export async function addAsset(userId: string, name: string, type: string, value: number) {
    const response = await axios.post("/addAsset", { user_id: userId, name: name, type: type, value: value })
}

export async function editAsset(userId: string, name: string, type: string, newValue: number) {

    const response = await axios.post("/editAsset", { user_id: userId, name: name, type: type, new_value: newValue })
}

export async function deleteAsset(userId: string, name: string, type: string) {

    const response = await axios.post("/deleteAsset", { user_id: userId, name: name, type: type })
}