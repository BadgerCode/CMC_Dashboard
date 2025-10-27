<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import { onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api"
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import { formatNumber } from "@/utilities/number-format";

interface Props {
  itemType: string
}
const props = defineProps<Props>()

const sales = ref([] as SaleSummary[]);
const averagePricePerItem = ref(null as number | null);
const averageItemsPerDiamond = ref(null as number | null);
const averagePricePerItemNoRenames = ref(null as number | null);
const averageItemsPerDiamondNoRenames = ref(null as number | null);

onMounted(async () => {
  if (!props.itemType) return;

  // Load sales data for the item type
  sales.value.push(...(await SalesAPI.loadSalesForItemType(props.itemType)));

  let totalPrice = sales.value.reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantity = sales.value.reduce((total, s) => total + s.quantity, 0);
  averagePricePerItem.value = totalPrice / totalQuantity;
  averageItemsPerDiamond.value = totalQuantity / totalPrice;

  let totalPriceNoRenames = sales.value.filter(s => s.isRenamed == false).reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantityNoRenames = sales.value.filter(s => s.isRenamed == false).reduce((total, s) => total + s.quantity, 0);
  averagePricePerItemNoRenames.value = totalPriceNoRenames / totalQuantityNoRenames;
  averageItemsPerDiamondNoRenames.value = totalQuantityNoRenames / totalPriceNoRenames;
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <h1 class="text-3xl font-bold">{{ itemType }} sales</h1>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Average Prices
      </h4>

      <div class="mb-6 text-gray-400">
        Based on {{ sales.length }} sales shown below.
      </div>

      <div>
        <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base mt-2">
          <tbody>
            <tr class="border-t border-gray-700">
              <td class="table-cell wrap-anywhere">
                <div>1 '{{ formatItemType(itemType) }}'</div>
              </td>
              <td>costs</td>
              <td class="table-cell wrap-anywhere">
                {{ formatNumber(averagePricePerItem, 4) }} diamond(s)
              </td>
            </tr>

            <tr class="border-t border-gray-700">
              <td class="table-cell wrap-anywhere">
                <div>1 diamond</div>
              </td>
              <td>gives</td>
              <td class="table-cell wrap-anywhere">
                {{ formatNumber(averageItemsPerDiamond, 4) }} '{{ formatItemType(itemType) }}'
              </td>
            </tr>

            <tr class="border-t border-gray-700">
              <td class="table-cell wrap-anywhere">
                <div>1 '{{ formatItemType(itemType) }}'</div>
                <div>(Excluding renamed items)</div>
              </td>
              <td>costs</td>
              <td class="table-cell wrap-anywhere">
                {{ formatNumber(averagePricePerItemNoRenames, 4) }} diamond(s)
              </td>
            </tr>

            <tr class="border-t border-gray-700">
              <td class="table-cell wrap-anywhere">
                <div>1 diamond</div>
                <div>(Excluding renamed items)</div>
              </td>
              <td>gives</td>
              <td class="table-cell wrap-anywhere">
                {{ formatNumber(averageItemsPerDiamondNoRenames, 4) }} '{{ formatItemType(itemType) }}'
              </td>
            </tr>
          </tbody>
        </table>
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
