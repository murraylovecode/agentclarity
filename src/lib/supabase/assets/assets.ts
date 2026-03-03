import { supabase } from "../client";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:3000";

export async function addAsset(accessToken: string, name: string, type: string, value: number) {
    const response = await axios.post("/addAsset", { name: name, type: type, value: value }, { headers: { Authorization: `Bearer: ${accessToken}` }})
}

export async function editAsset(accessToken: string, name: string, type: string, newValue: number) {

    const response = await axios.post("/editAsset", { name: name, type: type, new_value: newValue }, { headers: { Authorization: `Bearer: ${accessToken}` }})
}

export async function deleteAsset(accessToken: string, name: string, type: string) {

    const response = await axios.post("/deleteAsset", { name: name, type: type }, { headers: { Authorization: `Bearer: ${accessToken}` }})
}