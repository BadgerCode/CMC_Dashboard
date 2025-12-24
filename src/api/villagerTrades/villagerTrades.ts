export interface VillagerTradesResponse {
  lastUpdated: string;
  trades: VillagerTrade[];
}

export interface VillagerTrade {
  itemType: string;
  quantity: number;
  price: number;
  currency: string;
  villager: string;
}
