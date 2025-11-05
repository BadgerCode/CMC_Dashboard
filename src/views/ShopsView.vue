<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Config } from "@/config";
import { normalisePrice } from "@/utilities/normalise-price";
import { formatNumber } from "@/utilities/number-format";
import ItemTypeSearch from "@/components/ItemTypeSearch.vue";

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

onMounted(async () => {
  await loadShops();
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

  // If there are no filters (e.g. page load) just show the first 20
  if (!itemTypeFilter.value) {
    filteredShops.value.push(...shops.value.slice(0, 20));
  }
  else {
    filteredShops.value.push(...shops.value.filter(s => s.item.type == itemTypeFilter.value));
  }

  madeSelection.value = true;
}
</script>

<template>
  <div class="mb-8 text-gray-400">This page is a work in progress</div>

  <div class="flex flex-row justify-between items-end mb-8">
    <div>
      <h1 class="text-3xl font-bold">Shop Explorer</h1>
      <p class="text-gray-300">Browse shops selling and buying various items. Use the search on the right</p>
    </div>
    <div class="text-right">
      <ItemTypeSearch :item-types="itemTypes" @selection="itemType => { itemTypeFilter = itemType; applyFilters(); }">
      </ItemTypeSearch>
    </div>
  </div>

  <div class="relative overflow-x-auto" v-if="madeSelection">
    <div class="text-gray-400">
      <span>{{ filteredShops.length }} of {{shops.length}} shops</span>
    </div>
    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="text-white">
        <tr>
          <th class="table-cell"></th>
          <th class="table-cell">Item</th>
          <th class="table-cell">Price</th>
          <th class="table-cell">Min Quantity</th>
          <th class="table-cell">Remaining</th>
          <th class="table-cell">Location</th>
          <th class="table-cell">Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in filteredShops" class="border-t border-gray-700">
          <td class="table-cell">{{ shop.type }}</td>
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
              {{ shop.item.type }}
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
