<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api"
import RecentSales from "@/components/RecentSales.vue";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";

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
  <div class="mb-8 flex flex-row justify-between items-end">
    <div>
      <h1 class="text-3xl font-bold">Recent Transactions</h1>
      <p class="text-gray-300">Shops and auctions</p>
    </div>
    <div class="text-right">
      <ItemTypeSearch></ItemTypeSearch>
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
