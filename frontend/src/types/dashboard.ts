export interface Product {
  id: string;
  reference: string;
  name: string;
  description?: string;
  unit_price: number;
  purchase_price?: number;
  alert_threshold: number;
  is_active: boolean;

  categories_produits?: {
    id: string;
    name: string;
  };

  stocks: {
    quantity: number;
    updated_at: string;
  };
}

export interface TreasuryAccount {
  id: string;
  name: string;
  type: "CAISSE" | "BANQUE";
  currency: string;
  balance: number;
}

export interface TreasuryMovement {
  id: string;
  type: "ENTREE" | "SORTIE";
  amount: number;
  reference: string;
  source_type: string;
  created_at: string;
}

export interface DashboardData {
  products: Product[];
  accounts: TreasuryAccount[];
  movements: TreasuryMovement[];
}