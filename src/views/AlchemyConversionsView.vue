<script setup lang="ts">
import SearchBox from "@/components/SearchBox.vue";
import { itemsStore } from "@/store/items-state";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { computed, ref } from "vue";

const itemTypeFilter = ref("");

const conversions = computed(() =>
  Object.keys(itemsStore.alchemyConversions)
    .map((itemType) => ({ itemType: itemType, conversion: itemsStore.alchemyConversions[itemType] }))
    .filter((i) => i.itemType.toLocaleLowerCase().includes(itemTypeFilter.value))
    .sort((a, b) => a.itemType.localeCompare(b.itemType)),
);
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap justify-between items-end mb-8">
      <div class="pb-4">
        <h1 class="text-3xl font-bold">Alchemy Conversions</h1>
        <p class="text-gray-300">Using a cauldron on top of a magma block, you can convert items into other items.</p>
        <p class="text-xs">
          <a href="https://docs.callmecarson.live/books/smp-online/page/cauldron-alchemy" target="_blank" class="hyperlink"> More info </a>
        </p>
      </div>
    </div>

    <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-start justify-between pb-4">
      <div class="text-gray-400">
        <div>{{ conversions.length }} conversions</div>
        <div class="hint-text">Last updated {{ formatDate(itemsStore.alchemyConversionsLastUpdated, "") }}</div>
      </div>

      <div>
        <SearchBox :placeholder="'Item Type'" v-model="itemTypeFilter"></SearchBox>
      </div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <th class="table-item">Item</th>
          <th class="table-item">Created By</th>
          <th class="table-item">Creates</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in conversions" class="stripped-row">
          <td class="table-item">
            <RouterLink :to="{ name: 'itemSales', params: { itemType: item.itemType.toLocaleUpperCase() } }" class="hyperlink">
              {{ formatItemType(item.itemType) }}
            </RouterLink>
          </td>

          <td class="table-item">
            <div v-for="conversion in item.conversion?.createdBy" class="mb-2">
              <span class="capitalize">{{ conversion.sourceQuantity }} {{ formatItemType(conversion.source) }}</span>
              <span v-if="conversion.targetQuantity > 1"> (creates {{ conversion.targetQuantity }})</span>
            </div>
          </td>

          <td class="table-item">
            <div v-if="item.conversion?.creates">
              <span class="capitalize">
                {{ item.conversion.creates.targetQuantity }} {{ formatItemType(item.conversion.creates.target) }}
              </span>
              <span v-if="item.conversion.creates.sourceQuantity > 1">
                (costs {{ item.conversion.creates.sourceQuantity }})
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
