export function CalculateLastMonthTotalBalance(pastData) {
    const ref = pastData[0]["data"]["data"][0]
    return ref["cash"] + ref["bank_balance"] + ref["real_estate"] + ref["alternate_asset"] + ref["investment"]
}