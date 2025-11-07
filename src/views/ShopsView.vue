<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import { Config } from "@/config";
import { normalisePrice } from "@/utilities/normalise-price";
import { formatNumber } from "@/utilities/number-format";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";
import { initFlowbite } from "flowbite";
import { formatItemType } from "@/utilities/item-type-format";
import { parseSNBTData, type SNBTData } from "@/utilities/snbt-processor";
import DropdownFilter, {
  type DropdownOption,
} from "@/components/DropdownFilter.vue";
import { formatPotionEffect } from "@/utilities/potion-format";
import Loading from "@/components/Loading.vue";
import { formatDate } from "@/utilities/date-format";
import * as WaystoneAPI from "@/api/waystones/api";
import { formatEnchantment } from "@/utilities/enchantment-format";

interface ShopData {
  id: string;
  owner: ShopOwner;
  location: ShopLocation;
  type: string; // SELLING or BUYING
  price: number;
  remaining: number;
  item: ShopItem;
}

interface ShopOwner {
  name: string;
  uuid: string;
}

interface ShopLocation {
  x: number;
  y: number;
  z: number;
  world: string;
}

interface ShopItem {
  type: string;
  quantity: number;
  name: string;
  snbt: string;
  parsedSNBT: SNBTData;
}

const loading = ref(true);
const shops = ref([] as ShopData[]);
const lastUpdated = ref("");

const filteredShops = ref([] as ShopData[]);

// Filtering: Item types
const itemTypes = ref([] as string[]);
const itemTypeFilter = ref("");

// Filtering: Buying vs selling
const buySellOptions = [
  { text: "I want to buy", value: "SELLING" },
  { text: "I want to sell", value: "BUYING" },
] as DropdownOption[];
const buySellFilter = ref(["BUYING", "SELLING"]);
const buySellDefaultSelection = ['SELLING'];

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

// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  await loadShops();
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadShops() {
  await loadWaystones();

  let url = `${Config.APIURL}/api/chestshops`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve chest shops");

  let response = await httpResponse.json();
  let responseItems = response.items as ShopData[];
  for (const shop of responseItems) {
    shop.item.parsedSNBT = parseSNBTData(shop.item.snbt);
  }

  lastUpdated.value = response.lastUpdated;
  shops.value.push(...responseItems);
  loading.value = false;

  // Extract info from the shops
  itemTypes.value = [...new Set(shops.value.map((s) => s.item.type).sort())];
  potionEffects.value = [
    ...new Set(
      shops.value
        .map((s) => s.item.parsedSNBT.potionEffect)
        .filter((e) => e != null)
    ),
  ]
    .map((e) => ({
      text: formatPotionEffect(e),
      value: e,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));
  enchantments.value = [
    ...new Set(shops.value.flatMap((s) => s.item.parsedSNBT.enchantments)),
  ]
    .map((e) => ({
      text: e,
      value: e,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  // Render list
  applyFilters();
}

async function loadWaystones() {
  try {
    // TODO: Work out the closest waystones to each shop
    // let waystones = await WaystoneAPI.loadWaystones();
  } catch (error) {
    // Prevent this error from stopping shops from loading
    console.error(error);
  }
}

function getNormalisedPrice(shop: ShopData) {
  let price = normalisePrice(shop.price, shop.item.quantity);
  return `${formatNumber(price.quantity, 2)} for ${formatNumber(
    price.price,
    2
  )} 💎`;
}

function applyFilters() {
  filteredShops.value.splice(0);

  let itemType = itemTypeFilter.value.trim();

  filteredShops.value.push(
    ...shops.value.filter((s) => {
      // Apply item type filter
      if (itemType.length > 0 && s.item.type != itemType) return false;

      // Apply buying/selling filter
      if (!buySellFilter.value.includes(s.type)) return false;

      // Apply potion filter
      if (
        potionEffectFilter.value.length > 0 &&
        (!s.item.parsedSNBT.potionEffect ||
          !potionEffectFilter.value.includes(s.item.parsedSNBT.potionEffect))
      )
        return false;

      // Apply enchantments filter
      if (
        enchantmentFilter.value.length > 0 &&
        !enchantmentFilter.value.some((e) =>
          s.item.parsedSNBT.enchantments.includes(e)
        )
      )
        return false;

      return true;
    })
  );

  // TODO: Pagination
  if (filteredShops.value.length > 500) filteredShops.value.splice(500);
}
</script>

<template>
  <div class="flex flex-row justify-between items-end mb-8">
    <div>
      <h1 class="text-3xl font-bold">Shop Explorer</h1>
      <p class="text-gray-300">
        Browse shops selling and buying various items.
      </p>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
    <div class="flex flex-row flex-wrap gap-1">
      <DropdownFilter :placeholder="'Buy/Sell'" :icon="'fa-solid fa-arrows-left-right'"
        :default-selection="buySellDefaultSelection" :options="buySellOptions" v-model="buySellFilter"></DropdownFilter>

      <DropdownFilter :placeholder="'Potion Effect'" :icon="'fa-solid fa-flask'" :options="potionEffects"
        v-model="potionEffectFilter">
      </DropdownFilter>

      <DropdownFilter :placeholder="'Enchantments'" :icon="'fa-solid fa-wand-sparkles'" :options="enchantments"
        v-model="enchantmentFilter">
      </DropdownFilter>
    </div>

    <div>
      <ItemTypeSearch :item-types="itemTypes" @selection="
        (itemType) => {
          itemTypeFilter = itemType;
          applyFilters();
        }
      ">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="relative overflow-x-auto" v-if="!loading">
    <div class="text-gray-400">
      <div>{{ filteredShops.length }} of {{ shops.length }} shops</div>
      <div class="text-gray-500 text-xs" v-if="!loading">
        Last updated {{ formatDate(lastUpdated, "") }}
      </div>
    </div>
    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <th class="table-cell text-center">
            <font-awesome-icon icon="fa-solid fa-arrows-left-right" />
          </th>
          <th class="table-cell text-center">Item</th>
          <th class="table-cell md:hidden text-center">Price &amp; Stock</th>
          <th class="hidden md:table-cell">Price</th>
          <th class="hidden md:table-cell pr-4">Min<br />Buy</th>
          <th class="hidden md:table-cell">Stock</th>
          <th class="table-cell text-center">
            <font-awesome-icon icon="fa-solid fa-globe" />
          </th>
          <th class="hidden md:table-cell">Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in filteredShops" class="stripped-row">
          <td class="table-cell">{{ shop.type.replace(/ING/g, "") }}</td>
          <td class="table-cell">
            <div class="text-white">
              {{ shop.item.name }}
            </div>

            <div class="text-sm">
              <RouterLink :to="{
                name: 'itemSales',
                params: { itemType: shop.item.type },
              }" class="hyperlink">
                {{ formatItemType(shop.item.type) }}
              </RouterLink>
            </div>

            <div class="text-sm capitalize" v-if="shop.item.parsedSNBT.potionEffect">
              {{ formatPotionEffect(shop.item.parsedSNBT.potionEffect) }}
            </div>

            <div class="text-sm" v-if="shop.item.parsedSNBT.paintingName">
              {{ shop.item.parsedSNBT.paintingName }}
            </div>

            <div class="text-sm capitalize" v-for="enchantment in shop.item.parsedSNBT.enchantments">
              {{ formatEnchantment(enchantment) }}
            </div>
          </td>
          <td class="table-cell md:hidden">
            <div class="text-nowrap">{{ getNormalisedPrice(shop) }}</div>
            <div class="mt-2">Min buy:</div>
            <div>{{ shop.item.quantity }}</div>
            <div class="mt-2">Stock:</div>
            <div>x{{ shop.remaining }}</div>
          </td>
          <td class="hidden md:table-cell">{{ getNormalisedPrice(shop) }}</td>
          <td class="hidden md:table-cell">{{ shop.item.quantity }}</td>
          <td class="hidden md:table-cell">x {{ shop.remaining }}</td>
          <td class="table-cell">
            <div class="block md:inline mr-1">{{ `${shop.location.x},` }}</div>
            <div class="block md:inline mr-1">{{ `${shop.location.y},` }}</div>
            <div class="block md:inline mr-1">{{ shop.location.z }}</div>
            <div>({{ shop.location.world }})</div>
          </td>
          <td class="hidden md:table-cell">{{ shop.owner.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
</template>
