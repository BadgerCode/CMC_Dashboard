import { reactive } from "vue";

export interface ServerOverview {
  lastUpdated: Date;
  numPlayers: number;
  numSales: number;
  numPaintings: number;
  status: string;
}

export const serverStore = reactive({
  lastUpdated: new Date(0),
  numPlayers: 0,
  numSales: 0,
  numPaintings: 0,
  status: 'Unknown'
} as ServerOverview);
