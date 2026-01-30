'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaidLink } from "react-plaid-link";
import axios from "axios";
import { getUserId } from "@/lib/supabase/login/getUserDetails.client";
import { listBankBalancesFromRawData, listInvestmentsFromRawData } from "@/utils/transactionHelpers";
import { useQuery } from "@tanstack/react-query";
import { queryTransactions } from "@/queries/transactions";
import { queryUserId } from "@/queries/auth";

export default function PlaidDashboard() {
  const [linkToken, setLinkToken] = useState("");

  const [bankNames, setBankNames] = useState<string[]>([]);
  const [investmentNames, setInvestmentNames] = useState<string[]>([]);

  axios.defaults.baseURL = "https://agentclarity.onrender.com";

  useEffect(() => {
    const fetchLinkToken = async () => {
      const response = await axios.post("/create_link_token");
      setLinkToken(response.data.link_token);
    };
    fetchLinkToken();
  }, []);

  const { data: userId } = useQuery(queryUserId())
  const { data: plaidData, refetch } = useQuery({ ...queryTransactions(userId), enabled: !!userId })

  useEffect(() => {
    if (userId && plaidData) {
      let listBankBalances = listBankBalancesFromRawData(plaidData[0])
      let listInvestments = listInvestmentsFromRawData(plaidData[1])

      setBankNames(listBankBalances);
      setInvestmentNames(listInvestments);
    }
  }, [userId, plaidData]);

  function refreshData() {
    refetch()
  }

  const { open } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      if (!userId) return console.error("User not ready yet");

      await axios.post("/exchange_public_token", {
        public_token,
        user_id: userId,
        institution_id: metadata.institution.institution_id,
      });

      console.log("Linked account metadata:", metadata);

      // Fetch updated data after linking
      await refreshData();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bank & Investment Dashboard</h1>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => open()} disabled={!linkToken}>
          Link Another Bank Account
        </Button>

        <Button variant="outline" onClick={refreshData}>
          Refresh Data
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Accounts */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-4 py-3 border-b bg-muted/50 rounded-t-xl">
            <h2 className="font-semibold text-lg">Linked Accounts</h2>
          </div>

          <div className="p-4">
            {bankNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bank accounts linked
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {bankNames.map((name, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 font-medium">
                        {name[0]}
                      </td>
                      <td className="py-2 italic text-muted-foreground">
                        {name[1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Investments */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-4 py-3 border-b bg-muted/50 rounded-t-xl">
            <h2 className="font-semibold text-lg">Linked Investments</h2>
          </div>

          <div className="p-4">
            {investmentNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No investments linked
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2">Investment</th>
                    <th className="pb-2">Institution</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentNames.map((name, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 font-medium">
                        {name[0]}
                      </td>
                      <td className="py-2 italic text-muted-foreground">
                        {name[1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );

}
