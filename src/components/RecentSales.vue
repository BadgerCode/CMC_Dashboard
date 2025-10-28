<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";

interface Props {
  recentSales: SaleSummary[]
}
defineProps<Props>()
</script>

<template>
  <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
    <thead class="text-white">
      <tr>
        <th class="table-cell">Time</th>
        <th></th>
        <th></th>
        <th></th>
        <th class="table-cell">Item</th>
        <th class="table-cell">
          <span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span>
        </th>
        <th class="table-cell">
          <span class="hidden md:inline">Price</span><span class="md:hidden">$</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="sale in recentSales" class="border-t border-gray-700">
        <td class="table-cell wrap-anywhere">{{ formatDate(sale.occurredAt) }}</td>
        <td class="table-cell" :title="sale.type">
          <font-awesome-icon icon="fa-solid fa-shop" v-if="sale.type == 'Shop'" />
          <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="sale.type == 'Auction'" />
          <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
        </td>
        <td class="table-cell" title="Custom name">
          <font-awesome-icon icon="fa-solid fa-quote-left" v-if="sale.isRenamed" />
        </td>
        <td class="table-cell" title="Enchanted">
          <font-awesome-icon icon="fa-solid fa-wand-sparkles" v-if="sale.isEnchanted" />
        </td>
        <td class="table-cell wrap-anywhere">
          <RouterLink :to="{ name: 'sale', params: { id: sale.id } }" class="text-blue-500 hover:underline">
            {{ formatItemType(sale.itemType) }}
          </RouterLink>
        </td>
        <td class="table-cell">{{ sale.quantity }}</td>
        <td class="table-cell">{{ sale.totalPrice }}</td>
      </tr>
    </tbody>
  </table>
</template>
