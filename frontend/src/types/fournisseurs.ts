export interface Fournisseur {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Achat {
  id: string;
  supplier_id: string;
  reference: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface PurchaseForm {
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  treasuryAccountId: string;
}

export interface PurchaseResponse {
  success: boolean;
  purchase_id: string;
  purchase_reference: string;
  total: number;
  stock_movement_id: string;
  treasury_movement_id: string;
  accounting_entry_id: string;
  message: string;
}