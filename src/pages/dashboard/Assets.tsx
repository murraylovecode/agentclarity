import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Wallet,
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Coins,
  Home,
  Car,
  Gem,
  Banknote,
  Briefcase,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { AssetDialog } from "@/components/assets/AssetDialog";
import { DeleteAssetDialog } from "@/components/assets/DeleteAssetDialog";
import { useQuery } from "@tanstack/react-query";
import { queryUserId } from "@/queries/auth";
import { queryAssets } from "@/queries/assets";
import { useNavigate } from "react-router-dom";

type AssetType = Database["public"]["Enums"]["asset_type"];
type Asset = Database["public"]["Tables"]["assets"]["Row"];

const assetTypes = [
  { id: "all", label: "All Assets", icon: Wallet },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "real_estate", label: "Real Estate", icon: Home },
  { id: "jewelry", label: "Jewelry", icon: Coins },
  { id: "vehicle", label: "Vehicles", icon: Car },
  { id: "art_collectible", label: "Art", icon: Gem },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTypeIcon(type: AssetType) {
  const iconMap: Record<AssetType, React.ReactNode> = {
    cash: <Banknote className="w-4 h-4" />,
    real_estate: <Home className="w-4 h-4" />,
    jewelry: <Coins className="w-4 h-4" />,
    vehicle: <Car className="w-4 h-4" />,
    art_collectible: <Gem className="w-4 h-4" />,
  };
  return iconMap[type] || <Wallet className="w-4 h-4" />;
}

function getTypeLabel(type: AssetType) {
  const labels: Record<AssetType, string> = {
    cash: "Cash",
    real_estate: "Real Estate",
    art_collectible: "Art Collectible",
    vehicle: "Vehicle",
    jewelry: "Jewelry"
  };
  return labels[type] || type;
}

export default function Assets() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: userId, isFetched } = useQuery(queryUserId())
  const assetsQuery = useQuery({ ...queryAssets(userId), enabled: !!userId })

  const navigate = useNavigate()

  useEffect(() => {
    if (userId && assetsQuery.data) {
      console.log(assetsQuery.data.data.data)
      setAssets(assetsQuery.data.data.data)
      setLoading(false)
    }
    else if (!userId && isFetched) {
      navigate("/NotLoggedIn")
    }
  }, [userId, assetsQuery]);

  async function fetchAssets() {
    assetsQuery.refetch()
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesType = activeFilter === "all" || asset.type === activeFilter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.value, 0);

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleDeleteAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track everything you own
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={handleAddAsset}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {activeFilter === "all" ? "Total Assets" : assetTypes.find(t => t.id === activeFilter)?.label}
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Asset Count</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {filteredAssets.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {assetTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant={activeFilter === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(type.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        <div className="relative flex-1 max-w-md lg:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No assets yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Add your first asset to start tracking your wealth
              </p>
              <Button onClick={handleAddAsset}>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asset</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                            {getTypeIcon(asset.type)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{asset.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {getTypeLabel(asset.type)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">
                        {formatCurrency(asset.value)}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteAsset(asset)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={selectedAsset}
        onSuccess={fetchAssets}
      />
      <DeleteAssetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        asset={selectedAsset}
        onSuccess={fetchAssets}
      />
    </div>
  );
}
