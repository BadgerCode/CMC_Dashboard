export interface ItemInfo {
  itemType: string;
  displayName: string;
  description?: string;
  moreInfoLink?: string;
  hideWikiLink?: boolean;
  shopCaveats?: string;
}

const itemInfo = {} as { [itemType: string]: ItemInfo };

export function getItemInfo(itemType?: string): ItemInfo | null {
  if (itemType == null || itemType == undefined) return null;
  return itemInfo[itemType] ?? null;
}

// Item info
itemInfo["ENCHANTED_BOOK"] = {
  itemType: "ENCHANTED_BOOK",
  displayName: "Enchanted Books",
  description: "A book with one or more enchantments, used to enchant other items.",
};
itemInfo["POTION"] = {
  itemType: "POTION",
  displayName: "Potions",
  description: "A regular potion with a status effect that you have to drink.",
};
itemInfo["SPLASH_POTION"] = {
  itemType: "SPLASH_POTION",
  displayName: "Splash Potions",
  description: "A throwable potion with a status effect.",
};
itemInfo["LINGERING_POTION"] = {
  itemType: "LINGERING_POTION",
  displayName: "Lingering Potions",
  description: "A throwable potion which creates a cloud with a status effect.",
};
itemInfo["CUSTOM_MUSIC_DISC"] = {
  itemType: "CUSTOM_MUSIC_DISC",
  displayName: "Custom Music Discs",
  description: "Music discs with custom songs. They may sometimes be shown as music disc 11.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/custom-music-discs"
};
itemInfo["LUA_FISH_MUSIC_BOOK"] = {
  itemType: "LUA_FISH_MUSIC_BOOK",
  displayName: "Custom Music Books",
  description: "Written books that can be used on the Lua_Fish record player to play music.",
  hideWikiLink: true,
};
itemInfo["PAINTING"] = {
  itemType: "PAINTING",
  displayName: "Player Paintings",
  description: "Paintings created by the players of the server",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
};
itemInfo["PALETTE"] = {
  itemType: "PALETTE",
  displayName: "Palette",
  description: "Used with a blank canvas to create a painting.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
};
itemInfo["FILLED_MAP"] = {
  itemType: "FILLED_MAP",
  displayName: "Map Artwork",
  description: "Maps used to display artwork. Includes regular maps too",
  shopCaveats: "Shop listings will include regular maps as well as map artwork.",
};
itemInfo["WAYSTONE"] = {
  itemType: "WAYSTONE",
  displayName: "Waystones",
  description: "Makes it easier for players to teleport back to a location like a town.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/waystones"
};
itemInfo["WARP_PLATE"] = {
  itemType: "WARP_PLATE",
  displayName: "Warp Plates",
  description: "Allows teleporting between two locations by linking two warp plates together.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/warp-plates"
};
itemInfo["CAMERA"] = {
  itemType: "CAMERA",
  displayName: "Camera",
  description: "Can be used with gunpowder to take in-game pictures!",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture"
};
itemInfo["CAMERA_PICTURE"] = {
  itemType: "CAMERA_PICTURE",
  displayName: "Camera Picture",
  description: "Pictures taken using the in-game camera",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture"
};
itemInfo["PLAYER_HEAD"] = {
  itemType: "PLAYER_HEAD",
  displayName: "Player Heads",
  description: "Can be used as decoration. Some have additional functionality through Figura.",
};
itemInfo["BEDROCK_DRILL"] = {
  itemType: "BEDROCK_DRILL",
  displayName: "Bedrock Drill",
  description: "Destroys blocks of bedrock.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/fung-tech-bedrock-drill"
};
