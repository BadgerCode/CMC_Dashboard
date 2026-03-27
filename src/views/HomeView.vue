<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import RecentSales from "@/components/RecentSales.vue";
import { serverStore } from "@/store/server-state";
import { formatNumber } from "@/utilities/number-format";
import ItemTypeCategories from "@/components/ItemTypeCategories.vue";

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

  let newSales = await SalesAPI.loadSales({ lastItem: recentSales.value.slice(-1)[0] } as SalesAPI.SalesFilters);

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

    <!-- Item type selector -->
    <ItemTypeCategories></ItemTypeCategories>
  </div>

  <div class="mb-8">
    <div class="mb-3 flex flex-row justify-between items-end">
      <h1 class="text-3xl font-bold">Villager Trades</h1>
    </div>

    <div>
      <p class="text-gray-300">Villagers have been updated to sell more items.</p>
      <RouterLink :to="{ name: 'villagerTrades' }" class="hyperlink">See all trades</RouterLink>
    </div>
  </div>

  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Latest Sales</h1>
      <p class="text-gray-300">Shops and auctions</p>
      <p class="hint-text" v-if="serverStore.loaded">{{ formatNumber(serverStore.numSales, 0) }} total sales</p>
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
