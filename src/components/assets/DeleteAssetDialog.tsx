import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { deleteAsset } from "@/lib/supabase/assets/assets";
import { useQuery } from "@tanstack/react-query";
import { queryUserId } from "@/queries/auth";

interface DeleteAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function DeleteAssetDialog({ open, onOpenChange, asset, onSuccess }: DeleteAssetDialogProps) {
  const [loading, setLoading] = useState(false);

  const { data: userId } = useQuery(queryUserId())

  const handleDelete = async () => {
    if (!asset) return;
    
    setLoading(true);
    try {
      await deleteAsset(userId, asset.name, asset.type, parseFloat(asset.value))
      toast.success("Asset deleted successfully");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Asset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{asset?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
