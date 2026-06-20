// Stock Input (Batch / Lot) — every time inventory is recharged for an existing
// product, a new StockInput row is created. Product identity stays the same;
// the batch carries its own cost/sale price, quantity, location and dates.

export interface StockInput {
  id: number;
  productId: number;
  productName?: string;
  batchNumber: string;
  quantity: number;
  soldQuantity: number;
  costPrice: number;
  salePrice: number;
  currency: string;
  supplierId?: number;
  supplierName?: string;
  spaceId?: number;
  spaceName?: string;
  zoneId?: number;
  zoneName?: string;
  shelfId?: number;
  shelfCode?: string;
  receivedDate: string; // ISO
  expiryDate?: string;  // ISO
  notes?: string;
  createdAt?: string;
}

export interface CreateStockInputRequest {
  productId: number;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  currency: string;
  supplierId?: number;
  spaceId?: number;
  zoneId?: number;
  shelfId?: number;
  receivedDate: string;
  expiryDate?: string;
  notes?: string;
}

export interface StockInputFilter {
  productId?: number;
  supplierId?: number;
  from?: string;
  to?: string;
}
