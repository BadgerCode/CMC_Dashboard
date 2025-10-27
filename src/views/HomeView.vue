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
          <th></th>
          <th class="table-cell">Time</th>
          <th></th>
          <th></th>
          <th class="table-cell">Item</th>
          <th class="table-cell">
            <span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span>
          </th>
          <th class="table-cell">
            <span class="hidden md:inline">Price</span><span class="md:hidden">$</span>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in recentSales" class="border-t border-gray-700">
          <td class="table-cell" :title="sale.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="sale.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="sale.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </td>
          <td class="table-cell wrap-anywhere">{{ formatDate(sale.occurredAt) }}</td>
          <td class="table-cell" title="Custom name">
            <font-awesome-icon icon="fa-solid fa-quote-left" v-if="sale.isRenamed" />
          </td>
          <td class="table-cell" title="Enchanted">
            <font-awesome-icon icon="fa-solid fa-wand-sparkles" v-if="sale.isEnchanted" />
          </td>
          <td class="table-cell wrap-anywhere"><span>{{ formatItemType(sale.itemType) }}</span></td>
          <td class="table-cell">{{ sale.quantity }}</td>
          <td class="table-cell">{{ sale.totalPrice }}</td>
          <td class="table-cell">
            <RouterLink :to="{ name: 'sale', params: { id: sale.id } }" tag="button" class="button">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
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
