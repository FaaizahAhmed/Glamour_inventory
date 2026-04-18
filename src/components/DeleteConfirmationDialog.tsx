import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { InventoryItem } from "@/services/inventoryApi";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

function DeleteConfirmationDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "500px" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle style={{ width: "20px", height: "20px", color: "#dc2626" }} />
            <DialogTitle>Delete Product</DialogTitle>
          </div>
          <DialogDescription>
            Please review the product details below before confirming deletion. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "16px", paddingBottom: "16px" }}>
          <div style={{ borderRadius: "8px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", padding: "16px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "18px", marginBottom: "16px" }}>{item.name}</h3>
            
            <div style={{ display: "grid", gap: "12px" }}>
              {item.brand && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#4b5563" }}>Brand:</span>
                  <span style={{ fontWeight: "500" }}>{item.brand}</span>
                </div>
              )}
              
              {item.category && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#4b5563" }}>Category:</span>
                  <span style={{ fontWeight: "500" }}>
                    {typeof item.category === 'object' ? item.category.name : item.category}
                  </span>
                </div>
              )}

              {item.sku && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#4b5563" }}>SKU:</span>
                  <span style={{ fontWeight: "500", fontFamily: "monospace", fontSize: "12px" }}>{item.sku}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#4b5563" }}>Current Quantity:</span>
                <span style={{ fontWeight: "500" }}>{item.quantity} units</span>
              </div>

              {item.min_stock_level && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#4b5563" }}>Min Stock Level:</span>
                  <span style={{ fontWeight: "500" }}>{item.min_stock_level} units</span>
                </div>
              )}

              {item.unit_price && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#4b5563" }}>Unit Price:</span>
                  <span style={{ fontWeight: "500" }}>${item.unit_price.toFixed(2)}</span>
                </div>
              )}

              {item.total_value && (
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                  <span style={{ color: "#4b5563", fontWeight: "600" }}>Total Value:</span>
                  <span style={{ fontWeight: "700", fontSize: "18px", color: "#dc2626" }}>
                    ${item.total_value.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderRadius: "8px", border: "1px solid #fed7aa", backgroundColor: "#fffbeb", padding: "12px" }}>
            <p style={{ fontSize: "14px", color: "#854d0e" }}>
              ⚠️ This product will be permanently deleted from your inventory. Make sure this is what you want to do.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Trash2 style={{ width: "16px", height: "16px" }} />
            Delete Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
