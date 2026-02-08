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
import { calculateAlternateAssetFromRawData, calculateBankBalancesFromRawData, calculateCashFromRawData, calculateInvestmentsFromRawData, calculateRealEstateFromRawData } from "@/utils/transactionHelpers";
import { useNavigate } from "react-router-dom";


function formatCurrency(value: number) {
  const prefix = value >= 0 ? "" : "-";
  return prefix + new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
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

  const { data: userId, isFetched } = useQuery(queryUserId())
  const { data: plaidData } = useQuery({ ...queryTransactions(userId), enabled: !!userId })
  const { data: pastData } = useQuery({ ...queryPastTransactions(userId), enabled: !!userId });

  const navigate = useNavigate()

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

      setLoadData(true);
    }
    else if (!userId && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [userId, plaidData, pastData]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field, index) => (
            <Card key={index} className="p-4 flex flex-col items-center justify-center">
              {renderChart(field.past, field.current)}
              <p className="text-sm text-center mt-4">{generateAnalysis(field.current, field.past, field.label)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
