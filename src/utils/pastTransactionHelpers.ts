export function CalculateLastMonthTotalBalance(pastData, monthNow) {
    const ref = pastData[0]["data"]["data"][monthNow]
    return ref["cash"] + ref["bank_balance"] + ref["real_estate"] + ref["alternate_assets"] + ref["investments"]
}