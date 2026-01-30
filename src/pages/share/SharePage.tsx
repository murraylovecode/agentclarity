import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Shield, PieChart } from "lucide-react";
import { getReportById } from "@/lib/supabase/anonymized/shareableReports";

type SharedReport = {
  id: string;
  share_code: string;
  is_active: boolean;
  cash_percentage: number;
  bank_balance_percentage: number;
  investment_percentage: number;
  real_estate_percentage: number;
  alternate_asset_percentage: number;
};

const allocationConfig = [
  { key: "investment_percentage", label: "Investments" },
  { key: "cash_percentage", label: "Cash" },
  { key: "bank_balance_percentage", label: "Bank Balance" },
  { key: "real_estate_percentage", label: "Real Estate" },
  { key: "alternate_asset_percentage", label: "Alternate Assets" },
] as const;

function SharePage() {
  const { shareId } = useParams();
  const [data, setData] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await getReportById(`${shareId}`);
        if (res) {
          setData(res[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [shareId]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-muted-foreground">
        Loading anonymized report…
      </div>
    );
  }

  console.log(data)
  console.log(data.is_active)

  if (!data || !data.is_active) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            This shared report is invalid or has expired.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Anonymized Report
          </h1>
        </div>
        <p className="text-muted-foreground">
          A privacy-preserving snapshot of portfolio allocation
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Privacy protected</p>
            <p className="text-sm text-muted-foreground mt-1">
              This report contains allocation percentages only. No personal
              information, asset names, or exact values are shared.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>
            Asset distribution by percentage
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {allocationConfig.map(({ key, label }) => {
              const value = data[key];

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {label}
                    </span>
                    <span className="text-accent font-medium">
                      {value}%
                    </span>
                  </div>

                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
            Shared via secure link • Code:{" "}
            <span className="font-mono">{data.share_code}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SharePage;
