<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatPotionEffect } from "@/utilities/potion-format";
import { computed } from "vue";

interface Props {
  recentSales: SaleSummary[];
  loading?: boolean;
}
const props = defineProps<Props>();

interface SaleRow {
  sale: SaleSummary;
  playerHeadPlayerName?: string;
  potionEffect?: string;
  customDiscSong?: string;
  writtenBookAuthor?: string;
  writtenBookPageCount?: string;
  paintingID?: string;
  paintingTitle?: string;
  paintingAuthor?: string;
  paintingOriginality?: string;
  enchantments: string[];
}

const sales = computed(() => {
  return props.recentSales.map(s => {
    let row = { sale: s, enchantments: [] } as SaleRow

    for (const attribute of s.itemAttributes) {
      if (attribute.key == "PLAYERHEAD_PLAYER_NAME") row.playerHeadPlayerName = attribute.value;
      else if (attribute.key.startsWith('ENCHANTMENT_')) {
        row.enchantments.push(formatEnchantment(`${attribute.key}_${attribute.value}`).toLocaleLowerCase());
      }
      else if (attribute.key == "POTION_EFFECT") {
        row.potionEffect = formatPotionEffect(attribute.value).toLocaleLowerCase();
      }
      else if (attribute.key == "CUSTOM_DISC_SONG") {
        row.customDiscSong = formatCustomDisc(attribute.value).toLocaleLowerCase();
      }
      else if (attribute.key == "WRITTEN_BOOK_AUTHOR") {
        row.writtenBookAuthor = attribute.value;
      }
      else if (attribute.key == "WRITTEN_BOOK_PAGE_COUNT") {
        row.writtenBookPageCount = attribute.value;
      }
      else if (attribute.key == "PAINTING_ID") {
        row.paintingID = attribute.value;
      }
      else if (attribute.key == "PAINTING_TITLE") {
        row.paintingTitle = attribute.value;
      }
      else if (attribute.key == "PAINTING_AUTHOR_NAME") {
        row.paintingAuthor = attribute.value;
      }
      else if (attribute.key == "PAINTING_ORIGINALITY") {
        row.paintingOriginality = attribute.value;
      }
    }

    return row;
  })
})
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
        <tr v-for="row in sales" class="stripped-row">
          <td class="table-item wrap-anywhere">
            <RouterLink :to="{ name: 'sale', params: { id: row.sale.id } }" class="hyperlink">
              {{ formatDate(row.sale.occurredAt) }}
            </RouterLink>
          </td>
          <td class="table-item" :title="row.sale.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="row.sale.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="row.sale.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </td>
          <td class="table-item" title="Enchanted">
            <font-awesome-icon icon="fa-solid fa-wand-sparkles" v-if="row.sale.isEnchanted" />
          </td>
          <td class="table-item wrap-anywhere">
            <div v-if="row.sale.customName" class="text-xs md:text-sm italic">
              {{ row.sale.customName }}
            </div>

            <div>
              <RouterLink :to="{ name: 'itemSales', params: { itemType: row.sale.itemType }, }" class="hyperlink">
                {{ formatItemType(row.sale.itemType) }}
              </RouterLink>
            </div>

            <div class="text-xs md:text-sm capitalize">
              <div v-if="row.playerHeadPlayerName">Player: {{ row.playerHeadPlayerName }}</div>
              <div v-if="row.potionEffect">{{ row.potionEffect }}</div>
              <div v-if="row.customDiscSong">{{ row.customDiscSong }}</div>
              <div v-if="row.writtenBookAuthor">Author: {{ row.writtenBookAuthor }}</div>
              <div v-if="row.writtenBookPageCount">Pages: {{ row.writtenBookPageCount }}</div>
              <div v-if="row.paintingTitle">
                Title: <RouterLink :to="{ name: 'painting', params: { id: row.paintingID }, }" class="hyperlink">
                  {{ row.paintingTitle }}
                </RouterLink>
                <span v-if="row.paintingOriginality"> ({{ row.paintingOriginality }})</span>
              </div>
              <div v-if="row.paintingAuthor">
                Author: <RouterLink :to="{ name: 'gallery', params: { authorName: row.paintingAuthor }, }"
                  class="hyperlink">
                  {{ row.paintingAuthor }}
                </RouterLink>
              </div>

              <div v-for="enchantment in row.enchantments">{{ enchantment }}</div>
            </div>
          </td>
          <td class="table-item">{{ row.sale.quantity }}</td>
          <td class="table-item">{{ row.sale.totalPrice }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && recentSales.length == 0" class="text-center p-2">No sales found</div>

    <Loading v-if="loading" :fill-space="true"></Loading>
  </div>
</template>
