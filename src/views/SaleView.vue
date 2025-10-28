<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "@/components/RenderPainting.vue";
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { formatNumber } from "@/utilities/number-format";
import { computed, onMounted, ref } from "vue";
import * as SalesAPI from "@/api/sales/api"
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import type { PaintingSaleSummary } from "@/api/paintings/paintingSaleSummary";
import { normalisePrice, type NormalisedPrice } from "@/utilities/normalise-price";

const props = defineProps({
  id: String
});

interface SoldItem {
  id: string;
  itemType: string;
  quantity: number;
  isRenamed: boolean;
  isEnchanted: boolean;
  itemAttributes: ItemAttribute[];
}

interface SaleData extends SoldItem {
  occurredAt: string;
  type: string;
  totalPrice: number;
  containedItems: ContainerItem[];
}

interface ContainerItem extends SoldItem {
  slot: number | null;
}

interface ItemAttribute {
  key: string;
  value: string;
}

const saleData = ref(null as SaleData | null);
const averagePrice = ref(null as NormalisedPrice | null);
const paintingData = ref(null as Painting | null);
const paintingSales = ref([] as SaleSummary[]);
const otherSales = ref([] as SaleSummary[]);

onMounted(async () => {
  let url = `${Config.APIURL}/api/sales/${props.id}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve sale data");

  let response = await httpResponse.json();
  saleData.value = response.result;

  if (saleData.value) {
    // Calculate normalised prices
    averagePrice.value = normalisePrice(saleData.value.totalPrice, saleData.value.quantity);

    // Load painting data
    let paintingID = saleData.value.itemAttributes.find(a => a.key == 'PAINTING_ID')?.value;
    if (paintingID) {
      paintingData.value = await fetchPainting(paintingID);

      // Load other sales
      paintingSales.value = (await fetchPaintingSales(paintingID)).map(s => ({
        id: s.id,
        occurredAt: s.occurredAt,
        type: s.type,
        itemType: "PAINTING",
        quantity: s.quantity,
        totalPrice: s.totalPrice,
        isEnchanted: false,
        isRenamed: false
      } as SaleSummary));
    }

    // Load sales data for the item type
    otherSales.value.push(...(await SalesAPI.loadSalesForItemType(saleData.value.itemType)));
  }
});

async function fetchPainting(paintingID: string): Promise<Painting | null> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    return null;

  let response = await httpResponse.json();
  return response.result;
}

async function fetchPaintingSales(paintingID: string): Promise<PaintingSaleSummary[]> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}/sales`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    return [];

  let response = await httpResponse.json();
  return response.items;
}

let filteredAttributes = computed(() => {
  // Exclude painting attributes, as we'll render them separately
  return saleData.value?.itemAttributes.filter(a => !a.key.startsWith("PAINTING_")) ?? [];
});

let paintingOriginality = computed(() => {
  return saleData.value?.itemAttributes.find(a => a.key == "PAINTING_ORIGINALITY")?.value;
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2" v-if="saleData != null">

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Overview
      </h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <div>
          <span class="mr-2" :title="saleData.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="saleData.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="saleData.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </span>
          <span>{{ formatDate(saleData.occurredAt) }}</span>
        </div>

        <div class="text-white">
          <div>
            {{ saleData.quantity }} x {{ formatItemType(saleData.itemType) }} sold for {{ saleData.totalPrice }}
            diamond(s).
          </div>
        </div>
        <div>
          <div class="text-gray-400">Normalised price</div>
          <div>
            <span>{{ formatNumber(averagePrice?.quantity, 2) }} '{{ formatItemType(saleData.itemType) }}' </span>
            <span>is worth </span>
            <span>{{ formatNumber(averagePrice?.price, 2) }} diamond(s)</span>
          </div>
        </div>

        <div v-if="filteredAttributes.length > 0">
          <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base mt-2">
            <tbody>
              <tr v-for="attribute in filteredAttributes" class="border-t border-gray-700">
                <td class="table-cell wrap-anywhere">{{ formatItemType(attribute.key) }}</td>
                <td class="table-cell wrap-anywhere">{{ attribute.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="paintingData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Painting - {{ paintingData.title }}
      </h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <div>By {{ paintingData.authorName }}</div>
        <RenderPainting :painting="paintingData"></RenderPainting>
        <div>Originality: {{ paintingOriginality }}</div>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="paintingData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Sales of '{{ paintingData.title }}' painting
      </h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <RecentSales :recent-sales="paintingSales"></RecentSales>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="saleData.containedItems.length">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Contents
      </h4>

      <div class="mb-6 text-gray-400">
        The items inside the shulker box or bundle
      </div>

      <div class="mb-3 font-normal text-gray-400">
        <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
          <thead class="text-white">
            <tr>
              <th class="table-cell">Slot</th>
              <th class="table-cell">Item</th>
              <th class="table-cell">
                <span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span>
              </th>
              <th class="table-cell">Attributes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subItem in saleData.containedItems" class="border-t border-gray-700">
              <td class="table-cell">{{ subItem.slot != null ? subItem.slot + 1 : '' }}</td>
              <td class="table-cell wrap-anywhere">{{ formatItemType(subItem.itemType) }}</td>
              <td class="table-cell">{{ subItem.quantity }}</td>
              <td class="table-cell wrap-anywhere">
                <div v-for="attribute in subItem.itemAttributes">
                  {{ attribute.key }} : {{ attribute.value }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Sales of {{ formatItemType(saleData.itemType) }}
      </h4>

      <div class="mb-3 font-normal text-gray-400">
        <RecentSales :recent-sales="otherSales"></RecentSales>
      </div>
    </div>
  </div>
</template>
