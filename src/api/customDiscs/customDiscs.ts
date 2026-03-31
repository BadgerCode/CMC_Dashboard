export interface CustomDiscsOverview {
  unsoldDiscs: number;
  discs: CustomDisc[];
}

export interface CustomDisc {
  name: string;
  displayName: string;
  source: string;
  version: string;
}

export interface CustomDiscStats {
  discName: string;
  numSales: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
}
