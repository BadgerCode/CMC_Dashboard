export interface SNBTData {
    potionEffect?: string;
    paintingName?: string;
}


export function parseSNBTData(snbtData: string): SNBTData {
    let parsedData = {} as SNBTData;

    parsedData.potionEffect = [...snbtData.matchAll(/.*{potion:"([^"]+)"}.*/gi)][0]?.[1];
    parsedData.paintingName = [...snbtData.matchAll(/.*"xercapaint:canvas_title":'?(.+)'?,\"xercapaint:canvas_version.*/gi)][0]?.[1];

    return parsedData;
}

