import type { SoldItemAttribute } from "../sales/saleSummary";

export interface PaintingSaleSummary {
  occurredAt: string;
  id: string;
  type: string;
  quantity: number;
  totalPrice: number;
  insideContainer: boolean;
  customName: string;
  additionalAttributes: SoldItemAttribute[];
}
