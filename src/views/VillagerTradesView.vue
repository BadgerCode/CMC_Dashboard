<script setup lang="ts">
import SearchBox from '@/components/SearchBox.vue';
import { itemsStore } from '@/store/items-state';
import { formatDate } from '@/utilities/date-format';
import { computed, ref } from 'vue';

const itemTypeFilter = ref("");

const trades = computed(() =>
  itemsStore.villagerTrades
    .filter(i => i.itemType.toLocaleLowerCase().includes(itemTypeFilter.value))
    .sort((a, b) => a.itemType.localeCompare(b.itemType))
);
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap justify-between items-end mb-8">
      <div class="pb-4">
        <h1 class="text-3xl font-bold">Villager Trades</h1>
        <p class="text-gray-300">Items that can be bought from the updated villagers.</p>
        <p>
          <a href="https://docs.callmecarson.live/books/smp-online/page/rebalanced-villager-trading" target="_blank"
            class="hyperlink">
            More info
          </a>
        </p>
      </div>
    </div>

    <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-start justify-between pb-4">
      <div class="text-gray-400">
        <div>{{ trades.length }} trades</div>
        <div class="hint-text">Last updated {{ formatDate(itemsStore.villagerTradesLastUpdated, "") }}</div>
      </div>

      <div>
        <SearchBox :placeholder="'Item Type'" v-model="itemTypeFilter"></SearchBox>
      </div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <th class="table-item">Item</th>
          <th class="table-item">Quantity</th>
          <th class="table-item">Price</th>
          <th class="table-item">Villager</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="trade in trades" class="stripped-row">
          <td class="table-item">
            <RouterLink
              :to="{ name: 'itemSales', params: { itemType: trade.itemType.replace(' ', '_').toLocaleUpperCase() } }"
              class="hyperlink">
              {{ trade.itemType }}
            </RouterLink>
          </td>
          <td class="table-item">{{ trade.quantity }}</td>
          <td class="table-item">{{ trade.price }} {{ trade.currency }}</td>
          <td class="table-item">{{ trade.villager }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
