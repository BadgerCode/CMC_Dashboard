<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Config } from "@/config";
import { normalisePrice } from "@/utilities/normalise-price";
import { formatNumber } from "@/utilities/number-format";

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
}

function getNormalisedPrice(shop: ShopData) {
  let price = normalisePrice(shop.price, shop.item.quantity);
  return `${formatNumber(price.quantity, 2)} for ${formatNumber(price.price, 2)} diamonds`;
}
</script>

<template>
  <div>This page is a work in progress</div>

  <div class="relative overflow-x-auto">
    <table
      class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base"
    >
      <thead class="text-white">
        <tr>
          <th class="table-cell"></th>
          <th class="table-cell">Item</th>
          <th class="table-cell">Price</th>
          <th class="table-cell">Min Quantity</th>
          <th class="table-cell">Location</th>
          <th class="table-cell">Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in shops" class="border-t border-gray-700">
          <td class="table-cell">{{ shop.type }}</td>
          <td class="table-cell">
            <div>
              <RouterLink
                :to="{
                  name: 'itemSales',
                  params: { itemType: shop.item.type },
                }"
                class="hyperlink"
              >
                {{ shop.item.name }}
              </RouterLink>
            </div>
            <div class="text-sm">
              {{ shop.item.type }}
            </div>
          </td>
          <td class="table-cell">{{ getNormalisedPrice(shop) }}</td>
          <td class="table-cell">{{ shop.item.quantity }}</td>
          <td class="table-cell">
            <div>
              {{ `${shop.location.x},${shop.location.y},${shop.location.z}` }}
            </div>
            <div>({{ shop.location.world }})</div>
          </td>
          <td class="table-cell">{{ shop.owner.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
