interface Conversion {
  source: string;
  sourceQuantity: number;
  target: string;
  targetQuantity: number;
}

var rawAlchmecy = `Grass -> Podzol
Podzol -> Mycelium
Mycelium -> Grass
Dirt -> Rooted Dirt
Rooted Dirt -> Coarse Dirt
Coarse Dirt -> Dirt
Cobblestone -> Gravel -> Clay -> Sand -> Cobblestone
Cobbled Deepslate -> Gravel
Granite -> Diorite -> Andesite -> Calcite -> Tuff -> Dripstone Block -> Granite
Prismarine -> Dark Prismarine -> Prismarine
Netherrack -> Red Sand -> Netherrack
Red Mushroom Block -> Brown Mushroom Block -> Mushroom Stem -> Red Mushroom Block
Azalea -> Flowering Azalea -> Azalea
Azalea Leaves -> Flowering Azalea Leaves -> Azalea Leaves
Wet Sponge -> Sponge
Sponge -> Wet Sponge
Any Stained Glass -> Glass
Any Stained Glass Pane -> Glass Pane
Any Glazed Terracotta -> Equivalent Normal Terracotta
Any Mossy Block -> Non-Mossy Variant
Any Banner -> White Banner
Glass -> Sand
3x Glass Pane -> 1x Sand
Soul Soil -> Soul Sand
Obsidian -> Crying Obsidian
Charcoal -> Black Dye
8x Snow Block -> 1x Blue Ice
1x Blue Ice -> 4x Packed Ice
1x Packed Ice -> 4x Ice
Sticky Piston -> Piston
Any Sapling -> Stick
Any fish item -> Bonemeal
16x Rotten Flesh -> 1x Leather`;

/*
mossy_cobblestone
mossy_stone_bricks
maybe others?- https://minecraftitemids.com/

tropical_fish
pufferfish
cod
salmon
cooked versions?
*/

const colours = [
  "RED",
  "LIME",
  "PINK",
  "GRAY",
  "CYAN",
  "BLUE",
  "WHITE",
  "BROWN",
  "GREEN",
  "BLACK",
  "ORANGE",
  "YELLOW",
  "PURPLE",
  "MAGENTA",
  "LIGHT_BLUE",
  "LIGHT_GRAY",
];

var alchmeyConversionsRaw = rawAlchmecy.split("\n").map((l) => l.split(" -> "));
var alchemyConversions = [] as Conversion[];

const itemQuantityRegex = new RegExp(/(\d+)x (.*)/i);

for (const rawConversion of alchmeyConversionsRaw) {
  for (let i = 0; i < rawConversion.length - 1; i++) {
    const sourceItem = rawConversion[i]!.toUpperCase();
    const sourceItemSplit = sourceItem?.match(itemQuantityRegex);
    const sourceQuantity = parseInt(sourceItem?.match(itemQuantityRegex)?.[1] ?? "1");

    const targetItem = rawConversion[i + 1]!.toUpperCase();
    const targetItemSplit = targetItem?.match(itemQuantityRegex);
    const targetQuantity = parseInt(targetItem?.match(itemQuantityRegex)?.[1] ?? "1");

    addConversion({
      source: (sourceItemSplit?.[2] ?? sourceItem).replace(/ /g, "_"),
      sourceQuantity: sourceQuantity,
      target: (targetItemSplit?.[2] ?? targetItem).replace(/ /g, "_"),
      targetQuantity: targetQuantity,
    });
  }
}

console.log(alchemyConversions);

function addConversion(conversion: Conversion) {
  let conversions = [];

  if (conversion.source == "ANY_STAINED_GLASS") {
    conversions = colours.map(
      (c) =>
        ({
          source: `${c}_STAINED_GLASS`,
          sourceQuantity: conversion.sourceQuantity,
          target: conversion.target,
          targetQuantity: conversion.targetQuantity,
        }) as Conversion,
    );
  } else if (conversion.source == "ANY_STAINED_GLASS_PANE") {
    conversions = colours.map(
      (c) =>
        ({
          source: `${c}_STAINED_GLASS_PANE`,
          sourceQuantity: conversion.sourceQuantity,
          target: conversion.target,
          targetQuantity: conversion.targetQuantity,
        }) as Conversion,
    );
  } else if (conversion.source == "ANY_GLAZED_TERRACOTTA" && conversion.target == "EQUIVALENT_NORMAL_TERRACOTTA") {
    conversions = colours.map(
      (c) =>
        ({
          source: `${c}_GLAZED_TERRACOTTA`,
          sourceQuantity: conversion.sourceQuantity,
          target: `${c}_TERRACOTTA`,
          targetQuantity: conversion.targetQuantity,
        }) as Conversion,
    );
  }
  // TODO: ANY_MOSSY_BLOCK -> NON-MOSSY_VARIANT
  else if (conversion.source == "ANY_BANNER") {
    conversions = colours.map(
      (c) =>
        ({
          source: `${c}_BANNER`,
          sourceQuantity: conversion.sourceQuantity,
          target: conversion.target,
          targetQuantity: conversion.targetQuantity,
        }) as Conversion,
    );
  } else if (conversion.source == "ANY_SAPLING") {
    conversions = [
      "OAK_SAPLING",
      "BIRCH_SAPLING",
      "SPRUCE_SAPLING",
      "JUNGLE_SAPLING",
      "ACACIA_SAPLING",
      "DARK_OAK_SAPLING",
      "CHERRY_SAPLING",
    ].map(
      (c) =>
        ({
          source: `${c}_BANNER`,
          sourceQuantity: conversion.sourceQuantity,
          target: conversion.target,
          targetQuantity: conversion.targetQuantity,
        }) as Conversion,
    );
  }
  // TODO: ANY_FISH_ITEM -> BONEMEAL
  else {
    conversions.push(conversion);
  }

  alchemyConversions.push(...conversions);
}
