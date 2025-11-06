export interface ServerWaystones {
  lastUpdated: string;
  worlds: { [world: string]: Waystone[] };
}

export interface Waystone {
  id: string;
  name: string;
  x: number;
  z: number;
  visitsThisWeek: number;
  visitsTotal: number;
}
