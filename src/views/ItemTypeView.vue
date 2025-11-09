<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import { computed, onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import { formatPrice, normalisePrice, type NormalisedPrice } from "@/utilities/normalise-price";
import { useRoute, useRouter } from "vue-router";
import { Config } from "@/config";
import { formatEnchantment } from "@/utilities/enchantment-format";
import type { SalesFilters } from "@/api/sales/api";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatPotionEffect } from "@/utilities/potion-format";
import PlayerHeadOverview from "@/components/PlayerHeadOverview.vue";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const attributeFilters = ref({} as SalesFilters);
const sales = ref([] as SaleSummary[]);

// Extra item data
const enchantments = ref([] as DropdownOption[]);
const potionEffects = ref([] as DropdownOption[]);
const customDiscs = ref([] as DropdownOption[]);

// Average prices
const averagePrice = ref({ quantity: 0, price: 0 } as NormalisedPrice);
const averagePriceNoRenames = ref(null as NormalisedPrice | null);

onMounted(async () => {
  if (!props.itemType) return;

  // Filters
  attributeFilters.value.enchantment = route.query["enchantment"]?.toString();
  attributeFilters.value.customDisc = route.query["discName"]?.toString();
  attributeFilters.value.potionEffect = route.query["potionEffect"]?.toString();

  // Load sales data for the item type
  sales.value.push(...(await SalesAPI.loadSalesForItemType(props.itemType, attributeFilters.value)));

  // Enchantments
  enchantments.value.push(...(await loadEnchantments()));

  // Custom music discs
  if (props.itemType == "CUSTOM_MUSIC_DISC") customDiscs.value.push(...(await loadDiscs()));

  // Potion effects
  let isPotion = ["POTION", "SPLASH_POTION", "LINGERING_POTION"].indexOf(props.itemType) != -1;
  if (isPotion) potionEffects.value.push(...(await loadPotions()));

  // Calculate average price
  let totalPrice = sales.value.reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantity = sales.value.reduce((total, s) => total + s.quantity, 0);
  averagePrice.value = normalisePrice(totalPrice, totalQuantity);

  // Calculate average price without renamed items
  let totalPriceNoRenames = sales.value.filter((s) => s.customName == null).reduce((total, s) => total + s.totalPrice, 0);
  let totalQuantityNoRenames = sales.value.filter((s) => s.customName == null).reduce((total, s) => total + s.quantity, 0);

  if (totalPriceNoRenames != totalPrice || totalQuantityNoRenames != totalQuantity)
    averagePriceNoRenames.value = normalisePrice(totalPriceNoRenames, totalQuantityNoRenames);
});

let filtersText = computed(() => {
  let filters = [] as string[];

  if (attributeFilters.value.enchantment) filters.push(`Enchantment: '${formatEnchantment(attributeFilters.value.enchantment)}'`);

  if (attributeFilters.value.customDisc) filters.push(`Custom Disc: '${formatCustomDisc(attributeFilters.value.customDisc)}'`);

  if (attributeFilters.value.potionEffect) filters.push(`Potion Effect: '${formatPotionEffect(attributeFilters.value.potionEffect)}'`);

  return filters.join(",");
});

async function loadEnchantments(): Promise<DropdownOption[]> {
  // TODO: Cache
  let response = await loadItems(`${Config.APIURL}/api/itemtypes/${props.itemType}/enchantments`);
  return response.map(
    (i: string) =>
    ({
      text: formatEnchantment(i),
      value: i,
    } as DropdownOption)
  );
}

async function loadDiscs(): Promise<DropdownOption[]> {
  // TODO: Cache
  let response = await loadItems(`${Config.APIURL}/api/customDiscs`);
  return response.map(
    (i: string) =>
    ({
      text: formatCustomDisc(i),
      value: i,
    } as DropdownOption)
  );
}

async function loadPotions(): Promise<DropdownOption[]> {
  // TODO: Cache
  let response = await loadItems(`${Config.APIURL}/api/itemtypes/${props.itemType}/potionTypes`);
  return response.map(
    (i: string) =>
    ({
      text: formatPotionEffect(i),
      value: i,
    } as DropdownOption)
  );
}

async function loadItems(url: string): Promise<any[]> {
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

function filterSales(property: string, value: string) {
  if (value.length == 0) return;

  let query = {} as any;
  query[property] = value;

  router.push({ name: "itemSales", params: { itemType: props.itemType }, query: query });
}
</script>

<template>
  <PlayerHeadOverview v-if="itemType == 'PLAYER_HEAD'" :item-type="itemType" :sales="sales"></PlayerHeadOverview>
  <div v-else class="relative overflow-x-auto text-white flex flex-col gap-2">
    <div>
      <h2 class="mb-2 text-2xl font-bold tracking-tight text-white">{{ formatItemType(itemType) }}</h2>
      <div class="text-gray-400 mb-4 capitalize" v-if="filtersText">With {{ filtersText }}</div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h3 class="mb-2 text-xl font-bold tracking-tight text-white">Average Prices</h3>

      <div>
        <div class="text-gray-400">Based on {{ sales.length }} sales shown below.</div>
        <div v-if="averagePrice.quantity == 0">No data</div>
        <div v-else>
          <span>{{ formatPrice(averagePrice, itemType) }}</span>
        </div>

        <div class="text-gray-400 mt-4">Excluding renamed items</div>
        <div v-if="averagePriceNoRenames == null">No difference</div>
        <div v-else-if="averagePriceNoRenames.quantity == 0">No data</div>
        <div v-else>
          <span>{{ formatPrice(averagePriceNoRenames, itemType) }}</span>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="mb-2 text-xl font-bold tracking-tight text-white">Sales of {{ formatItemType(itemType) }}</h3>

      <div class="text-gray-400 mb-4 capitalize" v-if="filtersText">With {{ filtersText }}</div>

      <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between">
        <div class="flex flex-row flex-wrap gap-1">
          <DropdownFilter v-if="enchantments.length > 0" :placeholder="'Enchantment'" :default-selection="[]"
            :icon="'fa-solid fa-wand-sparkles'" :single-selection="true" :options="enchantments"
            @update:model-value="value => filterSales('enchantment', value as string)">
          </DropdownFilter>

          <DropdownFilter v-if="customDiscs.length > 0" :placeholder="'Custom Music Disc'" :default-selection="[]"
            :icon="'fa-solid fa-record-vinyl'" :single-selection="true" :options="customDiscs"
            @update:model-value="value => filterSales('discName', value as string)">
          </DropdownFilter>

          <DropdownFilter v-if="potionEffects.length > 0" :placeholder="'Potion Effect'" :default-selection="[]"
            :icon="'fa-solid fa-flask'" :single-selection="true" :options="potionEffects"
            @update:model-value="value => filterSales('potionEffect', value as string)">
          </DropdownFilter>
        </div>
      </div>

      <div class="mb-3 font-normal text-gray-400">
        <RecentSales :recent-sales="sales"></RecentSales>
      </div>
    </div>
  </div>
</template>
