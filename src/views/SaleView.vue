<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "@/components/RenderPainting.vue";
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { computed, onMounted, ref } from "vue";
import type { SaleSummary } from "@/api/sales/saleSummary";
import RecentSales from "@/components/RecentSales.vue";
import type { PaintingSaleSummary } from "@/api/paintings/paintingSaleSummary";
import { formatPrice, normalisePrice, type NormalisedPrice } from "@/utilities/normalise-price";
import Loading from "@/components/Loading.vue";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatPotionEffect } from "@/utilities/potion-format";
import { formatCustomDisc } from "@/utilities/custom-disc-format";

const props = defineProps({
  id: String,
});

interface SoldItem {
  id: string;
  itemType: string;
  quantity: number;
  isEnchanted: boolean;
  itemAttributes: ItemAttribute[];
}

interface SaleData extends SoldItem {
  occurredAt: string;
  type: string;
  totalPrice: number;
  containedItems: ContainerItem[];
  customName: string | null;
}

interface ContainerItem extends SoldItem {
  slot: number | null;
}

interface ItemAttribute {
  key: string;
  value: string;
}

const loading = ref(true);
const saleData = ref(null as SaleData | null);
const normalisedPrice = ref({ quantity: 0, price: 0 } as NormalisedPrice);
const paintingData = ref(null as Painting | null);
const paintingSales = ref([] as SaleSummary[]);

onMounted(async () => {
  let url = `${Config.APIURL}/api/sales/${props.id}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) throw new Error("Failed to retrieve sale data");

  let response = await httpResponse.json();
  saleData.value = response.result;
  loading.value = false;

  if (saleData.value == null) return;

  // Calculate normalised prices
  normalisedPrice.value = normalisePrice(saleData.value.totalPrice, saleData.value.quantity);

  // Load painting data
  let paintingID = saleData.value.itemAttributes.find((a) => a.key == "PAINTING_ID")?.value;
  if (paintingID) {
    paintingData.value = await fetchPainting(paintingID);

    // Load other sales
    paintingSales.value = (await fetchPaintingSales(paintingID)).map(
      (s) =>
        ({
          id: s.id,
          occurredAt: s.occurredAt,
          type: s.type,
          itemType: "PAINTING",
          quantity: s.quantity,
          totalPrice: s.totalPrice,
          isEnchanted: false,
        } as SaleSummary)
    );
  }
});

async function fetchPainting(paintingID: string): Promise<Painting | null> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  return response.result;
}

async function fetchPaintingSales(paintingID: string): Promise<PaintingSaleSummary[]> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}/sales`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}

let filteredAttributes = computed(() => {
  // Exclude painting attributes, as we'll render them separately
  return (saleData.value?.itemAttributes.filter((a) => !a.key.startsWith("PAINTING_")) ?? []).sort(
    (a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value)
  );
});

let paintingOriginality = computed(() => {
  return saleData.value?.itemAttributes.find((a) => a.key == "PAINTING_ORIGINALITY")?.value;
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Sale Overview</h4>

      <Loading v-if="loading" :loader-type="'text'"></Loading>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4" v-if="saleData != null">
        <!-- Basic info -->
        <div class="text-gray-300">
          <div class="flex flex-row gap-6">
            <div>
              <span>{{ formatDate(saleData.occurredAt) }}</span>
            </div>

            <div>
              <span class="mr-2" :title="saleData.type">
                <font-awesome-icon icon="fa-solid fa-shop" v-if="saleData.type == 'Shop'" />
                <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="saleData.type == 'Auction'" />
                <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
              </span>
              <span>{{ saleData.type }}</span>
            </div>
          </div>
        </div>

        <!-- Item info -->
        <div>
          <div>
            <RouterLink
              :to="{
                name: 'itemSales',
                params: { itemType: saleData.itemType },
              }"
              class="hyperlink">
              {{ formatItemType(saleData.itemType) }}
            </RouterLink>
          </div>

          <div v-if="saleData.customName" class="text-gray-400">
            <span>{{ saleData.customName }}</span>
          </div>
        </div>

        <!-- Price -->
        <div class="text-white">
          <div>Price</div>
          <div>
            {{ saleData.quantity }} x {{ formatItemType(saleData.itemType) }} sold for
            {{ saleData.totalPrice }}
            diamond(s).
          </div>
        </div>
        <div>
          <div class="text-gray-400">Normalised price</div>
          <div>
            <span>{{ formatPrice(normalisedPrice, saleData.itemType) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm"
      v-if="!loading && filteredAttributes.length > 0 && saleData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Item Attributes</h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base mt-2">
          <tbody>
            <tr v-for="attribute in filteredAttributes" class="border-t border-gray-700">
              <td class="table-item wrap-anywhere">
                <span v-if="attribute.key.startsWith('ENCHANTMENT_')">
                  <RouterLink
                    :to="{
                      name: 'itemSales',
                      params: { itemType: saleData.itemType },
                      query: {
                        enchantment: `${attribute.key}_${attribute.value}`,
                      },
                    }"
                    class="hyperlink">
                    {{ formatEnchantment(attribute.key) }}
                  </RouterLink>
                </span>
                <span v-else>{{ formatItemType(attribute.key) }}</span>
              </td>
              <td class="table-item wrap-anywhere">
                <span v-if="attribute.key == 'POTION_EFFECT'" class="capitalize">
                  <RouterLink
                    :to="{
                      name: 'itemSales',
                      params: { itemType: saleData.itemType },
                      query: {
                        potionEffect: attribute.value,
                      },
                    }"
                    class="hyperlink">
                    {{ formatPotionEffect(attribute.value) }}
                  </RouterLink>
                </span>
                <span v-else-if="attribute.key == 'CUSTOM_DISC_SONG'" class="capitalize">
                  <RouterLink
                    :to="{
                      name: 'itemSales',
                      params: { itemType: saleData.itemType },
                      query: {
                        discName: attribute.value,
                      },
                    }"
                    class="hyperlink">
                    {{ formatCustomDisc(attribute.value) }}
                  </RouterLink>
                </span>
                <span v-else>{{ attribute.value }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="paintingData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Painting - {{ paintingData.title }}</h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <div>
          <span>By </span>
          <RouterLink
            :to="{
              name: 'gallery',
              params: { authorName: paintingData.authorName },
            }"
            class="hyperlink">
            {{ paintingData.authorName }}
          </RouterLink>
        </div>
        <RenderPainting :painting="paintingData"></RenderPainting>
        <div>Originality: {{ paintingOriginality }}</div>
      </div>
    </div>

    <div v-if="paintingData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Other sales of '{{ paintingData.title }}' painting</h4>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <RecentSales :recent-sales="paintingSales"></RecentSales>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="saleData?.containedItems.length">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Contents</h4>

      <div class="mb-6 text-gray-400">The items inside the shulker box or bundle</div>

      <div class="mb-3 font-normal text-gray-400">
        <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
          <thead class="text-white">
            <tr>
              <th class="table-item">Slot</th>
              <th class="table-item">Item</th>
              <th class="table-item"><span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span></th>
              <th class="table-item">Attributes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subItem in saleData.containedItems" class="border-t border-gray-700">
              <td class="table-item">
                {{ subItem.slot != null ? subItem.slot + 1 : "" }}
              </td>
              <td class="table-item wrap-anywhere">
                {{ formatItemType(subItem.itemType) }}
              </td>
              <td class="table-item">{{ subItem.quantity }}</td>
              <td class="table-item wrap-anywhere">
                <div
                  v-for="attribute in subItem.itemAttributes.sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value))">
                  {{ formatItemType(attribute.key) }} : {{ attribute.value }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
