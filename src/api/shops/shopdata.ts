import type { SNBTData } from "@/utilities/snbt-processor";

export interface ShopData {
  id: number;
  owner: ShopOwner;
  location: ShopLocation;
  type: string; // SELLING or BUYING
  price: number;
  remaining: number;
  item: ShopItem;
  nearestWaystones: NearbyWaystone[]
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
  snbt: string;
  parsedSNBT: SNBTData;
}

export interface NearbyWaystone {
  name: string;
  distance: number;
  directionRotation: number;
};
