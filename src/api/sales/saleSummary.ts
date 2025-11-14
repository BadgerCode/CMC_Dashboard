export interface SaleSummary {
  occurredAt: string;
  id: string;
  type: string;
  itemType: string;
  quantity: number;
  totalPrice: number;
  isEnchanted: boolean;
  customName: string | null;
  itemAttributes: SoldItemAttribute[];
  insideContainer: boolean;
}

export interface SoldItemAttribute {
  key: string;
  value: string;
}
