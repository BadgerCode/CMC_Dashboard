export interface ItemInfo {
  description?: string;
  moreInfoLink?: string;
  hideWikiLink?: boolean;
  shopCaveats?: string;
  icon?: string | null;
  picture?: string | null;
}

const itemInfo = {} as { [itemType: string]: ItemInfo };

export function getItemInfo(itemType?: string): ItemInfo | null {
  if (itemType == null || itemType == undefined) return null;
  return itemInfo[itemType] ?? null;
}

// CUSTOM ITEMS
itemInfo["ENCHANTED_BOOK"] = {
  description: "A book with one or more enchantments, used to enchant other items.",
  picture: "https://minecraft.wiki/images/Enchanted_Book.gif?b21c4"
};
itemInfo["POTION"] = {
  description: "A regular potion with a status effect that you have to drink.",
  picture: "https://minecraft.wiki/images/Water_Bottle_JE2_BE2.png?acae5",
};
itemInfo["SPLASH_POTION"] = {
  description: "A throwable potion with a status effect.",
  picture: "https://minecraft.wiki/images/Splash_Water_Bottle_JE2_BE2.png?7a92d",
};
itemInfo["LINGERING_POTION"] = {
  description: "A throwable potion which creates a cloud with a status effect.",
  picture: "https://minecraft.wiki/images/Lingering_Water_Bottle_JE2_BE2.png?ed26b",
};
itemInfo["CUSTOM_MUSIC_DISC"] = {
  description: "Music discs with custom songs. They may sometimes be shown as music disc 11.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/custom-music-discs",
  icon: "fa-solid fa-record-vinyl"
};
itemInfo["LUA_FISH_MUSIC_BOOK"] = {
  description: "Written books that can be used on the Lua_Fish record player to play music.",
  hideWikiLink: true,
  icon: "fa-solid fa-file-audio",
};
itemInfo["PAINTING"] = {
  description: "Paintings created by the players of the server",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
  icon: "fa-solid fa-image",
};
itemInfo["PALETTE"] = {
  description: "Used with a blank canvas to create a painting.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/joy-of-painting",
  icon: "fa-solid fa-palette",
};
itemInfo["FILLED_MAP"] = {
  description: "Maps used to display artwork. Includes regular maps too",
  shopCaveats: "Shop listings will include regular maps as well as map artwork.",
  icon: "fa-solid fa-map",
};
itemInfo["WAYSTONE"] = {
  description: "Makes it easier for players to teleport back to a location like a town.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/waystones",
  icon: "fa-solid fa-chess-rook"
};
itemInfo["WARP_PLATE"] = {
  description: "Allows teleporting between two locations by linking two warp plates together.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/warp-plates",
  icon: "fa-solid fa-layer-group"
};
itemInfo["CAMERA"] = {
  description: "Can be used with gunpowder to take in-game pictures!",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture",
  icon: "fa-solid fa-camera"
};
itemInfo["CAMERA_PICTURE"] = {
  description: "Pictures taken using the in-game camera",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/camerapture",
  icon: "fa-solid fa-photo-film"
};
itemInfo["PLAYER_HEAD"] = {
  description: "Can be used as decoration. Some have additional functionality through Figura.",
  picture: "https://minecraft.wiki/images/Player_Head_%28S%29_JE2.png?6f81f",
};
itemInfo["BEDROCK_DRILL"] = {
  description: "Destroys blocks of bedrock.",
  moreInfoLink: "https://docs.callmecarson.live/books/smp-online/page/fung-tech-bedrock-drill",
  icon: "fa-solid fa-trowel",
};


// VANILLA ITEMS
itemInfo["IRON_INGOT"] = { picture: "https://minecraft.wiki/images/Iron_Ingot_JE3_BE2.png?849cb" };
itemInfo["IRON_BLOCK"] = { picture: "https://minecraft.wiki/images/Block_of_Iron_JE4_BE3.png?18948" };
itemInfo["GOLD_INGOT"] = { picture: "https://minecraft.wiki/images/Gold_Ingot_JE4_BE2.png?80cd6" };
itemInfo["GOLD_BLOCK"] = { picture: "https://minecraft.wiki/images/Block_of_Gold_JE6_BE3.png?09478" };
itemInfo["NETHERITE_INGOT"] = { picture: "https://minecraft.wiki/images/Netherite_Ingot_JE1_BE2.png?79364" };
itemInfo["EMERALD"] = { picture: "https://minecraft.wiki/images/Emerald_JE3_BE3.png?4c5f3" };
itemInfo["EMERALD_BLOCK"] = { picture: "https://minecraft.wiki/images/Block_of_Emerald_JE4_BE3.png?d5a3c" };
itemInfo["RAW_COPPER_BLOCK"] = { picture: "https://minecraft.wiki/images/Block_of_Raw_Copper_JE2_BE2.png?a4e9a" };
itemInfo["GUNPOWDER"] = { picture: "https://minecraft.wiki/images/Gunpowder_JE2_BE2.png?c4145" };
itemInfo["HEAVY_CORE"] = { picture: "https://minecraft.wiki/images/Heavy_Core_JE1_BE1.png?57df9" };
itemInfo["SHULKER_SHELL"] = { picture: "https://minecraft.wiki/images/Shulker_Shell_JE2_BE2.png?f3027" };
itemInfo["TRIAL_KEY"] = { picture: "https://minecraft.wiki/images/Trial_Key_JE2_BE2.png?a203a" };
itemInfo["OMINOUS_TRIAL_KEY"] = { picture: "https://minecraft.wiki/images/Ominous_Trial_Key_JE1_BE1.png?56dd6" };
itemInfo["NETHER_STAR"] = { picture: "https://minecraft.wiki/images/Nether_Star.gif?fb01f" };
itemInfo["BEACON"] = { picture: "https://minecraft.wiki/images/Beacon_JE6_BE2.png?684bf" };
itemInfo["ELYTRA"] = { picture: "https://minecraft.wiki/images/Elytra_%28item%29_JE1_BE1.png?8f01d" };
itemInfo["TOTEM_OF_UNDYING"] = { picture: "https://minecraft.wiki/images/Totem_of_Undying_JE2_BE2.png?d56eb" };
itemInfo["OAK_LOG"] = { picture: "https://minecraft.wiki/images/Oak_Log_%28UD%29_JE8_BE3.png" };
itemInfo["SPRUCE_LOG"] = { picture: "https://minecraft.wiki/images/Spruce_Log_(UD)_JE8_BE4.png" };
itemInfo["PALE_OAK_LOG"] = { picture: "https://minecraft.wiki/images/Pale_Oak_Log_(UD)_JE1_BE1.png" };
itemInfo["DARK_OAK_LOG"] = { picture: "https://minecraft.wiki/images/Dark_Oak_Log_(UD)_JE9_BE4.png" };
itemInfo["BIRCH_LOG"] = { picture: "https://minecraft.wiki/images/Birch_Log_(UD)_JE8_BE4.png" };
itemInfo["CHERRY_LOG"] = { picture: "https://minecraft.wiki/images/Cherry_Log_(UD)_JE1_BE1.png" };
itemInfo["JUNGLE_LOG"] = { picture: "https://minecraft.wiki/images/Jungle_Log_(UD)_JE9_BE4.png" };
itemInfo["MANGROVE_LOG"] = { picture: "https://minecraft.wiki/images/Mangrove_Log_(UD)_JE1_BE1.png" };
itemInfo["ACACIA_LOG"] = { picture: "https://minecraft.wiki/images/Acacia_Log_(UD)_JE8_BE3.png" };
itemInfo["BONE_BLOCK"] = { picture: "https://minecraft.wiki/images/Bone_Block_%28UD%29_JE2_BE2.png?21f6b" };
itemInfo["STONE"] = { picture: "https://minecraft.wiki/images/Stone_JE5_BE3.png?5780c" };
itemInfo["DIRT"] = { picture: "https://minecraft.wiki/images/Dirt_JE2_BE2.png?438ac" };
itemInfo["COBBLED_DEEPSLATE"] = { picture: "https://minecraft.wiki/images/Cobbled_Deepslate.png?86523" };
itemInfo["WRITTEN_BOOK"] = { picture: "https://minecraft.wiki/images/Written_Book_JE2_BE2.gif?c6510" };


