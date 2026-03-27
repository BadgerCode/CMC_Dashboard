<script setup lang="ts">
import { formatItemType } from "@/utilities/item-type-format";
import type { ShopData, ShopItem } from "@/api/shops/shopdata";
import { computed, onMounted, onUpdated, ref, watch } from "vue";
import { normalisePrice, simpleNormalisedPrice } from "@/utilities/normalise-price";
import ItemAttributeDisplay from "./ItemAttributeDisplay.vue";
import { initFlowbite } from "flowbite";
import { formatPotionEffect } from "@/utilities/potion-format";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatCustomDisc } from "@/utilities/custom-disc-format";

interface Props {
  shops: ShopData[];
  hideBuySell?: boolean;
}
const props = defineProps<Props>();
const maxShops = 100;

const pageNumber = ref(1);
const paginatedShops = computed(() => applySort(props.shops).slice(0, Math.min(maxShops * pageNumber.value, props.shops.length)));

watch(props.shops, async (_, __) => {
  pageNumber.value = 1;
});

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

// Sorting
let sortProperty = ref("");
let sortAscending = ref(false);
function sort(property: string, ascendingByDefault: boolean) {
  if (sortProperty.value == property) sortAscending.value = !sortAscending.value;
  else {
    sortProperty.value = property;
    sortAscending.value = ascendingByDefault;
  }
}

function applySort(items: ShopData[]) {
  items.sort((a, b) => {
    let first = sortAscending.value ? a : b;
    let second = sortAscending.value ? b : a;

    let sortResult = 0;
    if (sortProperty.value == "price") sortResult = first.item.quantity / first.price - second.item.quantity / second.price;

    return sortResult || first.id - second.id;
  });

  return items;
}

function childItemsSummary(items: ShopItem[]): string {
  let summary = "";

  let counts = {} as { [itemType: string]: number };
  for (const item of items) {
    let key = item.type;
    counts[key] ??= 0;
    counts[key]! += item.quantity;
  }

  summary += Object.keys(counts)
    .map((itemType) => `${counts[itemType]} ${formatItemType(itemType)}`)
    .join("\n");

  return summary;
}

function groupedChildItems(items: ShopItem[]): ShopItem[] {
  let groups = {} as { [itemType: string]: ShopItem };
  let groupedItems = [] as ShopItem[];

  for (const item of items) {
    // Don't group enchanted items or bundles
    if (item.parsedSNBT.enchantments.length > 0 || (item.childItems?.length ?? 0) > 0) {
      groupedItems.push(item);
      continue;
    }

    // Determine key. Group by item type by default
    let key: string = item.type;

    // Player paintings
    if (item.parsedSNBT.paintingID != null) key = item.parsedSNBT.paintingID!;
    // Blank canvas or default painting
    else if (item.type == "PAINTING")
      key = item.name; // TODO: return painting size from API and custom format `Blank Canvas (LARGE)`
    // Potions
    else if (item.parsedSNBT.potionEffect != null) key = `${item.type}-${item.parsedSNBT.potionEffect}`;
    // Music discs
    else if (item.parsedSNBT.customDiscSong != null) key = item.parsedSNBT.customDiscSong;
    // Player heads
    else if (item.parsedSNBT.playerHeadPlayerName != null) key = `${item.parsedSNBT.playerHeadPlayerName}-${item.name}`;
    // Written books
    else if (item.parsedSNBT.writtenBookTitle != null) key = `${item.parsedSNBT.writtenBookAuthor}-${item.parsedSNBT.writtenBookTitle}`;

    // Initialise group
    groups[key] ??= { name: item.name, quantity: 0, type: item.type, parsedSNBT: item.parsedSNBT };

    // Update group
    let group = groups[key]!;
    group.quantity += item.quantity;
  }

  groupedItems.push(...Object.values(groups));
  return groupedItems;
}
</script>

<template>
  <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
    <thead class="table-head">
      <tr>
        <!-- Basic details -->
        <th class="table-item" v-if="!hideBuySell">
          <font-awesome-icon icon="fa-solid fa-arrows-left-right" />
        </th>
        <th class="table-item">Item</th>

        <!-- Price columns -->
        <!-- Mobile -->
        <th class="table-item md:hidden">
          <span>Details</span>
          <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('price', false)" />
        </th>

        <!-- Desktop -->
        <th class="table-item hidden md:table-cell">
          <span>Price</span>
          <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('price', false)" />
        </th>
        <th class="table-item hidden md:table-cell pr-4">Batch<br />Size</th>
        <th class="table-item hidden md:table-cell">Stock</th>

        <!-- Location -->
        <th class="table-item">Location</th>

        <!-- Owner (desktop) -->
        <th class="table-item hidden md:table-cell">Owner</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="shop in paginatedShops" class="stripped-row">
        <td class="table-item" v-if="!hideBuySell">THEY {{ shop.type.replace(/ING/g, "") }}</td>

        <!-- Item name & key attributes -->
        <td class="table-item wrap-anywhere">
          <!-- Item name -->
          <div class="text-white">
            {{ shop.item.name }}
          </div>

          <!-- Item type -->
          <div class="text-xs md:text-sm">
            <RouterLink :to="{ name: 'itemSales', params: { itemType: shop.item.type } }" class="hyperlink">
              {{ formatItemType(shop.item.type).toLocaleUpperCase() }}
            </RouterLink>
          </div>

          <!-- Item attributes -->
          <ItemAttributeDisplay :snbt="shop.item.parsedSNBT" class="text-xs md:text-sm capitalize mt-2"></ItemAttributeDisplay>

          <!-- Summary of container contents -->
          <div v-if="(shop.item.childItems?.length ?? 0) > 0" class="text-xs capitalize whitespace-pre-line">
            {{ childItemsSummary(shop.item.childItems!) }}
          </div>

          <div v-if="(shop.item.childItems?.length ?? 0) > 0" data-accordion="collapse" class="overflow-hidden text-xs">
            <!-- Container contents dropdown header -->
            <h2 :id="`shop-shulkeritems-header-${shop.id}`">
              <button
                type="button"
                class="flex items-center font-medium rtl:text-right text-body hover:text-heading hover:bg-neutral-secondary-medium gap-1 cursor-pointer"
                :data-accordion-target="`#shop-shulkeritems-body-${shop.id}`"
                aria-expanded="false"
                :aria-controls="`shop-shulkeritems-body-${shop.id}`">
                <span>Details</span>
                <font-awesome-icon data-accordion-icon icon="fa-solid fa-angle-up" class="w-5 h-5 rotate-180 shrink-0" />
              </button>
            </h2>

            <!-- Container contents -->
            <div :id="`shop-shulkeritems-body-${shop.id}`" class="hidden" :aria-labelledby="`shop-shulkeritems-header-${shop.id}`">
              <div class="p-2">
                <div v-for="child in groupedChildItems(shop.item.childItems ?? [])" class="text-body mb-1">
                  <!-- Enchanted items -->
                  <div v-if="child.parsedSNBT.enchantments.length > 0">
                    <div>
                      <span>{{ child.name }}&nbsp;</span>
                      <span>({{ formatItemType(child.type) }})</span>
                    </div>
                    <div class="capitalize">
                      {{ child.parsedSNBT.enchantments.map((e) => formatEnchantment(e)).join(", ") }}
                    </div>
                  </div>

                  <!-- Potions -->
                  <div v-else-if="child.parsedSNBT.potionEffect != null" class="capitalize">
                    {{ child.quantity }}x {{ formatPotionEffect(child.parsedSNBT.potionEffect) }}
                    {{ formatItemType(child.type) }}
                  </div>

                  <!-- Custom music discs -->
                  <div v-else-if="child.parsedSNBT.customDiscSong != null" class="capitalize">
                    {{ child.quantity }}x {{ formatCustomDisc(child.parsedSNBT.customDiscSong) }}
                  </div>

                  <!-- Player heads -->
                  <div v-else-if="child.parsedSNBT.playerHeadPlayerName != null" class="capitalize">
                    {{ child.quantity }}x {{ child.name }} ({{ child.parsedSNBT.playerHeadPlayerName }})
                  </div>

                  <!-- Paintings -->
                  <div v-else-if="child.type == 'PAINTING'">
                    <!-- Blank canvases or default paintings -->
                    <span v-if="child.parsedSNBT.paintingID == null">{{ child.quantity }}x {{ child.name }}</span>

                    <!-- Player paintings -->
                    <span v-else>
                      <div>
                        <span>{{ child.quantity }}x Painting&nbsp;</span>
                        <span>
                          <RouterLink :to="{ name: 'painting', params: { id: child.parsedSNBT.paintingID } }" class="hyperlink">{{
                            child.parsedSNBT.paintingTitle
                          }}</RouterLink>
                        </span>
                        <span>&nbsp;({{ child.parsedSNBT.paintingOriginality }})</span>
                      </div>
                      <div>by {{ child.parsedSNBT.paintingAuthor }}</div>
                    </span>
                  </div>

                  <!-- Bundles -->
                  <div v-else-if="(child.childItems?.length ?? 0) > 0">
                    <div>{{ child.name }} (({{ formatItemType(child.type) }}))</div>
                    <div>{{ child.childItems?.length }} items</div>
                  </div>

                  <!-- All other item types -->
                  <div v-else>{{ child.quantity }}x {{ formatItemType(child.type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </td>

        <!-- Price columns -->
        <!-- Mobile -->
        <td class="table-item table-cell md:hidden">
          <div class="text-nowrap">{{ simpleNormalisedPrice(normalisePrice(shop.price, shop.item.quantity)) }}</div>

          <div class="mt-2">Batch size:</div>
          <div>{{ shop.item.quantity }}</div>

          <div class="mt-2">Stock:</div>
          <div>x{{ shop.remaining }}</div>

          <div class="mt-2">Sold by:</div>
          <div>{{ shop.owner.name }}</div>
        </td>

        <!-- Desktop -->
        <td class="table-item hidden md:table-cell text-nowrap">
          {{ simpleNormalisedPrice(normalisePrice(shop.price, shop.item.quantity)) }}
        </td>
        <td class="table-item hidden md:table-cell">{{ shop.item.quantity }}</td>
        <td class="table-item hidden md:table-cell">x {{ shop.remaining }}</td>

        <!-- Location -->
        <td class="table-item">
          <div class="mr-1">{{ shop.location.x }}, {{ shop.location.y }}, {{ shop.location.z }}</div>
          <div>({{ shop.location.world }})</div>

          <div v-for="waystone in shop.nearestWaystones" class="text-xs mt-2">
            <div>
              {{ waystone.distance }} blocks
              <font-awesome-icon icon="fa-solid fa-arrow-up" :style="{ transform: 'rotate(' + waystone.directionRotation + 'deg)' }" /> of
            </div>
            <div class="wrap-anywhere">'{{ waystone.name }}'</div>
          </div>
        </td>

        <!-- Owner (desktop) -->
        <td class="table-item hidden md:table-cell wrap-anywhere">{{ shop.owner.name }}</td>
      </tr>
    </tbody>
  </table>

  <div class="mt-8 text-center p-2">
    <div v-if="paginatedShops.length == 0">No shops found</div>
    <button type="button" class="button" v-on:click="pageNumber++" v-else-if="paginatedShops.length < props.shops.length">More</button>
    <div v-else>No more results</div>
  </div>
</template>
