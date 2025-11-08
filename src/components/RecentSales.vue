<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";

interface Props {
  recentSales: SaleSummary[],
  loading?: boolean
}
defineProps<Props>()
</script>

<template>
  <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
    <thead class="table-head">
      <tr>
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
      </tr>
    </thead>
    <tbody>
      <tr v-for="sale in recentSales" class="stripped-row">
        <td class="table-cell wrap-anywhere">{{ formatDate(sale.occurredAt) }}</td>
        <td class="table-cell" :title="sale.type">
          <font-awesome-icon icon="fa-solid fa-shop" v-if="sale.type == 'Shop'" />
          <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="sale.type == 'Auction'" />
          <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
        </td>
        <td class="table-cell" title="Enchanted">
          <font-awesome-icon icon="fa-solid fa-wand-sparkles" v-if="sale.isEnchanted" />
        </td>
        <td class="table-cell wrap-anywhere">
          <div>
            <RouterLink :to="{ name: 'sale', params: { id: sale.id } }" class="hyperlink">
              {{ formatItemType(sale.itemType) }}
            </RouterLink>
          </div>

          <div v-if="sale.customName" class="text-xs md:text-sm">
            {{ sale.customName }}
          </div>
        </td>
        <td class="table-cell">{{ sale.quantity }}</td>
        <td class="table-cell">{{ sale.totalPrice }}</td>
      </tr>
    </tbody>
  </table>

  <Loading v-if="loading" :fill-space="true"></Loading>
</template>
