export interface AlchemyConversionsResponse {
  lastUpdated: string;
  conversions: AlchmeyConversion[];
}

export interface AlchmeyConversion {
  source: string;
  sourceQuantity: number;
  target: string;
  targetQuantity: number;
}

export interface AlchmeyItem {
  creates: AlchmeyConversion | null;
  createdBy: AlchmeyConversion[];
}
