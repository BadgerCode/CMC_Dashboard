<script setup lang="ts">
import { updateShops } from "@/api/shops/api";
import type { ShopData } from "@/api/shops/shopdata";
import { onMounted, ref, watch } from "vue";
import ShopsList from "./ShopsList.vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "./RecentSales.vue";
import SearchBox from "./SearchBox.vue";

interface Props {
  itemType: string;
  sales: SaleSummary[];
}
const props = defineProps<Props>();

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
  shops.value = shopData.shops.filter((s) => s.item.type == props.itemType);
  filteredShops.value = shops.value;
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
        <h1 class="text-3xl font-bold">Player Heads</h1>
        <p class="text-gray-300">Heads of various players. Some have additional functionality through Figura.</p>
      </div>
    </div>

    <!-- Recent sales (include player head player name & custom name) -->
    <div>
      <div>
        <h2 class="text-2xl font-bold">Recent Sales</h2>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <!-- TODO: Show player head player name as an additional column -->
        <RecentSales :recent-sales="sales"></RecentSales>
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
      <div>
        <h2 class="text-2xl font-bold">Shops</h2>
      </div>

      <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
        <div class="flex flex-row flex-wrap gap-1"></div>

        <div>
          <SearchBox :placeholder="'Item Name'" v-model="nameFilter"></SearchBox>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <ShopsList :shops="filteredShops"></ShopsList>
      </div>
    </div>
  </div>
</template>
