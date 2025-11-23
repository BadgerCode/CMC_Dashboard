import { Config } from "@/config";
import type { Painting } from "./painting";

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
