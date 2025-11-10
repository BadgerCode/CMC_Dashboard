<script setup lang="ts">
import { updateShops } from "@/api/shops/api";
import type { ShopData } from "@/api/shops/shopdata";
import { computed, onMounted, ref, watch } from "vue";
import ShopsList from "./ShopsList.vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "./RecentSales.vue";
import SearchBox from "./SearchBox.vue";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";

const itemDescriptions = {
  PLAYER_HEAD: "Heads of various players. Some have additional functionality through Figura.",
} as { [itemType: string]: string };

interface Props {
  itemType: string;
  sales: SaleSummary[];
}
const props = defineProps<Props>();

const loading = ref(true);
const shops = ref([] as ShopData[]);
const filteredShops = ref([] as ShopData[]);

// Name filter
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  applyFilters();
});

onMounted(async () => {
  // Load shop data
  let shopData = await updateShops();
  shops.value = shopData.shops.filter((s) => s.item.type == props.itemType && s.type == "SELLING");
  filteredShops.value = shops.value;
  loading.value = false;
});

const description = computed(() => {
  return itemDescriptions[props.itemType];
});

function applyFilters() {
  filteredShops.value = shops.value.filter((s) => {
    // Apply name filter
    let trimmedNameFilter = nameFilter.value.trim().toLocaleLowerCase();
    if (trimmedNameFilter.length > 0 && !s.item.name.toLocaleLowerCase().includes(trimmedNameFilter)) return false;

    return true;
  });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold capitalize">{{ formatItemType(itemType)?.toLocaleLowerCase() }}</h1>
        <p class="text-gray-300" v-if="description">{{ description }}</p>
      </div>
    </div>

    <!-- Recent sales (include player head player name & custom name) -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <h2 class="text-2xl font-bold">Recent Sales</h2>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <!-- TODO: Show player head player name as an additional column -->
        <Loading v-if="loading" :loader-type="'text'"></Loading>
        <RecentSales v-else :recent-sales="sales"></RecentSales>
      </div>
    </div>

    <!-- Top selling player heads (include player head player name & custom name) -->
    <!-- <div>
      <div>
        <h2 class="text-2xl font-bold">Top Selling</h2>
      </div>
    </div> -->

    <!-- Player heads for sale (include custom name) -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-bold">Shops</h2>
          <p class="text-gray-300 capitalize">Selling {{ formatItemType(itemType)?.toLocaleLowerCase() }}</p>
        </div>

        <div>
          <SearchBox :placeholder="'Item Name'" v-model="nameFilter"></SearchBox>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <Loading v-if="loading" :loader-type="'text'"></Loading>
        <ShopsList v-else :shops="filteredShops" :hide-buy-sell="true"></ShopsList>
      </div>
    </div>
  </div>
</template>
