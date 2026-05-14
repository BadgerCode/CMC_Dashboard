export interface AlchemyConversionsResponse {
  lastUpdated: string;
  conversions: AlchmeyItem[][];
}

export interface AlchmeyItem {
  itemType: string;
  quantity: number;
}
