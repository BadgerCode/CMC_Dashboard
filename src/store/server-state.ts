import { reactive } from "vue";

export interface ServerOverview {
  loaded: boolean;
  lastUpdated: Date;
  numPlayers: number;
  players: ServerPlayer[];
  numSales: number;
  numPaintings: number;
  status: string;
}

export interface ServerPlayer {
  name: string;
  uuid: string;
}

export const serverStore = reactive({
  loaded: false,
  lastUpdated: new Date(0),
  numPlayers: 0,
  numSales: 0,
  numPaintings: 0,
  status: 'Unknown'
} as ServerOverview);
