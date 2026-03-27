<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { computed, onMounted, ref } from "vue";
import { normalisePrice, simpleNormalisedPrice, type NormalisedPrice } from "@/utilities/normalise-price";
import Loading from "@/components/Loading.vue";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatPotionEffect } from "@/utilities/potion-format";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import PaintingOverview from "@/components/PaintingOverview.vue";
import RenderPainting from "@/components/RenderPainting.vue";

const props = defineProps({
  id: String,
});

interface SoldItem {
  id: string;
  itemType: string;
  quantity: number;
  isEnchanted: boolean;
  itemAttributes: ItemAttribute[];
  customName: string | null;
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

const loading = ref(true);
const saleData = ref(null as SaleData | null);
const normalisedPrice = ref({ quantity: 0, price: 0 } as NormalisedPrice);
const paintingID = ref(null as string | undefined | null);
const paintingOriginality = ref(null as string | undefined | null);

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
  paintingID.value = saleData.value.itemAttributes.find((a) => a.key == "PAINTING_ID")?.value;
  paintingOriginality.value = saleData.value.itemAttributes.find((a) => a.key == "PAINTING_ORIGINALITY")?.value;
});

let filteredAttributes = computed(() => {
  // Exclude painting attributes, as we'll render them separately
  return (saleData.value?.itemAttributes.filter((a) => !a.key.startsWith("PAINTING_")) ?? []).sort(
    (a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value)
  );
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Sale Overview</h4>

      <Loading v-if="loading" :loader-type="'text'"></Loading>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4" v-if="saleData != null">
        <!-- Basic info- date & sale type -->
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

        <!-- Item info- quantity, item, price, name -->
        <div>
          <!-- Custom name -->
          <div v-if="saleData.customName" class="text-gray-400 italic">
            <span>{{ saleData.customName }}</span>
          </div>

          <!-- Quantity, item type, price -->
          <div class="text-white">
            <span>{{ saleData.quantity }}&nbsp;</span>

            <RouterLink :to="{ name: 'itemSales', params: { itemType: saleData.itemType } }" class="hyperlink">
              {{ formatItemType(saleData.itemType) }}
            </RouterLink>

            <span v-if="paintingOriginality">&nbsp;({{ paintingOriginality }})</span>

            <span>&nbsp;bought for {{ saleData.totalPrice }} 💎</span>
          </div>
        </div>

        <!-- Comparison price -->
        <div>
          <div>Comparison Price</div>
          <div>{{ simpleNormalisedPrice(normalisePrice(saleData.totalPrice, saleData.quantity)) }}</div>
        </div>

        <!-- Item attributes -->
        <div class="mt-4">
          <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Item Attributes</h4>

          <div v-if="filteredAttributes.length == 0">No additional information (enchantments, effects, etc.)</div>
          <div v-else class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
            <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base mt-2">
              <tbody>
                <tr v-for="attribute in filteredAttributes" class="border-t border-gray-700">
                  <td class="table-item wrap-anywhere">
                    {{ formatItemType(attribute.key) }}
                  </td>

                  <td class="table-item wrap-anywhere">
                    <span v-if="attribute.key == 'POTION_EFFECT'" class="capitalize">
                      <RouterLink
                        :to="{ name: 'itemSales', params: { itemType: saleData.itemType }, query: { potionEffect: attribute.value } }"
                        class="hyperlink">
                        {{ formatPotionEffect(attribute.value) }}
                      </RouterLink>
                    </span>
                    <span v-else-if="attribute.key == 'CUSTOM_DISC_SONG'" class="capitalize">
                      <RouterLink
                        :to="{ name: 'itemSales', params: { itemType: saleData.itemType }, query: { discName: attribute.value } }"
                        class="hyperlink">
                        {{ formatCustomDisc(attribute.value) }}
                      </RouterLink>
                    </span>
                    <span v-else-if="attribute.key == 'ENCHANTMENT'" class="capitalize">
                      <RouterLink
                        :to="{ name: 'itemSales', params: { itemType: saleData.itemType }, query: { enchantment: attribute.value } }"
                        class="hyperlink">
                        {{ formatEnchantment(attribute.value) }}
                      </RouterLink>
                    </span>
                    <span v-else>{{ attribute.value }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Painting -->
    <PaintingOverview v-if="paintingID" :painting-id="paintingID"></PaintingOverview>

    <!-- Container items -->
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
                <!-- Custom name -->
                <div v-if="subItem.customName" class="text-xs md:text-sm italic">
                  <span>{{ subItem.customName }}</span>
                </div>

                <!-- Item type -->
                <div>
                  {{ formatItemType(subItem.itemType) }}
                </div>
              </td>
              <td class="table-item">{{ subItem.quantity }}</td>
              <td class="table-item wrap-anywhere">
                <div
                  v-for="attribute in subItem.itemAttributes.sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value))">
                  <span v-if="attribute.key != 'PAINTING_ID'">
                    {{ formatItemType(attribute.key) }}:
                  </span>

                  <span v-if="attribute.key == 'POTION_EFFECT'" class="capitalize">
                    <RouterLink
                      :to="{ name: 'itemSales', params: { itemType: subItem.itemType }, query: { potionEffect: attribute.value } }"
                      class="hyperlink">
                      {{ formatPotionEffect(attribute.value)?.toLocaleLowerCase() }}
                    </RouterLink>
                  </span>
                  <span v-else-if="attribute.key == 'CUSTOM_DISC_SONG'" class="capitalize">
                    <RouterLink
                      :to="{ name: 'itemSales', params: { itemType: subItem.itemType }, query: { discName: attribute.value } }"
                      class="hyperlink">
                      {{ formatCustomDisc(attribute.value)?.toLocaleLowerCase() }}
                    </RouterLink>
                  </span>
                  <span v-else-if="attribute.key == 'ENCHANTMENT'" class="capitalize">
                    <RouterLink
                      :to="{ name: 'itemSales', params: { itemType: subItem.itemType }, query: { enchantment: attribute.value } }"
                      class="hyperlink">
                      {{ formatEnchantment(attribute.value) }}
                    </RouterLink>
                  </span>
                  <span v-else-if="attribute.key == 'PAINTING_AUTHOR_NAME'">
                    <RouterLink :to="{ name: 'gallery', params: { authorName: attribute.value } }" class="hyperlink">
                      {{ attribute.value }}
                    </RouterLink>
                  </span>
                  <span v-else-if="attribute.key == 'PAINTING_ID'">
                    <RouterLink :to="{ name: 'painting', params: { id: attribute.value } }" class="hyperlink">
                      <div class="h-[256px] w-[256px]">
                        <RenderPainting :painting-id="attribute.value"></RenderPainting>
                      </div>
                    </RouterLink>
                  </span>
                  <span v-else>{{ attribute.value }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
