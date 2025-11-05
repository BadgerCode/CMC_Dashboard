<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import { Config } from "@/config";
import { normalisePrice } from "@/utilities/normalise-price";
import { formatNumber } from "@/utilities/number-format";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";
import { initFlowbite } from "flowbite";
import { formatItemType } from "@/utilities/item-type-format";

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
}

const loading = ref(true);
const shops = ref([] as ShopData[]);
const lastUpdated = ref("");

const madeSelection = ref(false);
const filteredShops = ref([] as ShopData[]);

const itemTypes = ref([] as string[]);
const itemTypeFilter = ref("");

const buySellFilter = ref(["BUYING", "SELLING"]);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  await loadShops();
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadShops() {
  let url = `${Config.APIURL}/api/chestshops`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve chest shops");

  let response = await httpResponse.json();

  lastUpdated.value = response.lastUpdated;
  shops.value.push(...response.items);
  loading.value = false;

  // Extract item types from the shops
  itemTypes.value = [...new Set(shops.value.map(s => s.item.type).sort())];
  applyFilters();
}

function getNormalisedPrice(shop: ShopData) {
  let price = normalisePrice(shop.price, shop.item.quantity);
  return `${formatNumber(price.quantity, 2)} for ${formatNumber(price.price, 2)} diamonds`;
}

function applyFilters() {
  filteredShops.value.splice(0);

  let itemType = itemTypeFilter.value.trim();

  filteredShops.value.push(...shops.value.filter(s => {
    // Apply item type filter
    if (itemType.length > 0 && s.item.type != itemType) return false;

    // Apply buying/selling filter
    if (!buySellFilter.value.includes(s.type)) return false;

    return true;
  }));

  // TODO: Pagination
  if (filteredShops.value.length > 500) filteredShops.value.splice(500);

  madeSelection.value = true;
}

watch(buySellFilter, async (_, __) => {
  applyFilters();
})
</script>

<template>
  <div class="mb-8 text-gray-400">This page is a work in progress</div>

  <div class="flex flex-row justify-between items-end mb-8">
    <div>
      <h1 class="text-3xl font-bold">Shop Explorer</h1>
      <p class="text-gray-300">Browse shops selling and buying various items. Use the search on the right</p>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
    <div>
      <button id="dropdownBuySellButton" data-dropdown-toggle="dropdownBuySell"
        class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button">
        <font-awesome-icon icon="fa-solid fa-arrows-left-right" class="w-3 h-3 text-gray-400 me-3"/>
        Buy/Sell
        <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-2.5 h-2.5 ms-2.5" />
      </button>
      <!-- Dropdown menu -->
      <div id="dropdownBuySell"
        class="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
        data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="top"
        style="position: absolute; inset: auto auto 0px 0px; margin: 0px; transform: translate3d(522.5px, 3847.5px, 0px);">
        <ul class="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownBuySellButton">
          <li>
            <div class="flex items-center p-2 rounded-sm hover:bg-gray-600">
              <input id="filter-buysell-sell" type="checkbox" value="SELLING" v-model="buySellFilter" class="checkbox">
              <label for="filter-buysell-sell" class="w-full ms-2 text-sm font-medium text-gray-300 rounded-sm p-2">Shop
                is Selling</label>
            </div>
          </li>
          <li>
            <div class="flex items-center p-2 rounded-sm hover:bg-gray-600">
              <input id="filter-buysell-buy" type="checkbox" value="BUYING" v-model="buySellFilter" class="checkbox">
              <label for="filter-buysell-buy" class="w-full ms-2 text-sm font-medium text-gray-300 rounded-sm p-2">Shop
                is Buying</label>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <ItemTypeSearch :item-types="itemTypes" @selection="itemType => { itemTypeFilter = itemType; applyFilters(); }">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="relative overflow-x-auto" v-if="madeSelection">
    <div class="text-gray-400">
      <span>{{ filteredShops.length }} of {{ shops.length }} shops</span>
    </div>
    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="text-white">
        <tr>
          <th class="table-cell text-center"><font-awesome-icon icon="fa-solid fa-arrows-left-right" /></th>
          <th class="table-cell text-center">Item</th>
          <th class="table-cell text-center">Price</th>
          <th class="table-cell text-center">Amount</th>
          <th class="table-cell text-center">Stock</th>
          <th class="table-cell text-center"><font-awesome-icon icon="fa-solid fa-globe" /></th>
          <th class="table-cell text-center">Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in filteredShops" class="border-t border-gray-700">
          <td class="table-cell">{{ shop.type.replace(/ING/g, "") }}</td>
          <td class="table-cell">
            <div>
              <RouterLink :to="{
                name: 'itemSales',
                params: { itemType: shop.item.type },
              }" class="hyperlink">
                {{ shop.item.name }}
              </RouterLink>
            </div>
            <div class="text-sm">
              {{ formatItemType(shop.item.type) }}
            </div>
          </td>
          <td class="table-cell">{{ getNormalisedPrice(shop) }}</td>
          <td class="table-cell">{{ shop.item.quantity }}</td>
          <td class="table-cell">x {{ shop.remaining }}</td>
          <td class="table-cell">
            <div>
              {{ `${shop.location.x}, ${shop.location.y}, ${shop.location.z}` }}
            </div>
            <div>({{ shop.location.world }})</div>
          </td>
          <td class="table-cell">{{ shop.owner.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
