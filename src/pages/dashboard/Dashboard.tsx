import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  Droplets,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { AssetDialog } from "@/components/assets/AssetDialog";

import { ClipLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";
import { queryPastTransactions, queryTransactions } from "@/queries/transactions";
import { calculateAlternateAssetFromRawData, calculateBankBalancesFromRawData, calculateCashFromRawData, calculateCreditCardFromRawData, calculateDueLoanFromRawData, calculateDueMortgageFromRawData, calculateInvestmentsFromRawData, calculateLoanFromRawData, calculateMortgageFromRawData, calculateRealEstateFromRawData } from "@/utils/transactionHelpers";
import { queryAccessToken, queryUserId } from "@/queries/auth";
import { useNavigate } from "react-router-dom";
import { CalculateLastMonthTotalBalance } from "@/utils/pastTransactionHelpers";

// Demo data

const concentrationRisks = [
  { name: "Tech Sector", exposure: 42, threshold: 30, severity: "high" },
  { name: "Single Stock (NVDA)", exposure: 18, threshold: 10, severity: "medium" },
  { name: "USD Currency", exposure: 85, threshold: 70, severity: "low" },
];
const recentChanges = [
  { type: "gain", asset: "NVDA", change: 15200, date: "Today" },
  { type: "loss", asset: "Real Estate Fund", change: -8500, date: "Yesterday" },
  { type: "gain", asset: "BTC", change: 5400, date: "2 days ago" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {

  axios.defaults.baseURL = "http://localhost:3000";

  const [dialogOpen, setDialogOpen] = useState(false);

  const [bankBalance, setBankBalance] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [cash, setCash] = useState(0)
  const [realEstateAmount, setRealEstateAmount] = useState(0)
  const [alternateAssets, setAlternateAssets] = useState(0)

  const [creditCardAmount, setCreditCardAmount] = useState(0)
  const [mortgageAmount, setMortgageAmount] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)

  const [fullMortgageAmount, setFullMortgageAmount] = useState(0)
  const [fullLoanAmount, setFullLoanAmount] = useState(0)

  const [immediateAmount, setImmediateAmount] = useState(0)
  const [shortTermAmount, setShortTermAmount] = useState(0)
  const [longTermAmount, setLongTermAmount] = useState(0)

  const [shortTermDebt, setShortTermDebt] = useState(0)
  const [longTermDebt, setLongTermDebt] = useState(0)

  const [totalAmount, setTotalAmount] = useState(0)
  const [lastMonthTotalAmount, setLastMonthTotalAmount] = useState(0)
  const [monthlyChange, setMonthlyChange] = useState(0)
  const [monthlyChangePerc, setMonthlyChangePerc] = useState(0)

  const [loadData, setLoadData] = useState(false)

  const [allocation, setAllocation] = useState<
    { name: string; value: number; color: string }[]
  >([]);


  const liquidityBreakdown = {
    immediate: immediateAmount,
    shortTerm: shortTermAmount,
    longTerm: longTermAmount,
  };

  useEffect(() => {
    setTotalAmount(bankBalance + cash + investmentAmount + realEstateAmount + alternateAssets)
    setShortTermDebt(creditCardAmount + mortgageAmount + loanAmount)
    setLongTermDebt(fullMortgageAmount + fullLoanAmount)
  }, [cash, bankBalance, investmentAmount, realEstateAmount, alternateAssets, creditCardAmount, mortgageAmount, loanAmount])

  useEffect(() => {
    setAllocation([
      { name: "Bank Balance", value: Math.round((bankBalance / totalAmount) * 100), color: "bg-chart-1" },
      { name: "Private Investments", value: Math.round((investmentAmount / totalAmount) * 100), color: "bg-chart-2" },
      { name: "Real Estate", value: Math.round((realEstateAmount / totalAmount) * 100), color: "bg-chart-3" },
      { name: "Cash", value: Math.round((cash / totalAmount) * 100), color: "bg-chart-4" },
      { name: "Alternative Assets", value: Math.round((alternateAssets / totalAmount) * 100), color: "bg-chart-5" },
    ]);

    setImmediateAmount(cash + bankBalance)
    setShortTermAmount(investmentAmount)
    setLongTermAmount(realEstateAmount + alternateAssets)
    setShortTermDebt(creditCardAmount + mortgageAmount + loanAmount)
    setLongTermDebt(fullMortgageAmount + fullLoanAmount)
    setMonthlyChange(cash + bankBalance + investmentAmount + realEstateAmount + alternateAssets - lastMonthTotalAmount)
    setMonthlyChangePerc(Math.round(Math.abs(cash + bankBalance + investmentAmount + realEstateAmount + alternateAssets - lastMonthTotalAmount) * 100 / (lastMonthTotalAmount)))
  }, [totalAmount, shortTermDebt, longTermDebt])

  const { data: accessToken, isFetched } = useQuery(queryAccessToken())
  const { data: plaidData } = useQuery({ ...queryTransactions(accessToken), enabled: !!accessToken })
  const { data: pastData } = useQuery({ ...queryPastTransactions(accessToken), enabled: !!accessToken })

  const navigate = useNavigate()


  useEffect(() => {
    if (accessToken && plaidData && pastData) {
      let totalBankBalances = calculateBankBalancesFromRawData(plaidData[0])
      let totalInvestment = calculateInvestmentsFromRawData(plaidData[1])

      let totalCreditCard = calculateCreditCardFromRawData(plaidData[2])
      let totalMortgage = calculateMortgageFromRawData(plaidData[2])
      let totalLoan = calculateLoanFromRawData(plaidData[2])

      let fullMortgage = calculateDueMortgageFromRawData(plaidData[2])
      let fullLoan = calculateDueLoanFromRawData(plaidData[2])

      let cash = calculateCashFromRawData(plaidData[4])
      let realEstate = calculateRealEstateFromRawData(plaidData[4])
      let alternateAsset = calculateAlternateAssetFromRawData(plaidData[4])

      let lastMonthBalance = CalculateLastMonthTotalBalance(pastData)

      setBankBalance(totalBankBalances)
      setInvestmentAmount(totalInvestment)
      setCash(cash)
      setRealEstateAmount(realEstate)
      setAlternateAssets(alternateAsset)

      setCreditCardAmount(totalCreditCard)
      setMortgageAmount(totalMortgage)
      setLoanAmount(totalLoan)

      setFullMortgageAmount(fullMortgage)
      setFullLoanAmount(fullLoan)

      setLastMonthTotalAmount(lastMonthBalance)

      setLoadData(true)
    }
    else if (!accessToken && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [accessToken, plaidData, pastData]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 sm:text-base">
            Your wealth at a glance — clarity over complexity
          </p>
        </div>
        <Button variant="hero" size="lg" className="sm:size-lg whitespace-nowrap" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={null}
        onSuccess={() => { }}
      />

      {/* Net Worth Card - Hero */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total Net Worth
          </CardDescription>
          <div className="flex items-end gap-4 mt-2">
            <CardTitle className="text-4xl font-bold tracking-tight">
              {formatCurrency(totalAmount)}
            </CardTitle>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${monthlyChange > 0
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
                }`}
            >
              {monthlyChange > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {monthlyChange > 0 ? "+" : ""}
              {formatCurrency(monthlyChange)} ({monthlyChangePerc}%)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            30-day change • Last updated just now
          </p>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Asset Allocation */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-muted-foreground" />
                Asset Allocation
              </CardTitle>
              <CardDescription>How your wealth is distributed</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadData ?
              <div className="space-y-6">
                {allocation.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              : <div className="animate-pulse space-y-6">
                {allocation.map((item) => (
                  <div key={item.name} className="h-9 bg-muted rounded-lg">
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        {/* Liquidity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-muted-foreground" />
              Liquidity
            </CardTitle>
            <CardDescription>Access to your capital</CardDescription>
          </CardHeader>
          {loadData ? (
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs font-medium text-success uppercase tracking-wide">
                  Immediate (0-7 days)
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {formatCurrency(liquidityBreakdown.immediate)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs font-medium text-warning uppercase tracking-wide">
                  Short-term (7-90 days)
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {formatCurrency(liquidityBreakdown.shortTerm)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Long-term (90+ days)
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {formatCurrency(liquidityBreakdown.longTerm)}
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="animate-pulse space-y-4">
              <div className="h-[86px] rounded-lg bg-muted">
                <div></div>
              </div>
              <div className="h-[86px] rounded-lg bg-muted">
                <div></div>
              </div>
              <div className="h-[86px] rounded-lg bg-muted">
                <div></div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Short-term & Long-term Finances */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Short-term Finance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              Short-Term Finances
            </CardTitle>
            <CardDescription>Assets & liabilities due in the next 90 days</CardDescription>
          </CardHeader>
          {loadData ? (
            <CardContent className="space-y-4">
              {/* Assets */}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Assets</span>
                <span>{formatCurrency(immediateAmount + shortTermAmount)}</span>
              </div>
              {/* Liabilities */}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Liabilities</span>
                <span>{formatCurrency(shortTermDebt)}</span>
              </div>
              {/* Net Short-term */}
              <div className="flex justify-between font-semibold text-foreground border-t pt-2 mt-2">
                <span>Net Short-Term</span>
                <span>{formatCurrency(shortTermAmount - shortTermDebt)}</span>
              </div>
            </CardContent>
          ) : (
            <CardContent className="animate-pulse space-y-4">
              <div className="h-5 rounded-lg bg-muted"></div>
              <div className="h-5 rounded-lg bg-muted"></div>
              <div className="border-t"></div>
              <div className="h-6 !mt-2 rounded-lg bg-muted"></div>
            </CardContent>
          )}
        </Card>

        {/* Long-term Finance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              Long-Term Finances
            </CardTitle>
            <CardDescription>Assets & liabilities due in 90+ days</CardDescription>
          </CardHeader>
          {loadData ? (
            <CardContent className="space-y-4">
              {/* Assets */}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Assets</span>
                <span>{formatCurrency(longTermAmount)}</span>
              </div>
              {/* Liabilities */}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Liabilities</span>
                <span>{formatCurrency(longTermDebt)}</span>
              </div>
              {/* Net Long-term */}
              <div className="flex justify-between font-semibold text-foreground border-t pt-2 mt-2">
                <span>Net Long-Term</span>
                <span>{formatCurrency(longTermAmount - longTermDebt)}</span>
              </div>
            </CardContent>
          ) : (
            <CardContent className="animate-pulse space-y-4">
              <div className="h-5 rounded-lg bg-muted"></div>
              <div className="h-5 rounded-lg bg-muted"></div>
              <div className="border-t"></div>
              <div className="h-6 !mt-2 rounded-lg bg-muted"></div>
            </CardContent>
          )}
        </Card>
      </div>
    </div >
  );
}
