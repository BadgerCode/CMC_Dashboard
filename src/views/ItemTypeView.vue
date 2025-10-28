<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api"
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import { formatNumber } from "@/utilities/number-format";
import { normalisePrice, type NormalisedPrice } from "@/utilities/normalise-price";

interface Props {
  itemType: string
}
const props = defineProps<Props>()

const sales = ref([] as SaleSummary[]);
const averagePrice = ref(null as NormalisedPrice | null);
const averagePriceNoRenames = ref(null as NormalisedPrice | null);

onMounted(async () => {
  if (!props.itemType) return;

  // Load sales data for the item type
  sales.value.push(...(await SalesAPI.loadSalesForItemType(props.itemType)));

  // Calculate average price
  let totalPrice = sales.value.reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantity = sales.value.reduce((total, s) => total + s.quantity, 0);
  averagePrice.value = normalisePrice(totalPrice, totalQuantity);

  // Calculate average price without renamed items
  let totalPriceNoRenames = sales.value.filter(s => s.isRenamed == false).reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantityNoRenames = sales.value.filter(s => s.isRenamed == false).reduce((total, s) => total + s.quantity, 0);
  averagePriceNoRenames.value = normalisePrice(totalPriceNoRenames, totalQuantityNoRenames);
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <h1 class="text-3xl font-bold">{{ itemType }}</h1>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Average Prices
      </h4>

      <div>
        <div class="text-gray-400">Based on {{ sales.length }} sales shown below.</div>
        <div>
          <span>{{ formatNumber(averagePrice?.quantity, 2) }} '{{ formatItemType(itemType) }}' </span>
          <span>is worth </span>
          <span>{{ formatNumber(averagePrice?.price, 2) }} diamond(s)</span>
        </div>

        <div class="text-gray-400 mt-4">Excluding renamed items</div>
        <div>
          <span>{{ formatNumber(averagePriceNoRenames?.quantity, 2) }} '{{ formatItemType(itemType) }}' </span>
          <span>is worth </span>
          <span>{{ formatNumber(averagePriceNoRenames?.price, 2) }} diamond(s)</span>
        </div>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Sales of {{ formatItemType(itemType) }}
      </h4>

      <div class="mb-3 font-normal text-gray-400">
        <RecentSales :recent-sales="sales"></RecentSales>
      </div>
    </div>
  </div>
</template>
