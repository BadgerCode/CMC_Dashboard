export interface CustomDiscsOverview {
  unsoldDiscs: number;
  discs: CustomDisc[];
}

export interface CustomDisc {
  name: string;
  displayName: string;
}
