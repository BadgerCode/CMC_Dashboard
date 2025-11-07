export interface SNBTData {
    potionEffect?: string;
    paintingID?: string;
    paintingName?: string;
    enchantments: string[];
}


export function parseSNBTData(snbtData: string): SNBTData {
    let parsedData = {} as SNBTData;

    parsedData.potionEffect = [...snbtData.matchAll(/.*{potion:"([^"]+)"}.*/gi)][0]?.[1];
    parsedData.paintingID = [...snbtData.matchAll(/.*"xercapaint:canvas_id":"([a-fA-F0-9_\-]+)",.*/gi)][0]?.[1];
    parsedData.paintingName = [...snbtData.matchAll(/.*"xercapaint:canvas_title":'?(.+)'?,\"xercapaint:canvas_version.*/gi)][0]?.[1];

    let rawEnchantments = [...snbtData.matchAll(/.*\"minecraft:enchantments\":{levels:{([^}]+)}}.*/gi)][0]?.[1]?.split(",") ?? [];
    parsedData.enchantments = rawEnchantments.map(raw => raw.replace(/"minecraft:([^"]+)":(\d+)/, "$1 $2").replace(/_/g, " "));

    return parsedData;
}

