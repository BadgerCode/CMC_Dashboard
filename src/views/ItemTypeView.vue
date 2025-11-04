<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import { computed, onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import { formatNumber } from "@/utilities/number-format";
import {
  normalisePrice,
  type NormalisedPrice,
} from "@/utilities/normalise-price";
import { useRoute } from "vue-router";
import { Config } from "@/config";
import EnchantmentFilter from "@/components/EnchantmentFilter.vue";
import { formatEnchantment } from "@/utilities/enchantment-format";
import MusicDiscFilter from "@/components/MusicDiscFilter.vue";
import type { SalesFilters } from "@/api/sales/api";
import PotionFilter from "@/components/PotionFilter.vue";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();
const route = useRoute();

const attributeFilters = ref({} as SalesFilters);
const sales = ref([] as SaleSummary[]);

// Extra item data
const enchantments = ref([] as string[]);
const potionEffects = ref([] as string[]);
const customDiscs = ref([] as string[]);

// Average prices
const averagePrice = ref(null as NormalisedPrice | null);
const averagePriceNoRenames = ref(null as NormalisedPrice | null);

onMounted(async () => {
  if (!props.itemType) return;

  // Filters
  attributeFilters.value.enchantment = route.query["enchantment"]?.toString();
  attributeFilters.value.customDisc = route.query["discName"]?.toString();
  attributeFilters.value.potionEffect = route.query["potionEffect"]?.toString();

  // Load sales data for the item type
  sales.value.push(
    ...(await SalesAPI.loadSalesForItemType(
      props.itemType,
      attributeFilters.value
    ))
  );

  // Enchantments
  enchantments.value.push(...(await loadEnchantments()));

  // Custom music discs
  if (props.itemType == "CUSTOM_MUSIC_DISC")
    customDiscs.value.push(...(await loadDiscs()));

  // Potion effects
  let isPotion =
    ["POTION", "SPLASH_POTION", "LINGERING_POTION"].indexOf(props.itemType) !=
    -1;
  if (isPotion) potionEffects.value.push(...(await loadPotions()));

  // Calculate average price
  let totalPrice = sales.value.reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantity = sales.value.reduce((total, s) => total + s.quantity, 0);
  averagePrice.value = normalisePrice(totalPrice, totalQuantity);

  // Calculate average price without renamed items
  let totalPriceNoRenames = sales.value
    .filter((s) => s.isRenamed == false)
    .reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantityNoRenames = sales.value
    .filter((s) => s.isRenamed == false)
    .reduce((total, s) => total + s.quantity, 0);
  averagePriceNoRenames.value = normalisePrice(
    totalPriceNoRenames,
    totalQuantityNoRenames
  );
});

let filtersText = computed(() => {
  let filters = [] as string[];
  if (attributeFilters.value.enchantment)
    filters.push(
      `Enchantment: '${formatEnchantment(attributeFilters.value.enchantment)}'`
    );

  if (attributeFilters.value.customDisc)
    filters.push(`Custom Disc: '${attributeFilters.value.customDisc}'`);

  if (attributeFilters.value.potionEffect)
    filters.push(`Potion Effect: '${attributeFilters.value.potionEffect}'`);

  return filters.join(",");
});

async function loadEnchantments(): Promise<string[]> {
  // TODO: Cache
  let url = `${Config.APIURL}/api/itemtypes/${props.itemType}/enchantments`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

async function loadDiscs(): Promise<string[]> {
  // TODO: Cache
  let url = `${Config.APIURL}/api/customDiscs`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

async function loadPotions(): Promise<string[]> {
  // TODO: Cache
  let url = `${Config.APIURL}/api/itemtypes/${props.itemType}/potionTypes`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <h1 class="text-3xl font-bold">{{ formatItemType(itemType) }}</h1>
    <h2 class="text-xl font-bold text-gray-400" v-if="filtersText">
      {{ filtersText }}
    </h2>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Average Prices
      </h4>

      <div>
        <div class="text-gray-400">
          Based on {{ sales.length }} sales shown below.
        </div>
        <div>
          <span
            >{{ formatNumber(averagePrice?.quantity, 2) }} '{{
              formatItemType(itemType)
            }}'
          </span>
          <span>is worth </span>
          <span>{{ formatNumber(averagePrice?.price, 2) }} diamond(s)</span>
        </div>

        <div class="text-gray-400 mt-4">Excluding renamed items</div>
        <div>
          <span
            >{{ formatNumber(averagePriceNoRenames?.quantity, 2) }} '{{
              formatItemType(itemType)
            }}'
          </span>
          <span>is worth </span>
          <span
            >{{
              formatNumber(averagePriceNoRenames?.price, 2)
            }}
            diamond(s)</span
          >
        </div>
      </div>
    </div>

    <div
      class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm"
      v-if="enchantments.length > 0 || customDiscs.length > 0 || potionEffects.length > 0"
    >
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Filter</h4>

      <EnchantmentFilter
        :item-type="itemType"
        :enchantments="enchantments"
        v-if="enchantments.length > 0"
      ></EnchantmentFilter>

      <MusicDiscFilter
        :item-type="itemType"
        :custom-discs="customDiscs"
        v-if="customDiscs.length > 0"
      ></MusicDiscFilter>

      <PotionFilter
        :item-type="itemType"
        :potion-effects="potionEffects"
        v-if="potionEffects.length > 0"
      ></PotionFilter>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Sales of {{ formatItemType(itemType) }}
      </h4>

      <div class="text-gray-400" v-if="filtersText">With {{ filtersText }}</div>

      <div class="mb-3 font-normal text-gray-400">
        <RecentSales :recent-sales="sales"></RecentSales>
      </div>
    </div>
  </div>
</template>
