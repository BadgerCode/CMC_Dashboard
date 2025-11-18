<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import RecentSales from "@/components/RecentSales.vue";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";
import { getSpecialItems } from "@/utilities/item-info";

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
  <div class="mb-8 flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold">Item Lookup</h1>
      <div class="text-gray-300">See sales and shops for an item</div>
    </div>

    <div class="flex flex-row items-center justify-center">
      <ItemTypeSearch
        @selection="(itemType) => { if (itemType) $router.push({ name: 'itemSales', params: { itemType: itemType } }) }">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="mb-8">
    <div class="mb-3 flex flex-row justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold">Special Items</h1>
      </div>
    </div>

    <div class="flex flex-row flex-wrap gap-2 md:gap-3">
      <RouterLink v-for="item in getSpecialItems()" :to="{ name: 'itemSales', params: { itemType: item.itemType } }">
        <div
          class="p-1 w-20 h-20 gap-1 md:p-3 md:w-27 md:h-27 md:gap-2 bg-gray-800 flex flex-col items-center text-center justify-center text-gray-300 border-1 border-gray-700 rounded-lg">
          <div class="text-xl md:text-3xl"><font-awesome-icon :icon="item.icon" /></div>
          <div class="text-xs md:text-sm">{{ item.displayName }}</div>
        </div>
      </RouterLink>
    </div>
  </div>

  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Latest Sales</h1>
      <p class="text-gray-300">Shops and auctions</p>
    </div>
  </div>

  <div class="relative overflow-x-auto">
    <RecentSales :recent-sales="recentSales" :loading="loading"></RecentSales>
  </div>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
    <div v-else>No more results</div>
  </div>
</template>
