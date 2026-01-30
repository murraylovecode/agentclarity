import { supabase } from "@/lib/supabase/client";


export async function checkRandomId(share) {
    const { data, error } = await supabase
    .from("anonymized_profiles")
    .select("share_code")
    .eq("share_code", share)

    if (data.length == 0) {
        return false;
    }
    else {
        return true;
    }
}

export async function getReportById(share) {
    const { data, error } = await supabase
    .from("anonymized_profiles")
    .select("*")
    .eq("share_code", share)

    if (data.length == 0) {
        return null;
    }
    else {
        return data;
    }
}

export async function generateReport(share, userId, cash, bankBalance, investment, realEstate, alternateAsset) {
    const { error } = await supabase
    .from("anonymized_profiles")
    .insert( { 
        user_id: userId, 
        share_code: share, 
        cash_percentage: cash,
        bank_balance_percentage: bankBalance,
        investment_percentage: investment,
        real_estate_percentage: realEstate,
        alternate_asset_percentage: alternateAsset,
    })

    if (error) {
        console.log(error)
        return false
    }
    else {
        return true;
    }
}


