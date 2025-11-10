<script setup lang="ts">
import { updateShops } from "@/api/shops/api";
import type { ShopData } from "@/api/shops/shopdata";
import { computed, onMounted, onUpdated, ref, watch } from "vue";
import ShopsList from "./ShopsList.vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "./RecentSales.vue";
import SearchBox from "./SearchBox.vue";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";
import DropdownFilter, { type DropdownOption } from "./DropdownFilter.vue";
import * as SalesAPI from "@/api/sales/api";
import { initFlowbite } from "flowbite";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { Config } from "@/config";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatPotionEffect } from "@/utilities/potion-format";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const filteredSales = ref([] as SaleSummary[]);
const shops = ref([] as ShopData[]);
const filteredShops = ref([] as ShopData[]);

// Item descriptions
const itemDescriptions = {
  PLAYER_HEAD: "Heads of various players. Some have additional functionality through Figura.",
  ENCHANTED_BOOK: "A book with one or more enchantments, used to enchant other items.",
  POTION: "A regular potion with a status effect that you have to drink.",
  SPLASH_POTION: "A throwable potion with a status effect.",
  LINGERING_POTION: "A throwable potion which creates a cloud with a status effect.",
} as { [itemType: string]: string };

const description = computed(() => {
  return itemDescriptions[props.itemType];
});

// Name filter
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  applyFilters();
});

// Enchantment filter
const enchantments = ref([] as DropdownOption[]);
const enchantmentFilter = ref("");
watch(enchantmentFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

// Potion effect filter
const potionEffects = ref([] as DropdownOption[]);
const potionEffectFilter = ref("");
watch(potionEffectFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

// Custom disc filter
const customDiscs = ref([] as DropdownOption[]);
const customDiscFilter = ref("");
watch(customDiscFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load enchantments
  // TODO: Combine sales enchantments with shop enchantments
  enchantments.value.push(...(await loadEnchantments()));

  // Custom music discs
  // TODO: Combine sales music discs with shop music discs
  if (props.itemType == "CUSTOM_MUSIC_DISC") customDiscs.value.push(...(await loadDiscs()));

  // Potion effects
  // TODO: Combine sales potion effects with shop potion effects
  let isPotion = ["POTION", "SPLASH_POTION", "LINGERING_POTION"].indexOf(props.itemType) != -1;
  if (isPotion) potionEffects.value.push(...(await loadPotions()));

  // Load sales with any filters
  await loadSales();

  // Load shop data
  let shopData = await updateShops();
  shops.value = shopData.shops.filter((s) => s.item.type == props.itemType && s.type == "SELLING");
  filteredShops.value = shops.value;

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadSales() {
  filteredSales.value = await SalesAPI.loadSalesForItemType(props.itemType, {
    enchantment: enchantmentFilter.value,
    potionEffect: potionEffectFilter.value,
    customDisc: customDiscFilter.value,
  });
}

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

function applyFilters() {
  filteredShops.value = shops.value.filter((s) => {
    // Apply name filter
    let trimmedNameFilter = nameFilter.value.trim().toLocaleLowerCase();
    if (trimmedNameFilter.length > 0 && !s.item.name.toLocaleLowerCase().includes(trimmedNameFilter)) return false;

    // Apply enchantments filter
    // TODO: Support enchanted books
    if (enchantmentFilter.value != "" && !s.item.parsedSNBT.enchantments.includes(enchantmentFilter.value)) return false;

    // Apply potion filter
    if (
      potionEffectFilter.value.length > 0 &&
      (!s.item.parsedSNBT.potionEffect || !potionEffectFilter.value.includes(s.item.parsedSNBT.potionEffect))
    )
      return false;

    // TODO: Custom music disc filter

    return true;
  });
}

let filtersText = computed(() => {
  let filters = [] as string[];

  if (enchantmentFilter.value.trim() != "") filters.push(`Enchantment: '${formatEnchantment(enchantmentFilter.value)}'`);
  if (potionEffectFilter.value.trim() != "") filters.push(`Potion Effect: '${formatPotionEffect(potionEffectFilter.value)}'`);
  if (customDiscFilter.value.trim() != "") filters.push(`Custom Disc: '${formatCustomDisc(customDiscFilter.value)}'`);

  return filters.join(",");
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold capitalize">{{ formatItemType(itemType)?.toLocaleLowerCase() }}</h1>
        <p class="text-gray-300" v-if="description">{{ description }}</p>
      </div>
    </div>

    <!-- Recent sales (include player head player name & custom name) -->
    <!-- Include enchantments -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div>
          <h2 class="text-2xl font-bold">Recent Sales</h2>
          <div class="text-gray-400 text-sm">{{ filtersText }}</div>
        </div>

        <div>
          <DropdownFilter
            v-if="enchantments.length > 0"
            :placeholder="'Enchantments'"
            :icon="'fa-solid fa-wand-sparkles'"
            :options="enchantments"
            :single-selection="true"
            v-model="enchantmentFilter">
          </DropdownFilter>

          <DropdownFilter
            v-if="potionEffects.length > 0"
            :placeholder="'Potion Effect'"
            :icon="'fa-solid fa-flask'"
            :options="potionEffects"
            :single-selection="true"
            v-model="potionEffectFilter">
          </DropdownFilter>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <!-- TODO: Show player head player name as an additional column -->
        <Loading v-if="loading" :loader-type="'text'"></Loading>
        <RecentSales v-else :recent-sales="filteredSales"></RecentSales>
      </div>
    </div>

    <!-- Top selling player heads (include player head player name & custom name) -->
    <!-- <div>
      <div>
        <h2 class="text-2xl font-bold">Top Selling</h2>
      </div>
    </div> -->

    <!-- Player heads for sale (include custom name) -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-bold">Shops</h2>
          <div class="text-gray-300 capitalize">
            <div>Selling {{ formatItemType(itemType)?.toLocaleLowerCase() }}</div>
            <div class="text-gray-400 text-sm">{{ filtersText }}</div>
          </div>
        </div>

        <div class="flex flex-row flex-wrap gap-1 items-end">
          <DropdownFilter
            v-if="enchantments.length > 0"
            :placeholder="'Enchantments'"
            :icon="'fa-solid fa-wand-sparkles'"
            :options="enchantments"
            :single-selection="true"
            v-model="enchantmentFilter">
          </DropdownFilter>

          <DropdownFilter
            v-if="potionEffects.length > 0"
            :placeholder="'Potion Effect'"
            :icon="'fa-solid fa-flask'"
            :options="potionEffects"
            :single-selection="true"
            v-model="potionEffectFilter">
          </DropdownFilter>

          <SearchBox :placeholder="'Item Name'" v-model="nameFilter"></SearchBox>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <Loading v-if="loading" :loader-type="'text'"></Loading>
        <ShopsList v-else :shops="filteredShops" :hide-buy-sell="true"></ShopsList>
      </div>
    </div>
  </div>
</template>
