import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateBankBalancesFromRawData, calculateCreditCardFromRawData, calculateDueLoanFromRawData, calculateDueMortgageFromRawData, calculateInvestmentsFromRawData, calculateLoanFromRawData, calculateMortgageFromRawData } from "@/utils/transactionHelpers";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryAccessToken, queryUserId } from "@/queries/auth";
import { queryTransactions } from "@/queries/transactions";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface AnalysisResult {
  fitScore: number;
  diversificationImpact: "positive" | "neutral" | "negative";
  riskFlags: string[];
  suggestedSize: string;
  narrative: string;
}

export default function DealAnalyzer() {

  const [dealType, setDealType] = useState("");
  const [amount, setAmount] = useState("");
  const [horizon, setHorizon] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(false);

  const { data: accessToken, isFetched } = useQuery(queryAccessToken())
  const { data: plaidData } = useQuery({ ...queryTransactions(accessToken), enabled: !!accessToken })

  const navigate = useNavigate()

  const [allHistory, setAllHistory] = useState([])
  const [question, setQuestion] = useState("")

  const [context, setContext] = useState([])

  axios.defaults.baseURL = "http://localhost:3000";

  async function getResponse() {
    if (accessToken && plaidData && question != "") {
      let totalBankBalances = calculateBankBalancesFromRawData(plaidData[0])
      let totalInvestment = calculateInvestmentsFromRawData(plaidData[1])

      let totalCreditCard = calculateCreditCardFromRawData(plaidData[2])
      let totalMortgage = calculateMortgageFromRawData(plaidData[2])
      let totalLoan = calculateLoanFromRawData(plaidData[2])

      let fullMortgage = calculateDueMortgageFromRawData(plaidData[2])
      let fullLoan = calculateDueLoanFromRawData(plaidData[2])

      const userData = {
        "bank_balances": totalBankBalances,
        "investment": totalInvestment,
        "credit_card_due": totalCreditCard,
        "mortgage_payment_due_toay": totalMortgage,
        "student_loan_payment_due": totalLoan,
        "total_mortgage_due": fullMortgage,
        "total_student_loan_due": fullLoan
      }


      const investment = {
        "deal_type": dealType,
        "investment_amount": amount,
        "investment_duration": horizon
      }

      const aiAxios = axios.create({
        baseURL: "https://advaitchirmule2.pythonanywhere.com", withCredentials: true,
      });

      const response = await aiAxios.post("/chat", { user_data: userData, question: question, investment: investment, context: context });

      if (response.data.success) {
        setAllHistory([...allHistory, response.data.context.at(-1)])
        setContext(response.data.context.at(-1))
        setQuestion("")
      }
    }
    else if (!accessToken && isFetched) {
      navigate("/NotLoggedIn")
    }
    else {
      console.log(accessToken)
      console.log(plaidData)
      console.log(question)
      console.log("wait more")
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await getResponse()
    setAnalysis(true)
    setIsAnalyzing(false)
  };

  const handleInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      setIsAnalyzing(true)
      await getResponse()
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Deal Analyzer</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered analysis of new opportunities in the context of your existing portfolio
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch max-h-screen">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Opportunity</CardTitle>
            <CardDescription>Describe the investment you're evaluating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deal Type</label>
              <select
                className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm shadow-vig focus:outline-none focus:ring-2 focus:ring-ring"
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
              >
                <option value="">Select type...</option>
                <option value="private-equity">Private Equity</option>
                <option value="venture">Venture Capital</option>
                <option value="real-estate">Real Estate</option>
                <option value="public-equity">Public Equity</option>
                <option value="fund">Fund Investment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Investment Amount</label>
              <Input
                placeholder="$100,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Investment Horizon</label>
              <select
                className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm shadow-vig focus:outline-none focus:ring-2 focus:ring-ring"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
              >
                <option value="">Select horizon...</option>
                <option value="1-year">Less than 1 year</option>
                <option value="1-3-years">1-3 years</option>
                <option value="3-5-years">3-5 years</option>
                <option value="5-10-years">5-10 years</option>
                <option value="10-plus">10+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes & Context</label>
              <Textarea
                placeholder="Add any relevant details about the opportunity..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !dealType || !amount || !accessToken || !plaidData}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Analyze Deal
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-4">
          {analysis ? (
            <Card className="h-[80vh] flex flex-col">
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Ask follow-up questions about this deal
                </CardDescription>
              </CardHeader>

              {/* Chat messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {allHistory.map(([q, a], idx) => (
                  <div key={idx} className="space-y-2">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[75%] rounded-2xl bg-accent px-4 py-2 text-sm text-accent-foreground">
                        {q}
                      </div>
                    </div>

                    {/* AI message */}
                    <div className="flex justify-start">
                      <div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                        {a}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground animate-pulse">
                      ...
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Input */}
              <div className="border-t p-4">
                <Input
                  placeholder="Ask a follow-up question…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleInput}
                  disabled={isAnalyzing}
                />
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to analyze
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Enter the details of your opportunity and our AI will evaluate it against your
                  portfolio.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
