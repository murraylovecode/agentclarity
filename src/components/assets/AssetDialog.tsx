import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { addAsset } from "@/lib/supabase/assets/assets";
import { UserRoundIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryUserId } from "@/queries/auth";

type AssetType = Database["public"]["Enums"]["asset_type"];

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "real_estate", label: "Real Estate" },
  { value: "jewelry", label: "Jewelry" },
  { value: "vehicle", label: "Vehicle" },
  { value: "art_collectible", label: "Art & Collectibles" },
];

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: {
    userId: string;
    name: string;
    type: AssetType;
    current_value: number;
  } | null;
  onSuccess: () => void;
}

export function AssetDialog({ open, onOpenChange, asset, onSuccess }: AssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("cash");
  const [value, setValue] = useState("");

  const isEdit = !!asset;

  const { data: userId } = useQuery(queryUserId())

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setType(asset.type);
      setValue(asset.current_value.toString());
    } else {
      setName("");
      setType("cash");
      setValue("");
    }
  }, [asset, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const assetData = {
        name: name.trim(),
        type,
        current_value: parseFloat(value),
        user_id: userId,
      };

      if (isEdit && asset && userId) {
        await addAsset(userId, name, type, parseFloat(value))
        toast.success("Asset updated successfully");
      } else {
        await addAsset(userId, name, type, parseFloat(value))
        toast.success("Asset added successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your asset" : "Add a new asset to your portfolio"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apple Inc (AAPL)"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Asset Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Current Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Asset" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
