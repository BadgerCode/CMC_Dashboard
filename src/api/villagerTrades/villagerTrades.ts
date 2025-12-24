export interface VillagerTradesResponse {
  trades: VillagerTrade[];
}

export interface VillagerTrade {
  itemType: string;
  quantity: number;
  price: number;
  currency: string;
  villager: string;
}
