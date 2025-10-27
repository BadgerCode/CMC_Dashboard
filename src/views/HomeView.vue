<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { onMounted, ref } from "vue";

interface RecentSale {
  occurredAt: string;
  id: string;
  type: string;
  itemType: string;
  quantity: number;
  totalPrice: number;
  isRenamed: boolean;
  isEnchanted: boolean;
}

const recentSales = ref([] as RecentSale[]);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadSales();
});

async function loadSales() {
  if (noMoreResults.value) return;

  let lastItem = recentSales.value.slice(-1)[0];

  let url =
    `${Config.APIURL}/api/sales?` +
    (lastItem != null
      ? `before=${lastItem.occurredAt}&lastID=${lastItem.id}`
      : "");

  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve recent sales");

  let response = await httpResponse.json();
  recentSales.value.push(...response.items);

  noMoreResults.value = response.items.length === 0;
}

async function loadNextPage() {
  await loadSales();
}
</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Recent Transactions</h1>
    <p class="text-gray-300">Shops and auctions</p>
  </div>

  <div class="relative overflow-x-auto">
    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="text-white">
        <tr>
          <th class="p-4">Time</th>
          <th class="p-4">Type</th>
          <th class="p-4">Item</th>
          <th class="p-4">
            <span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span>
          </th>
          <th class="p-4">
            <span class="hidden md:inline">Price</span><span class="md:hidden">$</span>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in recentSales" class="border-t border-gray-700">
          <td class="p-4 text-wrap">{{ formatDate(sale.occurredAt) }}</td>
          <td class="p-4">{{ sale.type }}</td>
          <td class="p-4 break-all">{{ formatItemType(sale.itemType) }}</td>
          <td class="p-4">{{ sale.quantity }}</td>
          <td class="p-4">{{ sale.totalPrice }}</td>
          <td class="p-4">
            <RouterLink :to="{ name: 'sale', params: { id: sale.id } }" tag="button" class="button">
              View
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mt-8 text-center">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>
