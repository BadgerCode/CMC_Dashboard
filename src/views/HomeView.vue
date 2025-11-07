<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import RecentSales from "@/components/RecentSales.vue";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";

interface SpecialItem {
  itemType: string;
  displayName: string;
  icon: string;
}

const specialItems = [
  {
    itemType: "CUSTOM_MUSIC_DISC",
    displayName: "Custom Music Discs",
    icon: "fa-solid fa-record-vinyl",
  },
  {
    itemType: "ENCHANTED_BOOK",
    displayName: "Enchanted Books",
    icon: "fa-solid fa-book-bookmark",
  },
  {
    itemType: "POTION",
    displayName: "Potions",
    icon: "fa-solid fa-flask",
  },
  {
    itemType: "SPLASH_POTION",
    displayName: "Splash Potions",
    icon: "fa-solid fa-flask",
  },
  {
    itemType: "LINGERING_POTION",
    displayName: "Lingering Potions",
    icon: "fa-solid fa-flask",
  },
  {
    itemType: "WAYSTONE",
    displayName: "Waystones",
    icon: "fa-solid fa-chess-rook",
  },
] as SpecialItem[];

const loading = ref(true);
const recentSales = ref([] as SaleSummary[]);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadSales();
});

async function loadNextPage() {
  await loadSales();
}

async function loadSales() {
  if (noMoreResults.value) return;

  let lastItem = recentSales.value.slice(-1)[0];

  let newSales = await SalesAPI.loadSales(lastItem);

  recentSales.value.push(...newSales);
  noMoreResults.value = newSales.length === 0;
  loading.value = false;
}
</script>

<template>
  <div class="mb-8">
    <div class="mb-3 flex flex-row justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold">Special Items</h1>
      </div>
    </div>

    <div class="flex flex-row flex-wrap gap-2 md:gap-5">
      <RouterLink v-for="item in specialItems" :to="{ name: 'itemSales', params: { itemType: item.itemType }, }">
        <div
          class="p-1 w-20 h-20 gap-1 md:p-3 md:w-25 md:h-25 md:gap-2 bg-gray-800 flex flex-col items-center text-center justify-start text-gray-300 border-1 border-gray-700 rounded-lg">
          <div class="text-xl md:text-3xl"><font-awesome-icon :icon="item.icon" /></div>
          <div class="text-xs md:text-sm">{{ item.displayName }}</div>
        </div>
      </RouterLink>
    </div>
  </div>

  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Recent Transactions</h1>
      <p class="text-gray-300">Shops and auctions</p>
    </div>

    <div class="text-right pb-4">
      <ItemTypeSearch @selection="itemType => $router.push({ name: 'itemSales', params: { itemType: itemType } })">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="relative overflow-x-auto">
    <RecentSales :recent-sales="recentSales" :loading="loading"></RecentSales>
  </div>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>
