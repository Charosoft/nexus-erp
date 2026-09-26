export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface TreasuryAccount {
  id: string;
  name: string;
  type: "CAISSE" | "BANQUE";
  currency: string;
  balance: number;
}

export interface SaleForm {
  clientId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  treasuryAccountId: string;
}

export interface SaleResponse {
  success: boolean;
  invoice_id: string;
  invoice_reference: string;
  total: number;
  stock_movement_id: string;
  treasury_movement_id: string;
  accounting_entry_id: string;
  message: string;
}