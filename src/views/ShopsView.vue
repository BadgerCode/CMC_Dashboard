<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";
import { initFlowbite } from "flowbite";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import { formatPotionEffect } from "@/utilities/potion-format";
import Loading from "@/components/Loading.vue";
import { formatDate } from "@/utilities/date-format";
import type { ShopData } from "@/api/shops/shopdata";
import { updateShops } from "@/api/shops/api";
import type { ShopOverview } from "@/store/shops-state";
import ShopsList from "@/components/ShopsList.vue";
import SearchWithResults from "@/components/SearchWithResults.vue";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatEnchantment } from "@/utilities/enchantment-format";

const loading = ref(true);
const shopData = ref(null as ShopOverview | null);

const maxShops = 100;
const filteredShops = ref([] as ShopData[]);

// Filtering: Item types
const itemTypeFilter = ref("");

// Filtering: Buying vs selling
const buySellOptions = [
  { text: "I want to buy", value: "SELLING" },
  { text: "I want to sell", value: "BUYING" },
] as DropdownOption[];
const buySellFilter = ref(["SELLING"]);

watch(buySellFilter, async (_, __) => {
  applyFilters();
});

// Filtering: Potion effect
const potionEffects = ref([] as DropdownOption[]);
const potionEffectFilter = ref([] as string[]);

watch(potionEffectFilter, async (_, __) => {
  applyFilters();
});

// Filtering: Enchantments
const enchantments = ref([] as DropdownOption[]);
const enchantmentFilter = ref([] as string[]);

watch(enchantmentFilter, async (_, __) => {
  applyFilters();
});

// Filtering: shop owner
const shopOwners = ref([] as DropdownOption[]);
const shopOwnerFilter = ref("");
watch(shopOwnerFilter, async (_, __) => {
  applyFilters();
});

// Filtering: Custom music disc
const customDiscSongs = ref([] as DropdownOption[]);
const customDiscSongFilter = ref([] as string[]);

watch(customDiscSongFilter, async (_, __) => {
  applyFilters();
});

// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load shop data
  shopData.value = await updateShops();

  // Populate enchantments filter
  enchantments.value = shopData.value.enchantments
    .map((e) => ({
      text: formatEnchantment(e),
      value: e,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  // Populate potion effects filter
  potionEffects.value = shopData.value.potionEffects
    .map((e) => ({
      text: formatPotionEffect(e),
      value: e,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  // Populate shop owner filter
  let allOwners = shopData.value.shops
    .map((s) => ({
      text: s.owner.name,
      value: s.owner.uuid,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  shopOwners.value = [...new Map(allOwners.map((item) => [item.text, item])).values()];

  // Custom disc filter
  customDiscSongs.value = shopData.value.customDiscSongs
    .map((e) => ({
      text: formatCustomDisc(e),
      value: e,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  // Load page
  applyFilters();
  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

function applyFilters() {
  if (shopData.value == null) return;

  filteredShops.value.splice(0);

  let itemType = itemTypeFilter.value.trim();
  let shopOwner = shopOwnerFilter.value.trim();

  filteredShops.value.push(
    ...shopData.value.shops.filter((s) => {
      // Apply item type filter
      if (itemType.length > 0 && s.item.type != itemType) return false;

      // Apply buying/selling filter
      if (!buySellFilter.value.includes(s.type)) return false;

      // Apply potion filter
      if (
        potionEffectFilter.value.length > 0 &&
        (!s.item.parsedSNBT.potionEffect || !potionEffectFilter.value.includes(s.item.parsedSNBT.potionEffect))
      )
        return false;

      // Apply enchantments filter
      if (enchantmentFilter.value.length > 0 && !enchantmentFilter.value.some((e) => s.item.parsedSNBT.enchantments.includes(e)))
        return false;

      // Apply owner filter
      if (shopOwner.length > 0 && s.owner.uuid != shopOwner) return false;

      // Apply custom disc filter
      if (
        customDiscSongFilter.value.length > 0 &&
        (!s.item.parsedSNBT.customDiscSong || !customDiscSongFilter.value.includes(s.item.parsedSNBT.customDiscSong))
      )
        return false;

      return true;
    })
  );
}
</script>

<template>
  <div class="flex flex-row justify-between items-end mb-8">
    <div>
      <h1 class="text-3xl font-bold">Shop Explorer</h1>
      <p class="text-gray-300">Browse shops selling and buying various items.</p>
    </div>
  </div>

  <div class="flex flex-column md:flex-row flex-wrap space-y-2 items-start justify-between">
    <div class="flex flex-row flex-wrap flex-1 gap-1">
      <DropdownFilter
        :placeholder="'Buy/Sell'"
        :icon="'fa-solid fa-arrows-left-right'"
        :options="buySellOptions"
        v-model="buySellFilter"></DropdownFilter>

      <DropdownFilter :placeholder="'Potion Effect'" :icon="'fa-solid fa-flask'" :options="potionEffects" v-model="potionEffectFilter">
      </DropdownFilter>

      <DropdownFilter :placeholder="'Enchantments'" :icon="'fa-solid fa-wand-sparkles'" :options="enchantments" v-model="enchantmentFilter">
      </DropdownFilter>

      <DropdownFilter
        :placeholder="'Custom Discs'"
        :icon="'fa-solid fa-record-vinyl'"
        :options="customDiscSongs"
        v-model="customDiscSongFilter">
      </DropdownFilter>

      <SearchWithResults
        :placeholder="'Shop owners'"
        :items="shopOwners"
        @selection="(item) => (shopOwnerFilter = item?.value ?? '')"
        @clear="() => (shopOwnerFilter = '')">
      </SearchWithResults>
    </div>

    <div>
      <ItemTypeSearch
        :item-types="shopData?.itemTypes ?? []"
        @selection="
          (itemType) => {
            itemTypeFilter = itemType ?? '';
            applyFilters();
          }
        ">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="relative overflow-x-auto" v-if="!loading">
    <div class="text-gray-400">
      <div>{{ filteredShops.length }} shops</div>
      <div class="text-gray-500 text-xs" v-if="!loading">Last updated {{ formatDate(shopData?.lastUpdated, "") }}</div>
    </div>

    <ShopsList :shops="filteredShops"></ShopsList>
  </div>

  <div v-if="filteredShops.length > maxShops" class="mt-8 text-center text-gray-400">Only showing up to {{ maxShops }} shops</div>

  <Loading v-if="loading" :fill-space="true"></Loading>
</template>
