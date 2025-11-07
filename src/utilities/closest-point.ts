// God I love the typescript/node ecosystem
import * as KDTreeModule from "@/libraries/kdTree.js";
let kdTree = (KDTreeModule as any).kdTree;

export interface Point<DataType> {
  x: number;
  y: number;
  data: DataType;
}

export interface Neighbour<DataType> {
  point: Point<DataType>;
  distance: number;
}

export class NearestNeighbour<DataType> {
  private tree?: any;

  setPoints(points: Point<DataType>[]) {
    this.tree = new kdTree(points, this.distance, ["x", "y"]);
  }

  private distance(a: Point<DataType>, b: Point<DataType>) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  }

  findNearest(x: number, y: number, numResults: number): Neighbour<DataType>[] {
    if (!this.tree) return [];

    return (this.tree.nearest({ x: x, y: y }, numResults) as any[]).map(r => ({
      point: r[0],
      distance: Math.round(Math.sqrt(r[1]))
    } as Neighbour<DataType>));
  }
}

