export function convertToShopItemType(itemType: string): string {
  if (itemType == "LUA_FISH_MUSIC_BOOK") return "WRITTEN_BOOK";
  if (itemType == "CUSTOM_MUSIC_DISC") return "MUSIC_DISC_11";
  if (itemType == "WAYSTONE") return "COBBLESTONE_WALL";

  return itemType;
}

export function convertFromShopItemType(itemType: string): string {
  // if(itemType == "WRITTEN_BOOK") return "LUA_FISH_MUSIC_BOOK"; // TODO
  // if(itemType == "MUSIC_DISC_11") return "CUSTOM_MUSIC_DISC"; // TODO
  // if(itemType == "COBBLESTONE_WALL") return "WAYSTONE"; // TODO

  return itemType;
}
