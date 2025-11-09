<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import { formatNumber } from "@/utilities/number-format";
import { normalisePrice } from "@/utilities/normalise-price";
import type { ShopData } from "@/api/shops/shopdata";
import { computed, ref } from "vue";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatPotionEffect } from "@/utilities/potion-format";

interface Props {
  shops: ShopData[],
}
const props = defineProps<Props>();
const maxShops = 100;

const paginatedShops = computed(() => applySort(props.shops).slice(0, Math.min(maxShops, props.shops.length)));

function getNormalisedPrice(shop: ShopData) {
  let price = normalisePrice(shop.price, shop.item.quantity);
  return `${formatNumber(price.quantity, 2)} for ${formatNumber(price.price, 2)} 💎`;
}

// Sorting
let sortProperty = ref("");
let sortAscending = ref(false);
function sort(property: string, ascendingByDefault: boolean) {
  if (sortProperty.value == property) sortAscending.value = !sortAscending.value;
  else {
    sortProperty.value = property;
    sortAscending.value = ascendingByDefault;
  }
}

function applySort(items: ShopData[]) {
  items.sort((a, b) => {
    let first = sortAscending.value ? a : b;
    let second = sortAscending.value ? b : a;

    let sortResult = 0;
    if (sortProperty.value == "price") sortResult = first.item.quantity / first.price - second.item.quantity / second.price;

    return sortResult || first.id - second.id;
  });

  return items;
}
</script>

<template>
  <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
    <thead class="table-head">
      <tr>
        <!-- Basic details -->
        <th class="table-item text-center">
          <font-awesome-icon icon="fa-solid fa-arrows-left-right" />
        </th>
        <th class="table-item text-center">Item</th>

        <!-- Price columns -->
        <!-- Mobile -->
        <th class="table-item md:hidden text-center">
          <span>Price &amp; Stock</span>
          <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
            @click="sort('price', false)" />
        </th>

        <!-- Desktop -->
        <th class="table-item hidden md:table-cell">
          <span>Price</span>
          <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
            @click="sort('price', false)" />
        </th>
        <th class="table-item hidden md:table-cell pr-4">Min<br />Buy</th>
        <th class="table-item hidden md:table-cell">Stock</th>

        <!-- Location -->
        <th class="table-item text-center">
          <font-awesome-icon icon="fa-solid fa-globe" />
        </th>

        <!-- Owner -->
        <th class="table-item hidden md:table-cell">Owner</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="shop in paginatedShops" class="stripped-row">
        <td class="table-item">THEY {{ shop.type.replace(/ING/g, "") }}</td>

        <!-- Item name & key attributes -->
        <td class="table-item wrap-anywhere">
          <div class="text-white">
            {{ shop.item.name }}
          </div>

          <div class="text-xs md:text-sm">
            {{ formatItemType(shop.item.type) }}
          </div>

          <div class="text-xs md:text-sm capitalize" v-if="shop.item.parsedSNBT.potionEffect">
            {{ formatPotionEffect(shop.item.parsedSNBT.potionEffect) }}
          </div>

          <div class="text-xs md:text-sm" v-if="shop.item.parsedSNBT.paintingName">
            {{ shop.item.parsedSNBT.paintingName }}
          </div>

          <div class="text-xs md:text-sm capitalize" v-for="enchantment in shop.item.parsedSNBT.enchantments">
            {{ formatEnchantment(enchantment) }}
          </div>
        </td>

        <!-- Price columns -->
        <!-- Mobile -->
        <td class="table-item table-cell md:hidden">
          <div class="text-nowrap">{{ getNormalisedPrice(shop) }}</div>
          <div class="mt-2">Min buy:</div>
          <div>{{ shop.item.quantity }}</div>
          <div class="mt-2">Stock:</div>
          <div>x{{ shop.remaining }}</div>
        </td>

        <!-- Desktop -->
        <td class="table-item hidden md:table-cell">{{ getNormalisedPrice(shop) }}</td>
        <td class="table-item hidden md:table-cell">{{ shop.item.quantity }}</td>
        <td class="table-item hidden md:table-cell">x {{ shop.remaining }}</td>

        <!-- Location -->
        <td class="table-item">
          <div class="block md:inline mr-1">{{ `${shop.location.x},` }}</div>
          <div class="block md:inline mr-1">{{ `${shop.location.y},` }}</div>
          <div class="block md:inline mr-1">{{ shop.location.z }}</div>
          <div>({{ shop.location.world }})</div>

          <div v-for="waystone in shop.nearestWaystones" class="text-xs mt-2">
            <div>
              {{ waystone.distance }} blocks
              <font-awesome-icon icon="fa-solid fa-arrow-up"
                :style="{ transform: 'rotate(' + waystone.directionRotation + 'deg)' }" /> of
            </div>
            <div>'{{ waystone.name }}'</div>
          </div>
        </td>

        <!-- Owner -->
        <td class="table-item hidden md:table-cell wrap-anywhere">{{ shop.owner.name }}</td>
      </tr>
    </tbody>
  </table>
</template>
