export interface ServerWaystones {
  lastUpdated: string;
  worlds: string[];
  waystones: Waystone[];
}

export interface Waystone {
  id: string;
  world: string;
  name: string;
  x: number;
  z: number;
  visitsThisWeek: number;
  visitsTotal: number;
}
