<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { initFlowbite } from "flowbite";
import { debounce } from "lodash";
import { Config } from "@/config";
import { updateShops } from "@/api/shops/api";
import type { ShopData, ShopItem } from "@/api/shops/shopdata";
import ShopsList from "@/components/ShopsList.vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import SearchBox from "@/components/SearchBox.vue";
import { formatItemType } from "@/utilities/item-type-format";
import Loading from "@/components/Loading.vue";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import * as SalesAPI from "@/api/sales/api";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatPotionEffect, isPotion } from "@/utilities/potion-format";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";
import { getItemInfo } from "@/models/item-info";
import { itemsStore } from "@/store/items-state";
import { setPageTitle } from "@/router/pageTitle";
import { userStore } from "@/store/user-state";
import { normalisePrice, simpleNormalisedPrice } from "@/utilities/normalise-price";
import CustomDiscStats from "@/components/CustomDiscStats.vue";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();
const route = useRoute();

const loadingSales = ref(true);
const filteredSales = ref([] as SaleSummary[]);
const averagePrice = ref(normalisePrice(0, 0));
const loadingShops = ref(true);
const shops = ref([] as ShopData[]);
const filteredShops = ref([] as ShopData[]);

// Item descriptions
const itemInfo = computed(() => {
  return getItemInfo(props.itemType);
});
const isCustomDisc = computed(() => props.itemType.toLocaleUpperCase() === "CUSTOM_MUSIC_DISC");

// Villager trade
const villagerTrades = computed(() => {
  let itemType = props.itemType.replace(/_/g, " ").toLocaleLowerCase();
  return itemsStore.villagerTrades.filter((t) => t.itemType?.toLocaleLowerCase() == itemType);
});

// Alchemy conversion
const alchemyConversions = computed(() => {
  return itemsStore.alchemyConversions[props.itemType.toLocaleUpperCase()];
});

// Name filter
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  await reloadSalesAndShops();
});

// Enchantment filter
const enchantments = ref([] as DropdownOption[]);
const enchantmentFilter = ref(route.query["enchantment"]?.toString() ?? "");
watch(enchantmentFilter, async (_, __) => {
  await reloadSalesAndShops();
});

// Potion effect filter
const potionEffects = ref([] as DropdownOption[]);
const potionEffectFilter = ref(route.query["potionEffect"]?.toString() ?? "");
watch(potionEffectFilter, async (_, __) => {
  await reloadSalesAndShops();
});

// Custom disc filter
const customDiscs = computed(() =>
  Object.values(itemsStore.customMusicDiscs)
    .map((d) => ({ text: d.displayName, value: d.name }) as DropdownOption)
    .sort((a, b) => a.text.localeCompare(b.text)),
);
const customDiscFilter = ref(route.query["discName"]?.toString() ?? "");
watch(customDiscFilter, async (_, __) => {
  await reloadSalesAndShops();
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  userStore.addRecentlyViewedItem(props.itemType);

  setPageTitle(formatItemType(props.itemType));

  // Load sales with any filters
  await loadSales();

  // Load shop data
  let shopData = await updateShops();
  shops.value = shopData.shops.filter(
    (s) => s.type == "SELLING" && (s.item.type == props.itemType || (s.item.childItems ?? []).some((i) => i.type == props.itemType)),
  );

  // Load enchantments
  enchantments.value.push(...(await loadEnchantments()));

  // Potion effects
  if (isPotion(props.itemType)) potionEffects.value.push(...(await loadPotions()));

  // Render the item overview
  applyShopFilters();
  loadingShops.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

const reloadSalesAndShops = debounce(async () => {
  await loadSales();
  applyShopFilters();
}, 200);

async function loadSales() {
  filteredSales.value.splice(0);

  let salesFilters = {
    itemType: props.itemType,
    customName: nameFilter.value,
    enchantment: enchantmentFilter.value,
    potionEffect: potionEffectFilter.value,
    customDisc: customDiscFilter.value,
  } as SalesAPI.SalesFilters;

  filteredSales.value = await SalesAPI.loadSales(salesFilters);

  // Calculate average price
  if (filteredSales.value.length > 0) {
    let totalSold = filteredSales.value.reduce((partial, a) => partial + a.quantity, 0);
    let totalPaid = filteredSales.value.reduce((partial, a) => partial + a.totalPrice, 0);
    averagePrice.value = normalisePrice(totalPaid / totalSold, 1);
  }

  loadingSales.value = false;
}

async function loadEnchantments(): Promise<DropdownOption[]> {
  // TODO: Cache
  let allItems = await loadItems(`${Config.APIURL}/api/itemtypes/${props.itemType}/enchantments`);
  // Combine shop and sale data and get a unique ordered list
  allItems.push(...shops.value.flatMap((s) => s.item.parsedSNBT.enchantments));
  allItems.push(
    ...shops.value.filter((s) => s.item.childItems != null).flatMap((s) => s.item.childItems!.flatMap((i) => i.parsedSNBT.enchantments)),
  );
  let uniqueItems = [...new Set(allItems)];

  // shops.value
  return uniqueItems
    .map(
      (i: string) =>
        ({
          text: formatEnchantment(i),
          value: i,
        }) as DropdownOption,
    )
    .sort((a, b) => a.text.localeCompare(b.text));
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
      .filter((s) => s != null),
  );
  let uniqueItems = [...new Set(allItems)];

  return uniqueItems
    .map(
      (i: string) =>
        ({
          text: formatPotionEffect(i),
          value: i,
        }) as DropdownOption,
    )
    .sort((a, b) => a.text.localeCompare(b.text));
}

async function loadItems(url: string): Promise<string[]> {
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

function applyShopFilters() {
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

function getWikiLink() {
  let formattedType = props.itemType.toLocaleLowerCase();
  let frags = formattedType.split("_");
  for (let i = 0; i < frags.length; i++) {
    frags[i] = frags[i]!.charAt(0).toUpperCase() + frags[i]!.slice(1);
  }

  let itemName = frags.join("_").replace("Of", "of");

  return `https://minecraft.wiki/w/${itemName}`;
}
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

    <!-- Item info -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-row justify-between gap-4 items-center">
        <!-- Item Info -->
        <div class="flex flex-col">
          <!-- Item type -->
          <h1 class="text-3xl font-bold">{{ formatItemType(itemType) }}</h1>

          <!-- Description -->
          <p class="text-gray-300" v-if="itemInfo?.description">{{ itemInfo.description }}</p>

          <!-- Specific item type info -->
          <p class="text-gray-300" v-if="isCustomDisc && itemsStore.customMusicDiscsUnsold > 0">
            {{ itemsStore.customMusicDiscsUnsold }} custom discs have not been sold yet (possibly undiscovered).
          </p>

          <!-- More info -->
          <p class="text-xs" v-if="itemInfo?.moreInfoLink">
            <a :href="itemInfo.moreInfoLink" class="hyperlink" target="_blank">More info</a>
          </p>
          <p class="text-xs" v-else-if="!itemInfo?.hideWikiLink">
            <a :href="getWikiLink()" class="hyperlink" target="_blank">Minecraft Wiki</a>
          </p>
        </div>

        <!-- Item icon/picture -->
        <div>
          <div v-if="itemInfo?.icon" class="text-5xl">
            <font-awesome-icon :icon="itemInfo.icon" />
          </div>
          <div v-else-if="itemInfo?.picture" class="size-[48px]">
            <img :src="itemInfo.picture" />
          </div>
        </div>
      </div>

      <!-- Villager trades -->
      <div class="flex flex-col" v-if="villagerTrades.length > 0">
        <h2 class="text-xl font-bold capitalize">Villager Trade</h2>
        <p class="text-gray-300" v-for="villagerTrade in villagerTrades">
          {{ villagerTrade.villager }}: {{ villagerTrade.price }} {{ villagerTrade.currency }} for {{ villagerTrade.quantity }}
          {{ villagerTrade.itemType }} {{ villagerTrade.extraInfo ? `(${villagerTrade.extraInfo})` : "" }}
        </p>
        <p class="text-gray-300 text-xs">
          <RouterLink :to="{ name: 'villagerTrades' }" class="hyperlink">All trades</RouterLink>
        </p>
      </div>

      <!-- Alchemy conversions -->
      <div class="flex flex-col" v-if="alchemyConversions">
        <h2 class="text-xl font-bold capitalize">Alchemy Conversions</h2>

        <div class="text-gray-300" v-for="conversion in alchemyConversions.createdBy">
          <span>{{ conversion.sourceQuantity }}x </span>
          <RouterLink :to="{ name: 'itemSales', params: { itemType: conversion.source } }" class="hyperlink">
            {{ formatItemType(conversion.source) }}
          </RouterLink>
          <span> → </span>
          <span>{{ conversion.targetQuantity }}x </span>
          <span>{{ formatItemType(conversion.target) }}</span>
        </div>

        <p v-if="alchemyConversions.creates" class="text-gray-300">
          <span>{{ alchemyConversions.creates.sourceQuantity }}x </span>
          <span>{{ formatItemType(alchemyConversions.creates.source) }}</span>
          <span> → </span>
          <span>{{ alchemyConversions.creates.targetQuantity }}x </span>
          <RouterLink :to="{ name: 'itemSales', params: { itemType: alchemyConversions.creates.target } }" class="hyperlink">
            {{ formatItemType(alchemyConversions.creates.target) }}
          </RouterLink>
        </p>

        <p class="text-gray-300 text-xs">
          <RouterLink :to="{ name: 'alchemyConversions' }" class="hyperlink">All conversions</RouterLink>
        </p>
      </div>
    </div>

    <!-- Custom disc stats -->
    <div v-if="isCustomDisc">
      <div>
        <h2 class="text-2xl font-bold">Statistics</h2>
      </div>

      <CustomDiscStats @selection="(discName) => (customDiscFilter = discName)"></CustomDiscStats>
    </div>

    <!-- Latest sales -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div>
          <h2 class="text-2xl font-bold">Latest Sales</h2>
          <div class="text-gray-400 text-sm capitalize">{{ filtersText }}</div>
          <div class="hint-text">Average price: {{ simpleNormalisedPrice(averagePrice) }}</div>
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
            v-if="isCustomDisc"
            :placeholder="'Custom Discs'"
            :icon="'fa-solid fa-record-vinyl'"
            :options="customDiscs"
            :single-selection="true"
            v-model="customDiscFilter">
          </DropdownFilter>

          <SearchBox :placeholder="'Item Name'" v-model="nameFilter"></SearchBox>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <Loading v-if="loadingSales" :loader-type="'text'"></Loading>
        <RecentSales v-else :recent-sales="filteredSales" :hide-item-type-link="true"></RecentSales>
      </div>
    </div>

    <!-- Items for sale -->
    <div>
      <div class="flex flex-column sm:flex-row flex-wrap space-y-1 items-end justify-between pb-2">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-bold">Shops</h2>
          <div class="text-gray-300">
            <div>Selling {{ formatItemType(itemType) }}</div>
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
            v-if="isCustomDisc"
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
