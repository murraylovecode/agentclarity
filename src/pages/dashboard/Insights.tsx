import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  PieChart,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryUserId } from "@/queries/auth";
import { queryPastTransactions, queryTransactions } from "@/queries/transactions";
import { calculateAlternateAssetFromRawData, calculateBankBalancesFromRawData, calculateCashFromRawData, calculateDebtCreditCardFromRawData, calculateDebtLoanFromRawData, calculateDebtMortgageFromRawData, calculateInvestmentsFromRawData, calculateRealEstateFromRawData } from "@/utils/transactionHelpers";
import { useNavigate } from "react-router-dom";
import { LineChart, Legend, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";


function formatCurrency(value: number) {
  const prefix = value >= 0 ? "" : "-";
  return prefix + new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function calculateAvalanche(debts, monthlyBudget) {
  const results = []
  let month = 0

  const activeDebts = debts.map(d => ({ ...d }))

  while (activeDebts.some(d => d[0] > 0) && month < 6000) {
    month++

    // Sort by highest interest first
    activeDebts.sort((a, b) => b[2] - a[2])

    let remaining = monthlyBudget

    // Add interest
    activeDebts.forEach(debt => {
      if (debt[0] > 0) {
        const monthlyInterest = debt[0] * (debt[2] / 100 / 12)
        debt[0] += monthlyInterest
      }
    })

    // Pay minimums
    activeDebts.forEach(debt => {
      if (debt[0] > 0) {
        const payment = Math.min(debt[1], debt[0])
        debt[0] -= payment
        remaining -= payment
      }
    })

    // Avalanche extra payment
    for (let debt of activeDebts) {
      if (remaining <= 0) break
      if (debt[0] > 0) {
        const payment = Math.min(remaining, debt[0])
        debt[0] -= payment
        remaining -= payment
      }
    }

    // Save snapshot
    results.push({
      month,
      balances: activeDebts.map(d => ({
        name: d[3],
        balance: Math.max(d[0], 0)
      }))
    })
  }


  return results
}


export default function Insights() {
  axios.defaults.baseURL = "https://agentclarity.onrender.com";

  const [bankBalance, setBankBalance] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [cash, setCash] = useState(0);
  const [realEstateAmount, setRealEstateAmount] = useState(0);
  const [alternateAssets, setAlternateAssets] = useState(0);

  const [bankBalancePast, setBankBalancePast] = useState(0);
  const [investmentAmountPast, setInvestmentAmountPast] = useState(0);
  const [cashPast, setCashPast] = useState(0);
  const [realEstateAmountPast, setRealEstateAmountPast] = useState(0);
  const [alternateAssetsPast, setAlternateAssetsPast] = useState(0);

  const [loadData, setLoadData] = useState(false);

  const [monthlyBudget, setMonthlyBudget] = useState(12000)

  const { data: userId, isFetched } = useQuery(queryUserId())
  const { data: plaidData } = useQuery({ ...queryTransactions(userId), enabled: !!userId })
  const { data: pastData } = useQuery({ ...queryPastTransactions(userId), enabled: !!userId });

  const navigate = useNavigate()

  const [formattedData, setFormattedData] = useState<any[]>([])

  useEffect(() => {
    if (userId && plaidData && pastData) {

      setCashPast(pastData[0][0].cash);
      setInvestmentAmountPast(pastData[0][0].investment);
      setBankBalancePast(pastData[0][0].bank_balance);
      setRealEstateAmountPast(pastData[0][0].real_estate);
      setAlternateAssetsPast(pastData[0][0].alternate_asset);

      let totalBankBalances = calculateBankBalancesFromRawData(plaidData[0])
      let totalInvestment = calculateInvestmentsFromRawData(plaidData[1])
      let totalCash = calculateCashFromRawData(plaidData[4])
      let totalRealEstate = calculateRealEstateFromRawData(plaidData[4])
      let totalAlternateAsset = calculateAlternateAssetFromRawData(plaidData[4])

      setBankBalance(totalBankBalances)
      setInvestmentAmount(totalInvestment)
      setCash(totalCash)
      setRealEstateAmount(totalRealEstate)
      setAlternateAssets(totalAlternateAsset)

      const paymentData = calculateAvalanche([...calculateDebtCreditCardFromRawData(plaidData[2]), ...calculateDebtMortgageFromRawData(plaidData[2]), ...calculateDebtLoanFromRawData(plaidData[2])], monthlyBudget)

      console.log(paymentData)
      const formatted = []

      paymentData.forEach((month) => {
        const row: Record<string, number> = { month: month.month }

        month.balances.forEach((d) => {
          row[d.name] = d.balance
        })

        formatted.push(row)
      })

      setFormattedData(formatted)

      setLoadData(true);
    }
    else if (!userId && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [userId, plaidData, pastData, monthlyBudget]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);

  const generateAnalysis = (current: number, past: number, label: string) => {
    if (current > past) return `Your ${label} increased. Consider investing the extra funds.`;
    if (current < past) return `Your ${label} decreased. Review or buy opportunities in dips.`;
    return `Your ${label} remains stable. Keep monitoring for changes.`;
  };

  // Render a larger chart with X and Y axis labels only
  const renderChart = (past: number, current: number) => {
    const values = [past, current];
    const min = Math.min(...values) * 0.9;
    const max = Math.max(...values) * 1.1;

    const width = 300;
    const height = 180;
    const padding = 40;

    const scaleX = (i: number) => padding + (i * (width - padding * 2)) / (values.length - 1);
    const scaleY = (v: number) => height - padding - ((v - min) / (max - min)) * (height - padding * 2);

    const points = values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

    return (
      <svg width={width} height={height}>
        {/* Y Axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#888" strokeWidth={2} />
        <text x={padding - 10} y={padding - 10} fontSize="12" fill="#555" textAnchor="middle">
          Amount ($)
        </text>

        {/* X Axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#888" strokeWidth={2} />
        <text x={width - padding} y={height - padding + 20} fontSize="12" fill="#555" textAnchor="end">
          Time
        </text>

        {/* Line */}
        <polyline
          fill="none"
          stroke={current >= past ? "#16a34a" : "#dc2626"}
          strokeWidth={3}
          points={points}
        />

        {/* Points */}
        {values.map((v, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(v)}
            r={5}
            fill={current >= past ? "#16a34a" : "#dc2626"}
          />
        ))}

        {/* Trend Arrow */}
        {current >= past ? (
          <text x={width - padding} y={scaleY(current) - 10} fontSize="16" fill="#16a34a" fontWeight="bold">
            ↑
          </text>
        ) : (
          <text x={width - padding} y={scaleY(current) - 10} fontSize="16" fill="#dc2626" fontWeight="bold">
            ↓
          </text>
        )}
      </svg>
    );
  };

  const fields = [
    { current: cash, past: cashPast, label: "Cash" },
    { current: bankBalance, past: bankBalancePast, label: "Bank Balance" },
    { current: investmentAmount, past: investmentAmountPast, label: "Investments" },
    { current: realEstateAmount, past: realEstateAmountPast, label: "Real Estate" },
    { current: alternateAssets, past: alternateAssetsPast, label: "Alternate Assets" },
  ];

  const debtKeys =
    formattedData.length > 0
      ? Object.keys(formattedData[0]).filter((key) => key !== "month")
      : []

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
      </div>
      <p className="text-muted-foreground mb-6">Visual comparison of current vs past financials</p>

      {loadData && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field, index) => (
              <Card key={index} className="p-4 flex flex-col items-center justify-center">
                {renderChart(field.past, field.current)}
                <p className="text-sm text-center mt-4">{generateAnalysis(field.current, field.past, field.label)}</p>
              </Card>
            ))}
            <Card className="p-4 m-5 w-100 sm:col-span-2 lg:col-span-3">
              <div className="mt-4">
                <div className="mb-5">On a budget of {formatCurrency(monthlyBudget)}, this is how you your debts would look like over months:</div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjust Monthly Budget:
                </label>
                <div className="flex items-center gap-2 mb-5">
                  {/* Decrease button */}
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setMonthlyBudget((prev) => Math.max(prev - 100, 0))}
                  >
                    -
                  </button>

                  {/* Number input */}
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-24 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                  />

                  {/* Increase button */}
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setMonthlyBudget((prev) => prev + 100)}
                  >
                    +
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={formattedData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {debtKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      dot={true}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

        </div>

      )}
    </div>
  );
}
