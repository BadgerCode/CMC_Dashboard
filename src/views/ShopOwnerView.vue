<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, onUnmounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import RecentSales from "@/components/RecentSales.vue";

interface Props {
  username: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const recentSales = ref([] as SaleSummary[]);
const noMoreResults = ref(false);

let intervalID: number | null = null;

onMounted(async () => {
  await loadSales();
  intervalID = window.setInterval(loadNewSales, 30000);
});

onUnmounted(() => {
  if (intervalID) {
    clearInterval(intervalID);
  }
});

async function loadNextPage() {
  await loadSales();
}

async function loadNewSales() {
  if (recentSales.value.length === 0) return;

  let newSales = await SalesAPI.loadSales({
    shopOwner: props.username,
    afterDate: recentSales.value[0]?.occurredAt,
  } as SalesAPI.SalesFilters);

  // Prepend new sales to the list
  recentSales.value.unshift(...newSales);
}

async function loadSales() {
  if (noMoreResults.value) return;

  let newSales = await SalesAPI.loadSales({ shopOwner: props.username, lastItem: recentSales.value.slice(-1)[0] } as SalesAPI.SalesFilters);

  recentSales.value.push(...newSales);
  noMoreResults.value = newSales.length === 0;
  loading.value = false;
}
</script>

<template>
  <div class="mb-8 flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold">{{ username }}'s Shops</h1>
    </div>
  </div>

  <!-- TODO: Show shops -->

  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Latest Sales</h1>
    </div>
  </div>

  <!-- TODO: Filters -->

  <div class="relative overflow-x-auto">
    <RecentSales :recent-sales="recentSales" :loading="loading"></RecentSales>
  </div>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
    <div v-else>No more results</div>
  </div>
</template>
