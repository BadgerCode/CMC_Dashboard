import { Config } from "@/config";
import type { Painting } from "./painting";
import type { PaintingSaleSummary } from "./paintingSaleSummary";
import type { SaleSummary } from "../sales/saleSummary";

export async function loadPaintings(authorName?: string, lastItem?: Painting): Promise<Painting[]> {
  const params = new URLSearchParams();

  // Add last item for pagination
  if (lastItem != null) {
    params.append("before", lastItem.createdAt);
    params.append("lastID", lastItem.id);
  }

  // Add author name for artist pages
  if (authorName != null) {
    params.append("authorName", authorName);
  }

  // Send request
  let url = `${Config.APIURL}/api/paintings?${params.toString()}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) throw new Error("Failed to retrieve paintings");

  let response = await httpResponse.json();

  return response.items;
}


export async function fetchPainting(paintingID: string): Promise<Painting | null> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  return response.result;
}


export async function fetchPaintingSales(paintingID: string): Promise<SaleSummary[]> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}/sales`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return (response.items as PaintingSaleSummary[])
    .map((s) =>
    ({
      id: s.id,
      occurredAt: s.occurredAt,
      type: s.type,
      itemType: "PAINTING",
      quantity: s.quantity,
      totalPrice: s.totalPrice,
      isEnchanted: false,
      itemAttributes: s.additionalAttributes,
      customName: s.customName,
      insideContainer: s.insideContainer,
    } as SaleSummary));
}
