import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Users,
  Link2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { checkRandomId, generateReport } from "@/lib/supabase/anonymized/shareableReports";
import { useQuery } from "@tanstack/react-query";
import { calculateAlternateAssetFromRawData, calculateBankBalancesFromRawData, calculateCashFromRawData, calculateInvestmentsFromRawData, calculateRealEstateFromRawData } from "@/utils/transactionHelpers";
import { queryTransactions } from "@/queries/transactions";
import { queryAccessToken, queryUserId } from "@/queries/auth";
import { useNavigate } from "react-router-dom";

export default function Compare() {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  const [bankBalance, setBankBalance] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [cash, setCash] = useState(0)
  const [realEstateAmount, setRealEstateAmount] = useState(0)
  const [alternateAssets, setAlternateAssets] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    setTotalAmount(bankBalance + cash + investmentAmount + realEstateAmount + alternateAssets)
  }, [cash, bankBalance, investmentAmount, realEstateAmount, alternateAssets, totalAmount])

  useEffect(() => {

    setBankBalance(Math.round((bankBalance / totalAmount) * 100)),
    setInvestmentAmount(Math.round((investmentAmount / totalAmount) * 100)),
    setRealEstateAmount(Math.round((realEstateAmount / totalAmount) * 100)),
    setCash(Math.round((cash / totalAmount) * 100)),
    setAlternateAssets(Math.round((alternateAssets / totalAmount) * 100))

  }, [totalAmount])

  const [loadData, setLoadData] = useState(false)

  axios.defaults.baseURL = "http://localhost:3000";

  const { data: accessToken, isFetched } = useQuery(queryAccessToken())
  const { data: userId } = useQuery(queryUserId())
  const { data: plaidData } = useQuery({ ...queryTransactions(accessToken), enabled: !!accessToken })

  const navigate = useNavigate()


  useEffect(() => {
    if (accessToken && plaidData) {
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

      setLoadData(true)
    }
    else if (!accessToken && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [accessToken, plaidData]);

  const generateShareLink = async () => {
    let randomLink = Math.random().toString(36).substring(7)

    while (await checkRandomId(randomLink)) {
      console.log(randomLink)
      randomLink = Math.random().toString(36).substring(7)
    }

    const success = await generateReport(randomLink, userId, cash, bankBalance, investmentAmount, realEstateAmount, alternateAssets)
    if (success) {
      const link = `http://localhost:8080/share/${randomLink}`;
      setShareLink(link);
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Compare</h1>
        </div>
        <p className="text-muted-foreground">
          Share anonymized portfolio insights with trusted friends for perspective
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Your privacy is protected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Shared profiles only show allocation ranges and percentages — never exact values,
              asset names, or personal information. You control what's visible and can revoke
              access at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* Share Your Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Share Your Profile
            </CardTitle>
            <CardDescription>
              Generate an anonymized view of your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {showProfile ? (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Profile Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {showProfile ? "Your profile is shareable" : "Profile sharing is disabled"}
                  </p>
                </div>
              </div>
              <Button
                variant={showProfile ? "default" : "outline"}
                size="sm"
                onClick={() => setShowProfile(!showProfile)}
              >
                {showProfile ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {showProfile && (
              <>
                {!shareLink ? (
                  <Button variant="hero" className="w-full" onClick={generateShareLink} disabled={!loadData}>
                    Generate Share Link
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={shareLink} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={copyLink}>
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this link with people you trust. They'll see an anonymized view of
                      your allocation.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
