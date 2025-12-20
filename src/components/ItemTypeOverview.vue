<script setup lang="ts">
import { updateShops } from "@/api/shops/api";
import type { ShopData, ShopItem } from "@/api/shops/shopdata";
import { computed, onMounted, onUpdated, ref, watch } from "vue";
import ShopsList from "./ShopsList.vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "./RecentSales.vue";
import SearchBox from "./SearchBox.vue";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "./Loading.vue";
import DropdownFilter, { type DropdownOption } from "./DropdownFilter.vue";
import * as SalesAPI from "@/api/sales/api";
import * as CustomDiscsAPI from "@/api/customDiscs/api";
import { initFlowbite } from "flowbite";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { Config } from "@/config";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatPotionEffect, isPotion } from "@/utilities/potion-format";
import { useRoute } from "vue-router";
import ItemTypeSearch from "./ItemTypeSearch.vue";
import { getItemInfo } from "@/models/item-info";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();
const route = useRoute();

const loadingSales = ref(true);
const filteredSales = ref([] as SaleSummary[]);
const loadingShops = ref(true);
const shops = ref([] as ShopData[]);
const filteredShops = ref([] as ShopData[]);

// Item descriptions
const itemInfo = computed(() => {
  return getItemInfo(props.itemType);
});

// Specific item type data
const numUndiscoveredMusicDiscs = ref(0);

// Name filter
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  applyFilters();
});

// Enchantment filter
const enchantments = ref([] as DropdownOption[]);
const enchantmentFilter = ref(route.query["enchantment"]?.toString() ?? "");
watch(enchantmentFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

// Potion effect filter
const potionEffects = ref([] as DropdownOption[]);
const potionEffectFilter = ref(route.query["potionEffect"]?.toString() ?? "");
watch(potionEffectFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

// Custom disc filter
const customDiscs = ref([] as DropdownOption[]);
const customDiscFilter = ref(route.query["discName"]?.toString() ?? "");
watch(customDiscFilter, async (_, __) => {
  await loadSales();
  applyFilters();
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load sales with any filters
  await loadSales();
  loadingSales.value = false;

  // Custom music discs (doesn't rely on shop data)
  if (props.itemType == "CUSTOM_MUSIC_DISC") customDiscs.value.push(...(await loadDiscs()));

  // Load shop data
  let shopData = await updateShops();
  shops.value = shopData.shops.filter(
    (s) => s.type == "SELLING" && (s.item.type == props.itemType || (s.item.childItems ?? []).some((i) => i.type == props.itemType))
  );

  // Load enchantments
  enchantments.value.push(...(await loadEnchantments()));

  // Potion effects
  if (isPotion(props.itemType)) potionEffects.value.push(...(await loadPotions()));

  // Render the item overview
  applyFilters();
  loadingShops.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadSales() {
  let salesFilters = {
    itemType: props.itemType,
    enchantment: enchantmentFilter.value,
    potionEffect: potionEffectFilter.value,
    customDisc: customDiscFilter.value,
  } as SalesAPI.SalesFilters;

  filteredSales.value = await SalesAPI.loadSales(salesFilters);
}

async function loadEnchantments(): Promise<DropdownOption[]> {
  // TODO: Cache
  let allItems = await loadItems(`${Config.APIURL}/api/itemtypes/${props.itemType}/enchantments`);
  // Combine shop and sale data and get a unique ordered list
  allItems.push(...shops.value.flatMap((s) => s.item.parsedSNBT.enchantments));
  allItems.push(
    ...shops.value.filter((s) => s.item.childItems != null).flatMap((s) => s.item.childItems!.flatMap((i) => i.parsedSNBT.enchantments))
  );
  let uniqueItems = [...new Set(allItems)];

  // shops.value
  return uniqueItems
    .map(
      (i: string) =>
        ({
          text: formatEnchantment(i),
          value: i,
        } as DropdownOption)
    )
    .sort((a, b) => a.text.localeCompare(b.text));
}

async function loadDiscs(): Promise<DropdownOption[]> {
  let response = await CustomDiscsAPI.retrieveCustomDiscs();
  numUndiscoveredMusicDiscs.value = response.unsoldDiscs;
  return response.discs.map((d) => ({ text: d.displayName, value: d.name } as DropdownOption)).sort((a, b) => a.text.localeCompare(b.text));
}

async function loadPotions(): Promise<DropdownOption[]> {
  // TODO: Cache
  let allItems = await loadItems(`${Config.APIURL}/api/itemtypes/${props.itemType}/potionTypes`);
  // Combine shop and sale data and get a unique ordered list
  allItems.push(...shops.value.map((s) => s.item.parsedSNBT.potionEffect).filter((s) => s != null));
  allItems.push(
    ...shops.value
      .filter((s) => s.item.childItems != null)
      .flatMap((s) => s.item.childItems!.map((i) => i.parsedSNBT.potionEffect))
      .filter((s) => s != null)
  );
  let uniqueItems = [...new Set(allItems)];

  return uniqueItems
    .map(
      (i: string) =>
        ({
          text: formatPotionEffect(i),
          value: i,
        } as DropdownOption)
    )
    .sort((a, b) => a.text.localeCompare(b.text));
}

async function loadItems(url: string): Promise<string[]> {
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

function applyFilters() {
  filteredShops.value = shops.value.filter((s) => {
    return matchesFilters(s.item) || (s.item.childItems ?? []).some((i) => matchesFilters(i));
  });
}

function matchesFilters(item: ShopItem) {
  // Apply name filter
  let trimmedNameFilter = nameFilter.value.trim().toLocaleLowerCase();
  let itemName = item.name.toLocaleLowerCase();
  let secondaryName = (
    item.parsedSNBT.paintingTitle?.toLocaleLowerCase() ??
    item.parsedSNBT.writtenBookTitle?.toLocaleLowerCase() ??
    item.parsedSNBT.customDiscSong ??
    item.parsedSNBT.playerHeadPlayerName ??
    ""
  ).toLocaleLowerCase();

  if (trimmedNameFilter.length > 0 && !itemName.includes(trimmedNameFilter) && !secondaryName.includes(trimmedNameFilter)) return false;

  // Apply enchantments filter
  let enchantment = enchantmentFilter.value.toLocaleLowerCase();
  if (enchantment != "" && !item.parsedSNBT.enchantments.includes(enchantment)) return false;

  // Apply potion filter
  if (potionEffectFilter.value.length > 0 && potionEffectFilter.value != item.parsedSNBT.potionEffect) return false;

  // Custom disc filter
  if (customDiscFilter.value.length > 0 && customDiscFilter.value != item.parsedSNBT.customDiscSong) return false;

  return true;
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
    <div class="mb-2 flex flex-col gap-4">
      <div class="flex flex-row items-center justify-center">
        <ItemTypeSearch
          @selection="
            (itemType) => {
              if (itemType) $router.push({ name: 'itemSales', params: { itemType: itemType } });
            }
          ">
        </ItemTypeSearch>
      </div>
    </div>

    <div class="flex flex-row justify-between items-end">
      <div>
        <!-- Item type and description -->
        <h1 class="text-3xl font-bold capitalize">{{ formatItemType(itemType)?.toLocaleLowerCase() }}</h1>
        <p class="text-gray-300" v-if="itemInfo?.description">{{ itemInfo.description }}</p>

        <!-- Specific item type info -->
        <p class="text-gray-300" v-if="numUndiscoveredMusicDiscs > 0">{{ numUndiscoveredMusicDiscs }} custom discs have not been sold yet (possibly undiscovered).</p>

        <!-- More info -->
        <p class="text-xs" v-if="itemInfo?.moreInfoLink">
          <a :href="itemInfo.moreInfoLink" class="hyperlink" target="_blank">More info</a>
        </p>
      </div>
    </div>

    <!-- Latest sales -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div>
          <h2 class="text-2xl font-bold">Latest Sales</h2>
          <div class="text-gray-400 text-sm capitalize">{{ filtersText }}</div>
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

          <DropdownFilter
            v-if="customDiscs.length > 0"
            :placeholder="'Custom Discs'"
            :icon="'fa-solid fa-record-vinyl'"
            :options="customDiscs"
            :single-selection="true"
            v-model="customDiscFilter">
          </DropdownFilter>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <Loading v-if="loadingSales" :loader-type="'text'"></Loading>
        <RecentSales v-else :recent-sales="filteredSales"></RecentSales>
      </div>
    </div>

    <!-- Items for sale -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-bold">Shops</h2>
          <div class="text-gray-300 capitalize">
            <div>Selling {{ formatItemType(itemType)?.toLocaleLowerCase() }}</div>
            <div class="text-gray-400 text-sm capitalize">{{ filtersText }}</div>
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

          <DropdownFilter
            v-if="customDiscs.length > 0"
            :placeholder="'Custom Discs'"
            :icon="'fa-solid fa-record-vinyl'"
            :options="customDiscs"
            :single-selection="true"
            v-model="customDiscFilter">
          </DropdownFilter>

          <SearchBox :placeholder="'Item Name'" v-model="nameFilter"></SearchBox>
        </div>
      </div>

      <div
        v-if="itemInfo?.shopCaveats"
        class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
        role="alert">
        {{ itemInfo.shopCaveats }}
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <Loading v-if="loadingShops" :loader-type="'text'"></Loading>
        <ShopsList v-else :shops="filteredShops" :hide-buy-sell="true"></ShopsList>
      </div>
    </div>
  </div>
</template>
