export interface ShopData {
  id: number;
  owner: ShopOwner;
  location: ShopLocation;
  type: string; // SELLING or BUYING
  price: number;
  remaining: number;
  item: ShopItem;
  nearestWaystones: NearbyWaystone[];
}

export interface ShopOwner {
  name: string;
  uuid: string;
}

export interface ShopLocation {
  x: number;
  y: number;
  z: number;
  world: string;
}

export interface ShopItem {
  type: string;
  quantity: number;
  name: string;
  parsedSNBT: SNBTData;
}

export interface SNBTData {
  playerHeadPlayerName?: string;
  potionEffect?: string;
  customDiscSong?: string;
  writtenBookTitle?: string;
  writtenBookAuthor?: string;
  writtenBookPageCount?: string;
  paintingID?: string;
  paintingTitle?: string;
  paintingAuthor?: string;
  paintingOriginality?: string;
  enchantments: string[];
}

export interface NearbyWaystone {
  name: string;
  distance: number;
  directionRotation: number;
}
