<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
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
const lastItemDate = ref(null as string | null);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadSales();
});

async function loadSales() {
  if (noMoreResults.value) return;

  let url =
    `${Config.APIURL}/api/sales/recent?` +
    (lastItemDate.value != null ? `before=${lastItemDate.value}` : "");

  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve recent sales");

  let response = await httpResponse.json();
  recentSales.value.push(...response.items);

  if (recentSales.value.length != 0)
    lastItemDate.value = recentSales.value.slice(-1)[0]!.occurredAt;

  noMoreResults.value = response.items.length === 0;
}

async function loadNextPage() {
  await loadSales();
}
</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Recent Sales</h1>
    <p class="text-gray-300">
      Sales and auctions that have taken place on the server
    </p>
  </div>

  <div class="relative overflow-x-auto">
    <table
      class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base"
    >
      <thead class="text-white">
        <tr>
          <th class="p-4">Time</th>
          <th class="p-4">Type</th>
          <th class="p-4">Item</th>
          <th class="p-4">
            <span class="hidden md:inline">Quantity</span
            ><span class="md:hidden">#</span>
          </th>
          <th class="p-4">
            <span class="hidden md:inline">Price</span
            ><span class="md:hidden">$</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in recentSales" class="border-t border-gray-700">
          <td class="p-4 text-wrap">{{ formatDate(sale.occurredAt) }}</td>
          <td class="p-4">{{ sale.type }}</td>
          <td class="p-4 break-all">{{ sale.itemType }}</td>
          <td class="p-4">{{ sale.quantity }}</td>
          <td class="p-4">{{ sale.totalPrice }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mt-8 text-center">
    <button
      type="button"
      class="button"
      v-on:click="loadNextPage"
      v-if="!noMoreResults"
    >
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>
