export interface ItemInfo {
  itemType: string;
  description?: string;
  isSpecialItem?: boolean;
  displayName?: string; // Could default to formatted item type
  icon?: string;
  shopCaveats?: string;
}

const itemInfo = {} as { [itemType: string]: ItemInfo };

export function getItemInfo(itemType?: string): ItemInfo | null {
  if (itemType == null || itemType == undefined) return null;
  return itemInfo[itemType] ?? null;
}

export function getSpecialItems(): ItemInfo[] {
  return specialItems;
}

// Item info
itemInfo["ENCHANTED_BOOK"] = {
  itemType: "ENCHANTED_BOOK",
  displayName: "Enchanted Books",
  icon: "fa-solid fa-book-bookmark",
  isSpecialItem: true,
  description: "A book with one or more enchantments, used to enchant other items.",
  shopCaveats: "Book enchantments are missing from shop listings and filtering will not work.",
}
itemInfo["POTION"] = {
  itemType: "POTION",
  displayName: "Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A regular potion with a status effect that you have to drink.",
}
itemInfo["SPLASH_POTION"] = {
  itemType: "SPLASH_POTION",
  displayName: "Splash Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A throwable potion with a status effect.",
}
itemInfo["LINGERING_POTION"] = {
  itemType: "LINGERING_POTION",
  displayName: "Lingering Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A throwable potion which creates a cloud with a status effect.",
}
itemInfo["CUSTOM_MUSIC_DISC"] = {
  itemType: "CUSTOM_MUSIC_DISC",
  displayName: "Custom Music Discs",
  icon: "fa-solid fa-record-vinyl",
  isSpecialItem: true,
  description: "Music discs with custom songs. They use music disc 11.",
  shopCaveats: "Custom music disc titles are missing from shop listings and filtering will not work.",
}
itemInfo["LUA_FISH_MUSIC_BOOK"] = {
  itemType: "LUA_FISH_MUSIC_BOOK",
  displayName: "Custom Music Books",
  icon: "fa-solid fa-file-audio",
  isSpecialItem: true,
  description: "Written books that can be used on the Lua_Fish record player to play music.",
  shopCaveats: "Shop listings will include regular written books too.",
}
itemInfo["PLAYER_HEAD"] = {
  itemType: "PLAYER_HEAD",
  displayName: "Player Heads",
  icon: "fa-solid fa-cube",
  isSpecialItem: true,
  description: "Can be used as decoration. Some have additional functionality through Figura.",
  shopCaveats: "Shop listings will not include the name of the player that the head belongs to."
}
itemInfo["PAINTING"] = {
  itemType: "PAINTING",
  displayName: "Player Paintings",
  icon: "fa-solid fa-image",
  isSpecialItem: true,
}
itemInfo["WAYSTONE"] = {
  itemType: "WAYSTONE",
  displayName: "Waystones",
  icon: "fa-solid fa-chess-rook",
  isSpecialItem: true,
  description: "Makes it easier for players to teleport back to a location like a town.",
  shopCaveats: "Shop listings may include regular cobblestone walls."
}


const specialItems = Object.keys(itemInfo).map(itemType => itemInfo[itemType]!).filter(i => i != undefined && i.isSpecialItem);
