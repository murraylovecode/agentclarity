import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calculateSecuritiesByType, listInvestmentsFromRawData } from "@/utils/transactionHelpers";
import { queryTransactions } from "@/queries/transactions";
import { queryAccessToken } from "@/queries/auth";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const INVESTMENT_TYPES = ["derivative", "etf", "mutual fund", "cryptocurrency", "equity", "fixed income", "cash"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function getChangeColor(change: number) {
  if (change > 2) return "bg-success/80";
  if (change > 0) return "bg-success/50";
  if (change < -2) return "bg-destructive/80";
  if (change < 0) return "bg-destructive/50";
  return "bg-muted";
}

function getTextColor(change: number) {
  if (change > 0) return "text-success";
  if (change < 0) return "text-destructive";
  return "text-muted-foreground";
}

export default function Markets() {
  const [investmentList, setInvestmentList] = useState<any[]>([]);
  const [investmentByType, setInvestmentByType] = useState<Record<string, number>>({});
  const [loadData, setLoadData] = useState(false);

  axios.defaults.baseURL = "http://localhost:3000";

  const { data: accessToken, isFetched } = useQuery(queryAccessToken())
  const { data: plaidData } = useQuery({ ...queryTransactions(accessToken), enabled: !!accessToken })

  const navigate = useNavigate()

  const [sortConfig, setSortConfig] = useState<{ key: number; direction: "asc" | "desc" } | null>(null);

  // Memoize sorted list
  const sortedInvestmentList = useMemo(() => {
    console.log("hi2")
    if (!sortConfig) return investmentList;

    const sorted = [...investmentList].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      // Handle numbers vs strings
      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      }

      // String comparison
      return sortConfig.direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return sorted;
  }, [investmentList, sortConfig]);

  // Click handler for headers
  const handleSort = (key: number) => {
    if (sortConfig?.key === key) {
      // Toggle direction
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // New column, default ascending
      setSortConfig({ key, direction: "asc" });
    }
  };


  useEffect(() => {
    if (accessToken && plaidData) {
      const list = listInvestmentsFromRawData(plaidData[1]);
      const byType = calculateSecuritiesByType(plaidData[1]);
      setInvestmentList(list);
      setInvestmentByType(byType);
      setLoadData(true);
    }
    else if (!accessToken && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [accessToken, plaidData]);

  // Sort investment types by value descending
  const sortedTypes = INVESTMENT_TYPES
    .map(type => ({ type, value: investmentByType[type] || 0 }))
    .sort((a, b) => b.value - a.value);

  const totalValue = Object.values(investmentByType).reduce((sum, val) => sum + val, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Public Markets</h1>
          <p className="text-muted-foreground mt-1">Understand your exposure across investment types</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Size = allocation • Color = risk</span>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investments Value</p>
              <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Investment Type Allocation */}
      <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>Allocation by Type</CardTitle>
          <CardDescription>Your investments by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] md:h-[400px]">
            {sortedTypes.map((t, idx) => {
              const weight = totalValue ? ((t.value / totalValue) * 100).toFixed(1) : 0;

              // Map type to red/green shades based on risk/volatility
              const typeColors: Record<string, string> = {
                cryptocurrency: "bg-destructive/50", // most volatile
                derivative: "bg-destructive/50",
                equity: "bg-destructive/30",
                etf: "bg-destructive/30",
                "mutual fund": "bg-success/30",
                "fixed income": "bg-success/50",
                cash: "bg-success/50",
              };

              const colorClass = typeColors[t.type] || "bg-muted text-gray-900";

              return (
                <div
                  key={t.type}
                  className={`rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all transform hover:scale-[1.03] cursor-pointer ${colorClass} col-span-${idx === 0 ? 2 : 1} row-span-${idx === 0 ? 2 : 1}`}
                >
                  <div>
                    <p className="text-sm md:text-lg font-semibold">{t.type}</p>
                    <p className="text-xs md:text-sm opacity-80">{weight}% of portfolio</p>
                    <p className="text-xs md:text-sm font-mono">{formatCurrency(t.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full md:table-auto border-collapse md:border-separate">
            {/* Table Head (desktop only) */}
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-border">
                {["Name", "Institution", "Type", "Quantity", "Price", "Value"].map((col, idx) => (
                  <th
                    key={idx}
                    className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort(idx)}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {/* Show arrow */}
                      {sortConfig?.key === idx && (
                        <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>


            {/* Table Body */}
            <tbody className="block md:table-row-group">
              {sortedInvestmentList.map((inv, idx) => (
                <tr
                  key={idx}
                  className="block md:table-row border-b border-border last:border-0 mb-4 md:mb-0 rounded-lg md:rounded-none bg-muted/10 md:bg-transparent p-4 md:p-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Map each cell */}
                  {inv.map((val, i) => (
                    <td
                      key={i}
                      className="block md:table-cell p-2 md:p-4 text-left md:text-left font-medium text-foreground"
                    >
                      {/* Show label on mobile */}
                      <span className="font-semibold md:hidden text-sm text-muted-foreground">
                        {["Name", "Institution", "Type", "Quantity", "Price", "Value"][i]}:{" "}
                      </span>
                      {i === 4 || i === 5 ? formatCurrency(val) : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>


    </div>
  );
}
