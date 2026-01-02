import { Config } from "@/config";
import type { Painting } from "./painting";
import type { PaintingSaleSummary } from "./paintingSaleSummary";
import type { SaleSummary } from "../sales/saleSummary";

export interface PaintingsFilter {
  authorName?: string;
  lastItem?: Painting;
  title?: string;
  size?: string;
  onlyPossibleMultiCanvas?: boolean;
  ids?: string[];
}

export async function loadPaintings(filters: PaintingsFilter): Promise<Painting[]> {
  const params = new URLSearchParams();

  // Add last item for pagination
  if (filters.lastItem != null) {
    params.append("before", filters.lastItem.createdAt);
    params.append("lastID", filters.lastItem.id);
  }

  // Optional filters
  if (filters.authorName) params.append("authorName", filters.authorName);
  if (filters.title) params.append("title", filters.title);
  if (filters.size) params.append("size", filters.size);
  if (filters.onlyPossibleMultiCanvas) params.append("possibleMultiCanvas", "true");
  if (filters.ids) {
    for (const id of filters.ids) {
      params.append("paintingId", id);
    }
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
  return (response.items as PaintingSaleSummary[]).map(
    (s) =>
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
      } as SaleSummary)
  );
}
