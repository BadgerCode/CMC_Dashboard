export interface ItemInfo {
  itemType: string;
  displayName: string;
  description?: string;
  moreInfoLink?: string;
  isSpecialItem?: boolean;
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
};
itemInfo["POTION"] = {
  itemType: "POTION",
  displayName: "Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A regular potion with a status effect that you have to drink.",
};
itemInfo["SPLASH_POTION"] = {
  itemType: "SPLASH_POTION",
  displayName: "Splash Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A throwable potion with a status effect.",
};
itemInfo["LINGERING_POTION"] = {
  itemType: "LINGERING_POTION",
  displayName: "Lingering Potions",
  icon: "fa-solid fa-flask",
  isSpecialItem: true,
  description: "A throwable potion which creates a cloud with a status effect.",
};
itemInfo["CUSTOM_MUSIC_DISC"] = {
  itemType: "CUSTOM_MUSIC_DISC",
  displayName: "Custom Music Discs",
  icon: "fa-solid fa-record-vinyl",
  isSpecialItem: true,
  description: "Music discs with custom songs. They may sometimes be shown as music disc 11.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/custom-music-discs"
};
itemInfo["LUA_FISH_MUSIC_BOOK"] = {
  itemType: "LUA_FISH_MUSIC_BOOK",
  displayName: "Custom Music Books",
  icon: "fa-solid fa-file-audio",
  isSpecialItem: true,
  description: "Written books that can be used on the Lua_Fish record player to play music.",
};
itemInfo["PAINTING"] = {
  itemType: "PAINTING",
  displayName: "Player Paintings",
  icon: "fa-solid fa-image",
  isSpecialItem: true,
  description: "Paintings created by the players of the server",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
};
itemInfo["PALETTE"] = {
  itemType: "PALETTE",
  displayName: "Palette",
  icon: "fa-solid fa-palette",
  isSpecialItem: true,
  description: "Used with a blank canvas to create a painting.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
};
itemInfo["FILLED_MAP"] = {
  itemType: "FILLED_MAP",
  displayName: "Map Artwork",
  icon: "fa-solid fa-map",
  isSpecialItem: true,
  description: "Maps used to display artwork. Includes regular maps too",
  shopCaveats: "Shop listings will include regular maps as well as map artwork.",
};
itemInfo["WAYSTONE"] = {
  itemType: "WAYSTONE",
  displayName: "Waystones",
  icon: "fa-solid fa-chess-rook",
  isSpecialItem: true,
  description: "Makes it easier for players to teleport back to a location like a town.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/waystones"
};
itemInfo["WARP_PLATE"] = {
  itemType: "WARP_PLATE",
  displayName: "Warp Plates",
  icon: "fa-solid fa-layer-group",
  isSpecialItem: true,
  description: "Allows teleporting between two locations by linking two warp plates together.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/warp-plates"
};
itemInfo["CAMERA"] = {
  itemType: "CAMERA",
  displayName: "Camera",
  icon: "fa-solid fa-camera",
  isSpecialItem: true,
  description: "Can be used with gunpowder to take in-game pictures!",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture"
};
itemInfo["CAMERA_PICTURE"] = {
  itemType: "CAMERA_PICTURE",
  displayName: "Camera Picture",
  icon: "fa-solid fa-photo-film",
  isSpecialItem: true,
  description: "Pictures taken using the in-game camera",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture"
};
itemInfo["PLAYER_HEAD"] = {
  itemType: "PLAYER_HEAD",
  displayName: "Player Heads",
  icon: "fa-solid fa-cube",
  isSpecialItem: true,
  description: "Can be used as decoration. Some have additional functionality through Figura.",
};
itemInfo["BEDROCK_DRILL"] = {
  itemType: "BEDROCK_DRILL",
  displayName: "Bedrock Drill",
  icon: "fa-solid fa-trowel",
  isSpecialItem: true,
  description: "Destroys blocks of bedrock.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/fung-tech-bedrock-drill"
};

const specialItems = Object.keys(itemInfo)
  .map((itemType) => itemInfo[itemType]!)
  .filter((i) => i != undefined && i.isSpecialItem);
