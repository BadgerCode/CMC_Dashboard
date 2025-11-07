import { Config } from "@/config";
import type { ServerWaystones, Waystone } from "./waystone";

export async function loadWaystones(): Promise<ServerWaystones> {
  let url = `${Config.APIURL}/api/waystones`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve waystones");

  let response = await httpResponse.json();

  let worlds = [] as string[];
  let waystones = [] as Waystone[];
  for (const world in response.worlds) {
    worlds.push(world);

    waystones.push(...response.worlds[world].flatMap((w: any) => {
      let worldInfo =
        [
          ...w.options.popup.content.matchAll(
            /.*<br\/><br\/>(\d+) visits this week<br\/>(\d+) total visits.*/gi
          ),
        ][0] ?? [];

      return {
        id: w.data.key,
        world: world,
        name: w.options.tooltip.content,
        x: w.data.point.x,
        z: w.data.point.z,
        visitsThisWeek: worldInfo.length >= 1 ? worldInfo[1] : 0,
        visitsTotal: worldInfo.length >= 2 ? worldInfo[2] : 0,
      } as Waystone;
    }));
  }

  return {
    lastUpdated: response.lastUpdated,
    worlds: worlds,
    waystones: waystones,
  };
}
