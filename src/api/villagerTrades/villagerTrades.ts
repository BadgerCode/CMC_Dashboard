export interface VillagerTradesResponse {
  lastUpdated: string;
  trades: VillagerTrade[];
}

export interface VillagerTrade {
  itemType: string;
  extraInfo: string;
  quantity: number;
  price: number;
  currency: string;
  villager: string;
}
