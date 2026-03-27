<script setup lang="ts">
import { computed } from 'vue';
import ItemTypeSearch from './ItemTypeSearch.vue';
import { formatItemType } from '@/utilities/item-type-format';
import { userStore } from '@/store/user-state';
import { appStore } from '@/store/app-state';
import { getItemInfo, type ItemInfo } from '@/models/item-info';

interface Category {
  name: string;
  icon: string;
  items: Item[];
}

interface Item {
  type: string;
  info: ItemInfo | null;
}

const categories = [
  {
    name: "Valuable Resources",
    icon: "fa-regular fa-gem",
    items: [
      { type: "IRON_INGOT", info: getItemInfo("IRON_INGOT") },
      { type: "IRON_BLOCK", info: getItemInfo("IRON_BLOCK") },
      { type: "GOLD_INGOT", info: getItemInfo("GOLD_INGOT") },
      { type: "GOLD_BLOCK", info: getItemInfo("GOLD_BLOCK") },
      { type: "NETHERITE_INGOT", info: getItemInfo("NETHERITE_INGOT") },
      { type: "EMERALD", info: getItemInfo("EMERALD") },
      { type: "EMERALD_BLOCK", info: getItemInfo("EMERALD_BLOCK") },
      { type: "RAW_COPPER_BLOCK", info: getItemInfo("RAW_COPPER_BLOCK") },
      { type: "GUNPOWDER", info: getItemInfo("GUNPOWDER") },
      { type: "HEAVY_CORE", info: getItemInfo("HEAVY_CORE") },
      { type: "SHULKER_SHELL", info: getItemInfo("SHULKER_SHELL") },
      { type: "TRIAL_KEY", info: getItemInfo("TRIAL_KEY") },
      { type: "OMINOUS_TRIAL_KEY", info: getItemInfo("OMINOUS_TRIAL_KEY") },
      { type: "NETHER_STAR", info: getItemInfo("NETHER_STAR") },
    ]
  },
  {
    name: "Equipment",
    icon: "fa-solid fa-hammer",
    items: [
      { type: "BEACON", info: getItemInfo("BEACON") },
      { type: "WAYSTONE", info: getItemInfo("WAYSTONE") },
      { type: "WARP_PLATE", info: getItemInfo("WARP_PLATE") },
      { type: "ELYTRA", info: getItemInfo("ELYTRA") },
      { type: "TOTEM_OF_UNDYING", info: getItemInfo("TOTEM_OF_UNDYING") },
      { type: "ENCHANTED_BOOK", info: getItemInfo("ENCHANTED_BOOK") },
      { type: "POTION", info: getItemInfo("POTION") },
      { type: "SPLASH_POTION", info: getItemInfo("SPLASH_POTION") },
      { type: "LINGERING_POTION", info: getItemInfo("LINGERING_POTION") },
      { type: "BEDROCK_DRILL", info: getItemInfo("BEDROCK_DRILL") },
    ]
  },
  {
    name: "Building Resources",
    icon: "fa-solid fa-cubes",
    items: [
      { type: "OAK_LOG", info: getItemInfo("OAK_LOG") },
      { type: "SPRUCE_LOG", info: getItemInfo("SPRUCE_LOG") },
      { type: "PALE_OAK_LOG", info: getItemInfo("PALE_OAK_LOG") },
      { type: "DARK_OAK_LOG", info: getItemInfo("DARK_OAK_LOG") },
      { type: "BIRCH_LOG", info: getItemInfo("BIRCH_LOG") },
      { type: "CHERRY_LOG", info: getItemInfo("CHERRY_LOG") },
      { type: "JUNGLE_LOG", info: getItemInfo("JUNGLE_LOG") },
      { type: "MANGROVE_LOG", info: getItemInfo("MANGROVE_LOG") },
      { type: "ACACIA_LOG", info: getItemInfo("ACACIA_LOG") },
      { type: "BONE_BLOCK", info: getItemInfo("BONE_BLOCK") },
      { type: "STONE", info: getItemInfo("STONE") },
      { type: "DIRT", info: getItemInfo("DIRT") },
      { type: "COBBLED_DEEPSLATE", info: getItemInfo("COBBLED_DEEPSLATE") },
    ]
  },
  {
    name: "Art",
    icon: "fa-solid fa-palette",
    items: [
      { type: "PAINTING", info: getItemInfo("PAINTING") },
      { type: "PALETTE", info: getItemInfo("PALETTE") },
      { type: "CAMERA_PICTURE", info: getItemInfo("CAMERA_PICTURE") },
      { type: "CAMERA", info: getItemInfo("CAMERA") },
      { type: "WRITTEN_BOOK", info: getItemInfo("WRITTEN_BOOK") },
      { type: "CUSTOM_MUSIC_DISC", info: getItemInfo("CUSTOM_MUSIC_DISC") },
      { type: "LUA_FISH_MUSIC_BOOK", info: getItemInfo("LUA_FISH_MUSIC_BOOK") },
      { type: "FILLED_MAP", info: getItemInfo("FILLED_MAP") },
      { type: "PLAYER_HEAD", info: getItemInfo("PLAYER_HEAD") },
    ]
  }
] as Category[];

if (appStore.selectedItemCategory == null)
  appStore.selectedItemCategory = categories[0]!.name;

const categoryItems = computed(() => {
  if (appStore.selectedItemCategory == "Recent") {
    return userStore.recentlyViewedItems
      .map(i => ({
        type: i,
        info: getItemInfo(i)
      } as Item))
      .reverse();
  }

  let category = categories.find(c => c.name == appStore.selectedItemCategory);
  return category?.items ?? [];
});


function selectCategory(name: string) {
  appStore.selectedItemCategory = name;
}

</script>

<template>
  <div class="flex flex-col">
    <!-- Categories -->
    <div class="flex flex-row gap-1 mb-1">
      <div v-for="category in categories" class="item-button category"
        :class="{ 'active': appStore.selectedItemCategory == category.name }" @click="selectCategory(category.name)">
        <div class="text-2xl"><font-awesome-icon :icon="category.icon" /></div>
      </div>

      <div class="flex-grow"></div>

      <!-- Recent items -->
      <div class="item-button category" :class="{ 'active': appStore.selectedItemCategory == 'Recent' }"
        @click="selectCategory('Recent')">
        <div class="text-2xl"><font-awesome-icon icon="fa-solid fa-clock-rotate-left" /></div>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-col p-2 gap-2 bg-gray-800 border border-gray-700 rounded">
      <!-- Search -->
      <div class="flex flex-col md:flex-row border-b-2 border-gray-700 pb-2">
        <ItemTypeSearch @selection="
          (itemType) => {
            if (itemType) $router.push({ name: 'itemSales', params: { itemType: itemType } });
          }
        ">
        </ItemTypeSearch>
      </div>

      <!-- Item types -->
      <div class="flex flex-row flex-wrap gap-1 content-start justify-center max-h-48 h-auto overflow-x-scroll">
        <RouterLink v-for="item in categoryItems" :to="{ name: 'itemSales', params: { itemType: item.type } }"
          class="item-button" :title="formatItemType(item.type)">

          <!-- Item icon/picture -->
          <div v-if="item.info?.icon" class="text-xl">
            <font-awesome-icon :icon="item.info.icon" />
          </div>
          <div v-else-if="item.info?.picture">
            <img :src="item.info.picture" class="size-6" />
          </div>

          <!-- Item name -->
          <div class="text-xs overflow-hidden text-ellipsis">
            {{ formatItemType(item.type) }}
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@import "tailwindcss";

.item-button {
  @apply p-1 w-18 h-18 gap-1 bg-gray-700 hover:bg-gray-600 flex flex-col items-center text-center justify-center text-gray-300 rounded cursor-pointer;
}

.item-button.category {
  @apply w-15 h-15;
}

.item-button.category.active {
  @apply text-gray-700 bg-gray-300;
}
</style>
