<script setup lang="ts">
import type { SaleSummary } from "@/api/sales/saleSummary";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";
import { computed } from "vue";
import { normalisePrice, simpleNormalisedPrice, type NormalisedPrice } from "@/utilities/normalise-price";
import type { SNBTData } from "@/models/snbt";
import ItemAttributeDisplay from "./ItemAttributeDisplay.vue";

interface Props {
  recentSales: SaleSummary[];
  loading?: boolean;
}
const props = defineProps<Props>();

interface SaleRow {
  sale: SaleSummary;
  price: NormalisedPrice;
  parsedSNBT: SNBTData;
}

const sales = computed(() => {
  return props.recentSales.map((s) => {
    let row = {
      sale: s,
      enchantments: [],
      price: normalisePrice(s.totalPrice, s.quantity),
      parsedSNBT: { enchantments: [] },
    } as SaleRow;

    // Extract attributes
    for (const attribute of s.itemAttributes) {
      if (attribute.key == "PLAYERHEAD_PLAYER_NAME") row.parsedSNBT.playerHeadPlayerName = attribute.value;
      else if (attribute.key == "ENCHANTMENT") {
        row.parsedSNBT.enchantments.push(attribute.value);
      } else if (attribute.key == "POTION_EFFECT") {
        row.parsedSNBT.potionEffect = attribute.value;
      } else if (attribute.key == "CUSTOM_DISC_SONG") {
        row.parsedSNBT.customDiscSong = attribute.value;
      } else if (attribute.key == "WRITTEN_BOOK_TITLE") {
        row.parsedSNBT.writtenBookTitle = attribute.value;
      } else if (attribute.key == "WRITTEN_BOOK_AUTHOR") {
        row.parsedSNBT.writtenBookAuthor = attribute.value;
      } else if (attribute.key == "WRITTEN_BOOK_PAGE_COUNT") {
        row.parsedSNBT.writtenBookPageCount = attribute.value;
      } else if (attribute.key == "PAINTING_ID") {
        row.parsedSNBT.paintingID = attribute.value;
      } else if (attribute.key == "PAINTING_TITLE") {
        row.parsedSNBT.paintingTitle = attribute.value;
      } else if (attribute.key == "PAINTING_AUTHOR_NAME") {
        row.parsedSNBT.paintingAuthor = attribute.value;
      } else if (attribute.key == "PAINTING_ORIGINALITY") {
        row.parsedSNBT.paintingOriginality = attribute.value;
      }
    }

    return row;
  });
});
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

          <!-- Price columns -->
          <!-- Mobile -->
          <th class="table-item md:hidden text-center">Details</th>

          <!-- Desktop -->
          <th class="table-item hidden md:table-cell">Quantity</th>
          <th class="table-item hidden md:table-cell">Price</th>
          <th class="table-item hidden md:table-cell">Paid</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sales" class="stripped-row">
          <!-- Sale date -->
          <td class="table-item wrap-anywhere">
            <RouterLink :to="{ name: 'sale', params: { id: row.sale.id } }" class="hyperlink">
              {{ formatDate(row.sale.occurredAt) }}
            </RouterLink>
          </td>

          <!-- Sale type icon -->
          <td class="table-item" :title="row.sale.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="row.sale.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="row.sale.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </td>

          <!-- Is inside a shulker icon -->
          <td class="table-item" title="Inside Container">
            <font-awesome-icon icon="fa-solid fa-box-open" v-if="row.sale.insideContainer" />
          </td>

          <!-- Item details -->
          <td class="table-item wrap-anywhere">
            <!-- Custom name -->
            <div v-if="row.sale.customName" class="text-xs md:text-sm italic">
              {{ row.sale.customName }}
            </div>

            <!-- Item type -->
            <div>{{ formatItemType(row.sale.itemType) }}</div>

            <!-- Key attributes- enchantments, effects, etc. -->
            <ItemAttributeDisplay :snbt="row.parsedSNBT" class="text-xs md:text-sm capitalize mt-2"></ItemAttributeDisplay>

            <!-- Seller name -->
            <div v-if="row.sale.sellerUsername" class="hint-text mt-4">
              Sold by <RouterLink :to="{ name: 'shopOwnerView', params: { username: row.sale.sellerUsername } }" class="hyperlink">
                {{ row.sale.sellerUsername }}
              </RouterLink>
            </div>
          </td>

          <!-- Price columns -->
          <!-- Mobile -->
          <td class="table-item table-cell md:hidden">
            <div>Quantity:</div>
            <div class="mb-2">{{ row.sale.quantity }}</div>

            <div>Paid:</div>
            <div class="mb-2">{{ row.sale.totalPrice }}</div>

            <div class="text-nowrap">{{ simpleNormalisedPrice(row.price) }}</div>
          </td>

          <!-- Desktop -->
          <td class="table-item hidden md:table-cell">{{ row.sale.quantity }}</td>
          <td class="table-item hidden md:table-cell text-nowrap">
            <span class="hidden md:inline">
              {{ simpleNormalisedPrice(row.price) }}
            </span>
          </td>
          <td class="table-item hidden md:table-cell">{{ row.sale.totalPrice }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && recentSales.length == 0" class="text-center p-2">No sales found</div>

    <Loading v-if="loading" :fill-space="true"></Loading>
  </div>
</template>
