export interface SNBTData {
    potionEffect?: string;
}


export function parseSNBTData(snbtData: string): SNBTData {
    let parsedData = {} as SNBTData;

    parsedData.potionEffect = [...snbtData.matchAll(/.*{potion:"([^"]+)"}.*/gi)][0]?.[1];

    return parsedData;
}

