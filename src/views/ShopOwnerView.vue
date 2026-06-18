<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, onUnmounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import RecentSales from "@/components/RecentSales.vue";
import ShopsList from "@/components/ShopsList.vue";
import type { ShopData } from "@/api/shops/shopdata";
import { updateShops } from "@/api/shops/api";
import type { ShopOverview } from "@/store/shops-state";

interface Props {
  username: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const shopData = ref(null as ShopOverview | null);
const filteredShops = ref([] as ShopData[]);
const recentSales = ref([] as SaleSummary[]);
const noMoreResults = ref(false);

let intervalID: number | null = null;

onMounted(async () => {
  // Load shop data
  shopData.value = await updateShops();
  filteredShops.value = shopData.value.shops.filter((s) => s.owner.name == props.username);

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
  <div class="flex flex-col mb-2 gap-2">
    <RouterLink :to="{ name: 'shops' }" class="hyperlink">Back to all shops</RouterLink>
  </div>

  <div class="mb-8 flex flex-col">
    <h1 class="text-3xl font-bold">{{ username }}'s Shops & Sale History</h1>
  </div>


  <!-- Shops list -->

  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h2 class="text-2xl font-bold">Shops</h2>
    </div>
  </div>

  <ShopsList :shops="filteredShops" :loading="loading"></ShopsList>


  <!-- Sale history -->
  <div class="flex flex-row flex-wrap justify-between items-end">
    <div class="pb-4">
      <h2 class="text-2xl font-bold">Latest Sales</h2>
      <p class="hint-text mt-2">Note: Sales before 18th June 2026 will be missing if the shop no longer exists.</p>
    </div>
  </div>

  <!-- TODO: Filters -->

  <div class="relative overflow-x-auto">
    <RecentSales :recent-sales="recentSales" :loading="loading"></RecentSales>
  </div>

  <div class="mt-8 text-center" v-if="!loading && recentSales.length > 0">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
    <div v-else>No more results</div>
  </div>
</template>
