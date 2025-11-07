export function formatCustomDisc(discName: string): string {
    return discName.replace("smponline_discs:", "").replace(/_/g, " ");
}