export function calculateBankBalancesFromRawData(balancesRes) {
    let totalBankBalances = 0

    if (balancesRes.data.accounts) {
        for (let item of balancesRes.data.accounts) {
            const account = item[1].accounts;
            for (let acc of account) {
                totalBankBalances += acc.balances.available
            }
        }
    }

    return totalBankBalances
}

export function calculateInvestmentsFromRawData(investmentsRes) {
    let totalInvestment = 0
    if (investmentsRes.data.investments) {
        for (let item of investmentsRes.data.investments) {
            const holdings = item[1].holdings;
            for (let holding of holdings) {
                totalInvestment += holding.institution_value * holding.quantity
            }
        }
    }

    return totalInvestment
}

export function calculateCashFromRawData(otherRes) {
    let totalCash = 0
    if (otherRes.length > 0) {
        for (let item of otherRes) {
            if (item.type == "cash") {
                totalCash += item.value
            }
        }
    }

    return totalCash
}

export function calculateRealEstateFromRawData(otherRes) {
    let totalRealEstate = 0
    if (otherRes.length > 0) {
        for (let item of otherRes) {
            if (item.type == "real_estate") {
                totalRealEstate += item.value
            }
        }
    }
    
    return totalRealEstate
}

export function calculateAlternateAssetFromRawData(otherRes) {
    let totalAlternateAsset = 0
    if (otherRes.length > 0) {
        for (let item of otherRes) {
            if (item.type == "jewelry" || item.type == "art_collectible" || item.type == "vehicle") {
                totalAlternateAsset += item.value
            }
        }
    }
    
    return totalAlternateAsset
}

export function calculateCreditCardFromRawData(liabilitiesRes) {
    let totalCreditCard = 0
    if (liabilitiesRes.data.liabilities) {
        for (let item of liabilitiesRes.data.liabilities) {
            const credits = item[1].liabilities.credit
            for (let credit of credits) {
                totalCreditCard += credit.minimum_payment_amount
            }
        }
    }

    return totalCreditCard
}

export function calculateMortgageFromRawData(liabilitiesRes) {
    let totalMortgage = 0
    if (liabilitiesRes.data.liabilities) {
        for (let item of liabilitiesRes.data.liabilities) {
            const mortgages = item[1].liabilities.mortgage
            for (let mortgage of mortgages) {
                totalMortgage += mortgage.next_monthly_payment + mortgage.past_due_amount
            }
        }
    }

    return totalMortgage
}

export function calculateDueMortgageFromRawData(liabilitiesRes) {
    let totalFullMortgage = 0
    if (liabilitiesRes.data.liabilities) {
        for (let item of liabilitiesRes.data.liabilities) {
            const mortgages = item[1].liabilities.mortgage
            for (let mortgage of mortgages) {
                totalFullMortgage += mortgage.origination_principal_amount - mortgage.ytd_principal_paid
            }
        }
    }

    return totalFullMortgage
}

export function calculateLoanFromRawData(liabilitiesRes) {
    let totalLoan = 0
    if (liabilitiesRes.data.liabilities) {
        for (let item of liabilitiesRes.data.liabilities) {
            const loans = item[1].liabilities.student
            for (let loan of loans) {
                totalLoan += loan.minimum_payment_amount
            }
        }
    }

    return totalLoan
}

export function calculateDueLoanFromRawData(liabilitiesRes) {
    let totalFullLoan = 0
    if (liabilitiesRes.data.liabilities) {
        for (let item of liabilitiesRes.data.liabilities) {
            const loans = item[1].liabilities.student
            for (let loan of loans) {
                totalFullLoan += loan.origination_principal_amount + loan.outstanding_interest_amount - loan.ytd_principal_paid - loan.ytd_interest_paid
            }
        }
    }

    return totalFullLoan
}

export function listBankBalancesFromRawData(balancesRes) {
    const names = []
    if (balancesRes.data.accounts) {
        for (let item of balancesRes.data.accounts) {
            const accounts = item[1].accounts;
            for (let acc of accounts) {
                names.push([acc.name, item[0]])
            }
        }
    }

    return names
}

export function listInvestmentsFromRawData(investmentsRes) {
    const names = []

    if (investmentsRes.data.investments) {
        for (let item of investmentsRes.data.investments) {
            const securities = item[1].securities;
            const holdings = item[1].holdings;
            for (let i=0; i < holdings.length; i++) {
                names.push([securities[i].name, item[0], securities[i].type, holdings[i].quantity, holdings[i].institution_value, holdings[i].institution_value * holdings[i].quantity])
            }
        }
    }

    return names
}

export function calculateSecuritiesByType(investmentsRes) {
  const result: Record<string, number> = {};

  if (investmentsRes.data.investments) {
    for (let item of investmentsRes.data.investments) {
        const securities = item[1].securities;
        const holdings = item[1].holdings;
        console.log(holdings)
        for (let i=0; i < holdings.length; i++) {
            if (result[securities[i].type]) {
                console.log("hi", securities[i].type)
                result[securities[i].type] += holdings[i].institution_value * holdings[i].quantity
            }
            else {
                result[securities[i].type] = holdings[i].institution_value * holdings[i].quantity
            }
        }
    }
  }

  return result;
}

