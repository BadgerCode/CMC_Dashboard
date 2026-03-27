<script setup lang="ts">
import { computed, ref } from 'vue';
import ItemTypeSearch from './ItemTypeSearch.vue';
import { formatItemType } from '@/utilities/item-type-format';
import { userStore } from '@/store/user-state';

interface Category {
  name: string;
  icon: string;
  items: Item[];
}

interface Item {
  type: string;
  icon?: string | null;
  picture?: string | null;
}

const categories = [
  {
    name: "Valuable Resources",
    icon: "fa-regular fa-gem",
    items: [
      { type: "IRON_INGOT", picture: "https://minecraft.wiki/images/Iron_Ingot_JE3_BE2.png?849cb" },
      { type: "IRON_BLOCK", picture: "https://minecraft.wiki/images/Block_of_Iron_JE4_BE3.png?18948" },
      { type: "GOLD_INGOT", picture: "https://minecraft.wiki/images/Gold_Ingot_JE4_BE2.png?80cd6" },
      { type: "GOLD_BLOCK", picture: "https://minecraft.wiki/images/Block_of_Gold_JE6_BE3.png?09478" },
      { type: "NETHERITE_INGOT", picture: "https://minecraft.wiki/images/Netherite_Ingot_JE1_BE2.png?79364" },
      { type: "EMERALD", picture: "https://minecraft.wiki/images/Emerald_JE3_BE3.png?4c5f3" },
      { type: "EMERALD_BLOCK", picture: "https://minecraft.wiki/images/Block_of_Emerald_JE4_BE3.png?d5a3c" },
      { type: "RAW_COPPER_BLOCK", picture: "https://minecraft.wiki/images/Block_of_Raw_Copper_JE2_BE2.png?a4e9a" },
      { type: "GUNPOWDER", picture: "https://minecraft.wiki/images/Gunpowder_JE2_BE2.png?c4145" },
      { type: "HEAVY_CORE", picture: "https://minecraft.wiki/images/Heavy_Core_JE1_BE1.png?57df9" },
      { type: "SHULKER_SHELL", picture: "https://minecraft.wiki/images/Shulker_Shell_JE2_BE2.png?f3027" },
      { type: "TRIAL_KEY", picture: "https://minecraft.wiki/images/Trial_Key_JE2_BE2.png?a203a" },
      { type: "OMINOUS_TRIAL_KEY", picture: "https://minecraft.wiki/images/Ominous_Trial_Key_JE1_BE1.png?56dd6" },
      { type: "NETHER_STAR", picture: "https://minecraft.wiki/images/Nether_Star.gif?fb01f" },
    ]
  },
  {
    name: "Equipment",
    icon: "fa-solid fa-hammer",
    items: [
      { type: "BEACON", picture: "https://minecraft.wiki/images/Beacon_JE6_BE2.png?684bf" },
      { type: "WAYSTONE", icon: "fa-solid fa-chess-rook" },
      { type: "WARP_PAD", icon: "fa-solid fa-layer-group" },
      { type: "ELYTRA", picture: "https://minecraft.wiki/images/Elytra_%28item%29_JE1_BE1.png?8f01d" },
      { type: "TOTEM_OF_UNDYING", picture: "https://minecraft.wiki/images/Totem_of_Undying_JE2_BE2.png?d56eb" },
      { type: "ENCHANTED_BOOK", picture: "https://minecraft.wiki/images/Enchanted_Book.gif?b21c4" },
      { type: "POTION", picture: "https://minecraft.wiki/images/Water_Bottle_JE2_BE2.png?acae5" },
      { type: "SPLASH_POTION", picture: "https://minecraft.wiki/images/Splash_Water_Bottle_JE2_BE2.png?7a92d" },
      { type: "LINGERING_POTION", picture: "https://minecraft.wiki/images/Lingering_Water_Bottle_JE2_BE2.png?ed26b" },
      { type: "BEDROCK_DRILL", icon: "fa-solid fa-trowel" }
    ]
  },
  {
    name: "Building Resources",
    icon: "fa-solid fa-cubes",
    items: [
      { type: "OAK_LOG", picture: "https://minecraft.wiki/images/Oak_Log_%28UD%29_JE8_BE3.png" },
      { type: "SPRUCE_LOG", picture: "https://minecraft.wiki/images/Spruce_Log_(UD)_JE8_BE4.png" },
      { type: "PALE_OAK_LOG", picture: "https://minecraft.wiki/images/Pale_Oak_Log_(UD)_JE1_BE1.png" },
      { type: "DARK_OAK_LOG", picture: "https://minecraft.wiki/images/Dark_Oak_Log_(UD)_JE9_BE4.png" },
      { type: "BIRCH_LOG", picture: "https://minecraft.wiki/images/Birch_Log_(UD)_JE8_BE4.png" },
      { type: "CHERRY_LOG", picture: "https://minecraft.wiki/images/Cherry_Log_(UD)_JE1_BE1.png" },
      { type: "JUNGLE_LOG", picture: "https://minecraft.wiki/images/Jungle_Log_(UD)_JE9_BE4.png" },
      { type: "MANGROVE_LOG", picture: "https://minecraft.wiki/images/Mangrove_Log_(UD)_JE1_BE1.png" },
      { type: "ACACIA_LOG", picture: "https://minecraft.wiki/images/Acacia_Log_(UD)_JE8_BE3.png" },
      { type: "BONE_BLOCK", picture: "https://minecraft.wiki/images/Bone_Block_%28UD%29_JE2_BE2.png?21f6b" },
      { type: "STONE", picture: "https://minecraft.wiki/images/Stone_JE5_BE3.png?5780c" },
      { type: "DIRT", picture: "https://minecraft.wiki/images/Dirt_JE2_BE2.png?438ac" },
      { type: "COBBLED_DEEPSLATE", picture: "https://minecraft.wiki/images/Cobbled_Deepslate.png?86523" }
    ]
  },
  {
    name: "Art",
    icon: "fa-solid fa-palette",
    items: [
      { type: "PAINTING", icon: "fa-solid fa-image" },
      { type: "PALETTE", icon: "fa-solid fa-palette" },
      { type: "CAMERA_PICTURE", icon: "fa-solid fa-photo-film" },
      { type: "CAMERA", icon: "fa-solid fa-camera" },
      { type: "WRITTEN_BOOK", picture: "https://minecraft.wiki/images/Written_Book_JE2_BE2.gif?c6510" },
      { type: "CUSTOM_MUSIC_DISC", icon: "fa-solid fa-record-vinyl" },
      { type: "LUA_FISH_MUSIC_BOOK", icon: "fa-solid fa-file-audio" },
      { type: "FILLED_MAP", icon: "fa-solid fa-map" },
      { type: "PLAYER_HEAD", picture: "https://minecraft.wiki/images/Player_Head_%28S%29_JE2.png?6f81f" }
    ]
  }
] as Category[];

const selectedCategory = ref(categories[0]!.name as string);
const categoryItems = ref(categories[0]!.items as Item[]);

const recentlyViewedItems = computed(() => {
  return userStore.recentlyViewedItems
    .reverse()
    .map(i => ({
      type: i,
    })) as Item[];
});


function selectCategory(name: string) {
  if (name == "Recent") {
    selectedCategory.value = name;
    categoryItems.value = recentlyViewedItems.value;
    return;
  }

  let category = categories.find(c => c.name == name);
  if (category == null) return;

  selectedCategory.value = category.name;
  categoryItems.value = category.items;
}

</script>

<template>
  <div class="flex flex-col">
    <!-- Categories -->
    <div class="flex flex-row gap-1 mb-1">
      <div v-for="category in categories" class="item-button category"
        :class="{ 'active': selectedCategory == category.name }" @click="selectCategory(category.name)">
        <div class="text-2xl"><font-awesome-icon :icon="category.icon" /></div>
      </div>

      <div class="flex-grow"></div>

      <!-- Recent items -->
      <div class="item-button category" :class="{ 'active': selectedCategory == 'Recent' }"
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
        <!-- TODO: Router link -->
        <RouterLink v-for="item in categoryItems" :to="{ name: 'itemSales', params: { itemType: item.type } }"
          class="item-button" :title="formatItemType(item.type).toLocaleLowerCase()">

          <!-- Item icon/picture -->
          <div v-if="item.icon" class="text-xl">
            <font-awesome-icon :icon="item.icon" />
          </div>
          <div v-else-if="item.picture">
            <img :src="item.picture" class="w-6 h-6" />
          </div>

          <!-- Item name -->
          <div class="text-xs capitalize overflow-hidden text-ellipsis">
            {{ formatItemType(item.type).toLocaleLowerCase() }}
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
