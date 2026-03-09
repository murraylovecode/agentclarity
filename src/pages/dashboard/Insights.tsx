import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Building2,
  Banknote,
  LineChart as LineChartIcon
} from "lucide-react";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryAccessToken, queryUserId } from "@/queries/auth";
import { queryPastTransactions, queryTransactions } from "@/queries/transactions";
import { 
  calculateAlternateAssetFromRawData, 
  calculateBankBalancesFromRawData, 
  calculateCashFromRawData, 
  calculateDebtCreditCardFromRawData, 
  calculateDebtLoanFromRawData, 
  calculateDebtMortgageFromRawData, 
  calculateInvestmentsFromRawData, 
  calculateRealEstateFromRawData 
} from "@/utils/transactionHelpers";
import { useNavigate } from "react-router-dom";
import { LineChart, Legend, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

// --- Helpers ---

function formatCurrency(value: number) {
  const prefix = value >= 0 ? "" : "-";
  return prefix + new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function calculateAvalanche(debts: any[], monthlyBudget: number) {
  const results = [];
  let month = 0;
  const activeDebts = debts.map(d => ({ ...d }));

  while (activeDebts.some(d => d[0] > 0) && month < 60) { // Capped at 5 years for chart safety
    month++;
    activeDebts.sort((a, b) => b[2] - a[2]);
    let remaining = monthlyBudget;

    activeDebts.forEach(debt => {
      if (debt[0] > 0) {
        const monthlyInterest = debt[0] * (debt[2] / 100 / 12);
        debt[0] += monthlyInterest;
      }
    });

    activeDebts.forEach(debt => {
      if (debt[0] > 0) {
        const payment = Math.min(debt[1], debt[0]);
        debt[0] -= payment;
        remaining -= payment;
      }
    });

    for (let debt of activeDebts) {
      if (remaining <= 0) break;
      if (debt[0] > 0) {
        const payment = Math.min(remaining, debt[0]);
        debt[0] -= payment;
        remaining -= payment;
      }
    }

    results.push({
      month,
      balances: activeDebts.map(d => ({
        name: d[3],
        balance: Math.max(d[0], 0)
      }))
    });
  }
  return results;
}

const ASSET_COLORS: Record<string, string> = {
  Cash: "#22c55e",
  "Bank Balance": "#3b82f6",
  Investments: "#8b5cf6",
  "Real Estate": "#f59e0b",
  "Alternate Assets": "#64748b",
  Total: "#0f172a",
};

// --- Main Component ---

export default function Insights() {
  axios.defaults.baseURL = "http://localhost:3000";
  const navigate = useNavigate();

  // Current State
  const [bankBalance, setBankBalance] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [cash, setCash] = useState(0);
  const [realEstateAmount, setRealEstateAmount] = useState(0);
  const [alternateAssets, setAlternateAssets] = useState(0);

  // Past State
  const [bankBalancePast, setBankBalancePast] = useState(0);
  const [investmentAmountPast, setInvestmentAmountPast] = useState(0);
  const [cashPast, setCashPast] = useState(0);
  const [realEstateAmountPast, setRealEstateAmountPast] = useState(0);
  const [alternateAssetsPast, setAlternateAssetsPast] = useState(0);

  // Logic States
  const [loadData, setLoadData] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [formattedDebtData, setFormattedDebtData] = useState<any[]>([]);
  
  // Visibility Toggles for Interactive Chart
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    Cash: true,
    "Bank Balance": true,
    Investments: true,
    "Real Estate": true,
    "Alternate Assets": true,
  });

  const { data: accessToken, isFetched } = useQuery(queryAccessToken());
  const { data: plaidData } = useQuery({ ...queryTransactions(accessToken), enabled: !!accessToken });
  const { data: pastData } = useQuery({ ...queryPastTransactions(accessToken), enabled: !!accessToken });

  useEffect(() => {
    if (accessToken && plaidData && pastData) {
      // Set Past Data
      const past = pastData[0]["data"]["data"][0];
      setCashPast(past.cash || 0);
      setInvestmentAmountPast(past.investment || 0);
      setBankBalancePast(past.bank_balance || 0);
      setRealEstateAmountPast(past.real_estate || 0);
      setAlternateAssetsPast(past.alternate_asset || 0);

      // Set Current Data
      setBankBalance(calculateBankBalancesFromRawData(plaidData[0]));
      setInvestmentAmount(calculateInvestmentsFromRawData(plaidData[1]));
      setCash(calculateCashFromRawData(plaidData[4]));
      setRealEstateAmount(calculateRealEstateFromRawData(plaidData[4]));
      setAlternateAssets(calculateAlternateAssetFromRawData(plaidData[4]));

      // Debt Avalanche Logic
      const debts = [
        ...calculateDebtCreditCardFromRawData(plaidData[2]),
        ...calculateDebtMortgageFromRawData(plaidData[2]),
        ...calculateDebtLoanFromRawData(plaidData[2])
      ];
      const paymentData = calculateAvalanche(debts, monthlyBudget);
      
      const formatted = paymentData.map(month => {
        const row: Record<string, any> = { month: month.month };
        month.balances.forEach(d => { row[d.name] = d.balance; });
        return row;
      });

      setFormattedDebtData(formatted);
      setLoadData(true);
    } else if (!accessToken && isFetched) {
      navigate("/NotLoggedIn");
    }
  }, [accessToken, plaidData, pastData, monthlyBudget, navigate]);

  // Transform Data for the Main Asset Comparison Chart
  const assetComparisonData = useMemo(() => {
    const dataPoints = [
      {
        name: "Past Month",
        Cash: cashPast,
        "Bank Balance": bankBalancePast,
        Investments: investmentAmountPast,
        "Real Estate": realEstateAmountPast,
        "Alternate Assets": alternateAssetsPast,
      },
      {
        name: "Current",
        Cash: cash,
        "Bank Balance": bankBalance,
        Investments: investmentAmount,
        "Real Estate": realEstateAmount,
        "Alternate Assets": alternateAssets,
      }
    ];

    return dataPoints.map(point => {
      const total = Object.entries(visibleCategories)
        .filter(([_, isVisible]) => isVisible)
        .reduce((sum, [key, _]) => sum + ((point as any)[key] || 0), 0);
      return { ...point, Total: total };
    });
  }, [cash, cashPast, bankBalance, bankBalancePast, investmentAmount, investmentAmountPast, realEstateAmount, realEstateAmountPast, alternateAssets, alternateAssetsPast, visibleCategories]);

  const toggleCategory = (key: string) => {
    setVisibleCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const debtKeys = formattedDebtData.length > 0 
    ? Object.keys(formattedDebtData[0]).filter(k => k !== "month") 
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">Detailed analysis of your net worth and debt trajectory</p>
        </div>
      </div>

      {loadData && (
        <>
          {/* Main Asset Interactive Chart */}
          <Card className="p-6 overflow-hidden">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Net Worth Composition</CardTitle>
                <CardDescription>Compare asset growth and total impact</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Current Filtered Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(assetComparisonData[1].Total)}
                </p>
              </div>
            </CardHeader>

            {/* Interactive Toggles */}
            <div className="flex flex-wrap gap-2 mb-8 mt-4">
              {Object.keys(visibleCategories).map((cat) => (
                <Button
                  key={cat}
                  variant={visibleCategories[cat] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(cat)}
                  className="rounded-full transition-all"
                >
                  <span 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: visibleCategories[cat] ? 'white' : ASSET_COLORS[cat] }} 
                  />
                  {cat}
                </Button>
              ))}
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assetComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    padding={{ left: 40, right: 40 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => `$${v / 1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(v) => formatCurrency(Number(v))} 
                  />
                  
                  {/* Total Line - The prominent one */}
                  <Line 
                    type="monotone" 
                    dataKey="Total" 
                    stroke={ASSET_COLORS.Total} 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: ASSET_COLORS.Total }}
                    animationDuration={1000}
                  />

                  {/* Individual Categories */}
                  {Object.entries(visibleCategories).map(([key, isVisible]) => (
                    isVisible && (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={ASSET_COLORS[key]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        animationDuration={500}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Debt Avalanche Chart */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Debt Payoff Forecast</CardTitle>
              <CardDescription>
                On a budget of <span className="font-bold text-foreground">{formatCurrency(monthlyBudget)}</span>, here is your path to $0 debt.
              </CardDescription>
            </CardHeader>

            <div className="flex items-center gap-4 my-6 bg-slate-50 p-4 rounded-lg w-fit">
              <label className="text-sm font-medium text-slate-600">Adjust Monthly Budget:</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setMonthlyBudget(prev => Math.max(prev - 500, 0))}
                >-</Button>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-24 text-center bg-transparent border-none font-bold focus:ring-0"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setMonthlyBudget(prev => prev + 500)}
                >+</Button>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedDebtData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" label={{ value: 'Months from now', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  {debtKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={`hsl(${index * 45}, 70%, 50%)`}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}