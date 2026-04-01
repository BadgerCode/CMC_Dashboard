<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { computed, onMounted, ref, watch } from "vue";
import type { DropdownOption } from "./DropdownFilter.vue";
import DropdownFilter from "./DropdownFilter.vue";
import SearchBox from "./SearchBox.vue";
import { itemsStore, type CustomMusicDisc } from "@/store/items-state";
import * as CustomDiscsAPI from "@/api/customDiscs/api";
import { formatNumber } from "@/utilities/number-format";
import Loading from "./Loading.vue";

defineEmits<{
  (e: "selection", discName: string): void;
}>();

const loading = ref(true);

const filteredDiscs = ref([] as CustomMusicDisc[]);

// Pagination
const pageNumber = ref(1);
const paginatedDiscs = computed(() => applySort(filteredDiscs.value).slice(0, Math.min(50 * pageNumber.value, filteredDiscs.value.length)));

// Setup
onMounted(async () => {
  loading.value = true;
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  await CustomDiscsAPI.retrieveCustomDiscStats();
  applyFilters();
  loading.value = false;
});

//
// Filter: Source
const sourceOptions = computed(() =>
  [...itemsStore.customMusicDiscSources].sort().map(
    (v) =>
      ({
        text: v,
        value: v,
      }) as DropdownOption,
  ),
);
const sourceFilter = ref([] as string[]);

watch(sourceFilter, async (_, __) => {
  applyFilters();
});

//
// Filter: Version
const versionOptions = computed(() =>
  [...itemsStore.customMusicDiscVersions].sort().map(
    (v) =>
      ({
        text: v,
        value: v,
      }) as DropdownOption,
  ),
);
const versionFilter = ref([] as string[]);

watch(versionFilter, async (_, __) => {
  applyFilters();
});

//
// Filter: Disc name
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  applyFilters();
});

// Sorting
let sortProperty = ref("latestSale");
let sortAscending = ref(false);
function sort(property: string, ascendingByDefault: boolean) {
  if (sortProperty.value == property) sortAscending.value = !sortAscending.value;
  else {
    sortProperty.value = property;
    sortAscending.value = ascendingByDefault;
  }
}

function applySort(items: CustomMusicDisc[]) {
  items.sort((a, b) => {
    // Negative = a,b. Positive = b,a. 0 = a,b
    let first = sortAscending.value ? a : b;
    let second = sortAscending.value ? b : a;
    let sortResult = 0;

    // Sales
    if (sortProperty.value == "numSales") sortResult = first.numSales - second.numSales;
    // Average price
    else if (sortProperty.value == "averagePrice") sortResult = first.averagePrice - second.averagePrice;
    else if (sortProperty.value == "latestSale") sortResult = (first.latestSale ?? "")?.localeCompare(second.latestSale ?? "");

    // Otherwise name
    return (sortResult || (first.displayName).localeCompare(second.displayName));
  });

  return items;
}

function applyFilters() {
  pageNumber.value = 1;
  filteredDiscs.value = Object.values(itemsStore.customMusicDiscs).filter((d) => {
    // Source (artist/game)
    if (sourceFilter.value.length && !sourceFilter.value.includes(d.source)) return false;

    // Version (5.0, 5.1)
    if (versionFilter.value.length && !versionFilter.value.includes(d.version)) return false;

    // Name
    let nameFilterLower = nameFilter.value.toLocaleLowerCase();
    if (
      nameFilter.value.length &&
      !d.displayName?.toLocaleLowerCase().includes(nameFilterLower) &&
      !d.name.includes(nameFilterLower)
    )
      return false;

    return true;
  });
}
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="flex flex-row flex-wrap gap-1 items-end mb-2">
      <DropdownFilter :placeholder="'Source'" :icon="'fa-solid fa-user'" :options="sourceOptions"
        v-model="sourceFilter"> </DropdownFilter>

      <DropdownFilter :placeholder="'Version'" :icon="'fa-solid fa-flask'" :options="versionOptions"
        v-model="versionFilter">
      </DropdownFilter>

      <SearchBox :placeholder="'Disc Name'" v-model="nameFilter"></SearchBox>
    </div>

    <div class="hint-text mb-2">Select a disc to filter the sales and shops tables lower on the page.</div>

    <div class="max-h-[400px] overflow-y-auto">
      <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
        <thead class="table-head">
          <tr>
            <th class="table-item">
              <span>Name</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('displayName', true)" />
            </th>
            <th class="table-item">
              <span>Sales</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('numSales', false)" />
            </th>
            <th class="table-item">
              <span>Price</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('averagePrice', false)" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="disc in paginatedDiscs" class="stripped-row">
            <!-- Disc name -->
            <td class="table-item wrap-anywhere">
              <div>
                <a class="hyperlink" @click="$emit('selection', disc.name)">
                  {{ disc.displayName }}
                </a>
              </div>
              <div class="hint-text">{{ disc.name.replace("smponline_discs:", "") }}</div>
            </td>

            <!-- Num sales -->
            <td class="table-item">{{ disc.numSales }}</td>

            <!-- Price -->
            <!-- No sales = empty -->
            <td class="table-item" v-if="disc.numSales == 0"></td>

            <!-- 1 sale = max price -->
            <td class="table-item text-nowrap" v-else-if="disc.numSales == 1">
              <div>{{ formatNumber(disc.maxPrice, 2) }} 💎</div>
            </td>

            <!-- Otherwise, show min/max/average -->
            <td class="table-item" v-else>
              <!-- Price range (Mobile) -->
              <div class="flex flex-col md:hidden pb-1 text-nowrap">
                <div>Min</div>
                <div class="pb-1">{{ formatNumber(disc.minPrice, 2) }} 💎</div>

                <div>Max</div>
                <div>{{ formatNumber(disc.maxPrice, 2) }} 💎</div>
              </div>

              <!-- Price range (Desktop) -->
              <div class="hidden md:block">
                {{ formatNumber(disc.minPrice, 2) }}-{{ formatNumber(disc.maxPrice, 2) }} 💎
              </div>

              <!-- Average (mobile/desktop) -->
              <div class="hint-text flex flex-col md:flex-row md:gap-1 text-nowrap">
                <span>Average </span>
                <span>{{ formatNumber(disc.averagePrice, 2) }} 💎</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <Loading v-if="loading" :fill-space="true"></Loading>

      <div class="mt-2 text-center p-2">
        <div v-if="paginatedDiscs.length == 0">No discs found</div>
        <button type="button" class="button" v-on:click="pageNumber++"
          v-else-if="paginatedDiscs.length < filteredDiscs.length">
          More
        </button>
        <div v-else>No more results</div>
      </div>
    </div>
  </div>
</template>
