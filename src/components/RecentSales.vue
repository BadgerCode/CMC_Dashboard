<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";

interface Props {
  recentSales: SaleSummary[];
  loading?: boolean;
}
defineProps<Props>();
</script>

<template>
  <div class="relative overflow-x-auto shadow-md">
    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <th class="table-item">Time</th>
          <th></th>
          <th></th>
          <th class="table-item">Item</th>
          <th class="table-item"><span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span></th>
          <th class="table-item"><span class="hidden md:inline">Price</span><span class="md:hidden">$</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in recentSales" class="stripped-row">
          <td class="table-item wrap-anywhere">
            <RouterLink :to="{ name: 'sale', params: { id: sale.id } }" class="hyperlink">
              {{ formatDate(sale.occurredAt) }}
            </RouterLink>
          </td>
          <td class="table-item" :title="sale.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="sale.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="sale.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </td>
          <td class="table-item" title="Enchanted">
            <font-awesome-icon icon="fa-solid fa-wand-sparkles" v-if="sale.isEnchanted" />
          </td>
          <td class="table-item wrap-anywhere">
            <div>
              {{ formatItemType(sale.itemType) }}
            </div>

            <div v-if="sale.customName" class="text-xs md:text-sm">
              {{ sale.customName }}
            </div>
          </td>
          <td class="table-item">{{ sale.quantity }}</td>
          <td class="table-item">{{ sale.totalPrice }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="recentSales.length == 0" class="text-center p-2">No sales found</div>

    <Loading v-if="loading" :fill-space="true"></Loading>
  </div>
</template>
