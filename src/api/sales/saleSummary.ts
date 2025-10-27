export interface SaleSummary {
  occurredAt: string;
  id: string;
  type: string;
  itemType: string;
  quantity: number;
  totalPrice: number;
  isRenamed: boolean;
  isEnchanted: boolean;
}
