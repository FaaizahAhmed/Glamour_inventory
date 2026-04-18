import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInventoryItem, updateInventoryItem, InventoryItem } from "@/services/inventoryApi";
import { fetchCategories } from "@/services/categoryApi";
import { fetchSuppliers } from "@/services/supplierApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem;
}

interface ItemFormData {
  name: string;
  brand?: string;
  category: string;
  supplier?: string;
  sku?: string;
  quantity: number | string;
  min_stock_level?: number | string;
  unit_price: number | string;
}

function InventoryDialog({ open, onOpenChange, item }: InventoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>();

  // Fetch categories and suppliers for dropdowns
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: fetchSuppliers });

  // Set form values when item changes (edit mode)
  useEffect(() => {
    if (item) {
      const categoryId = typeof item.category === 'object' ? item.category._id : item.category;
      const supplierId = item.supplier
        ? typeof item.supplier === 'object' ? item.supplier._id : item.supplier
        : '';
      reset({ ...item, category: categoryId, supplier: supplierId });
    } else {
      reset({
        name: "", brand: "", category: "", supplier: "",
        sku: "", quantity: 0, min_stock_level: 10, unit_price: 0,
      });
    }
  }, [item, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const processedData = {
        ...data,
        quantity: parseInt(String(data.quantity)),
        min_stock_level: parseInt(String(data.min_stock_level ?? 10)),
        unit_price: parseFloat(String(data.unit_price)),
        supplier: data.supplier || null,
      };
      if (item) {
        return updateInventoryItem(item._id!, processedData);
      } else {
        return createInventoryItem(processedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      reset({});
      toast({
        title: item ? "Item updated" : "Item added",
        description: `The item has been ${item ? "updated" : "added"} successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save item.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ItemFormData) => mutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "500px", padding: "32px" }}>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the item details below." : "Enter the details for the new inventory item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", padding: "0 32px", margin: "0 -32px", gap: "20px", maxHeight: "65vh", overflowY: "auto" }}>

          {/* Product Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g., Ruby Red Lipstick"
            />
            {errors.name && <p style={{ fontSize: "12px", color: "red" }}>{errors.name.message as string}</p>}
          </div>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" {...register("brand")} placeholder="e.g., Glamour" />
          </div>

          {/* Category dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              {...register("category", { required: "Category is required" })}
              style={{
                padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb",
                fontSize: "14px", background: "white", color: "#111", outline: "none", width: "100%",
              }}
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p style={{ fontSize: "12px", color: "red" }}>{errors.category.message as string}</p>}
            {categories.length === 0 && (
              <p style={{ fontSize: "12px", color: "#f97316" }}>No categories found. Please create categories first.</p>
            )}
          </div>

          {/* Supplier dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="supplier">Supplier <span style={{ color: "#9ca3af", fontSize: "12px" }}>(optional)</span></Label>
            <select
              id="supplier"
              {...register("supplier")}
              style={{
                padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb",
                fontSize: "14px", background: "white", color: "#111", outline: "none", width: "100%",
              }}
            >
              <option value="">No supplier</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} placeholder="e.g., LIP-RR-001" />
          </div>

          {/* Quantity and Min Stock */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", { required: "Quantity is required", min: 0 })}
                placeholder="0"
              />
              {errors.quantity && <p style={{ fontSize: "12px", color: "red" }}>{errors.quantity.message as string}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Label htmlFor="min_stock_level">Min Stock Level</Label>
              <Input id="min_stock_level" type="number" {...register("min_stock_level", { min: 0 })} placeholder="10" />
            </div>
          </div>

          {/* Unit Price */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label htmlFor="unit_price">Unit Price *</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              {...register("unit_price", { required: "Price is required", min: 0 })}
              placeholder="0.00"
            />
            {errors.unit_price && <p style={{ fontSize: "12px", color: "red" }}>{errors.unit_price.message as string}</p>}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px", paddingBottom: "8px" }}>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} style={{ backgroundColor: "hsl(var(--primary))" }}>
              {mutation.isPending ? "Saving..." : item ? "Update" : "Add Item"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryDialog;
