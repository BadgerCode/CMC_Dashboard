<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { computed, onMounted, ref, watch } from "vue";
import type { DropdownOption } from "./DropdownFilter.vue";
import DropdownFilter from "./DropdownFilter.vue";
import SearchBox from "./SearchBox.vue";
import type { CustomDiscStats } from "@/api/customDiscs/customDiscs";
import { itemsStore } from "@/store/items-state";
import * as CustomDiscsAPI from "@/api/customDiscs/api";
import { formatNumber } from "@/utilities/number-format";

const filteredDiscs = ref([] as CustomDiscStats[]);
// TODO: Pagination
const paginatedDiscs = computed(() => applySort(filteredDiscs.value));

// Filter: Source
const sourceOptions = ref([] as DropdownOption[]);
const sourceFilter = ref([] as string[]);

watch(sourceFilter, async (_, __) => {
  applyFilters();
});

// Filter: Version
const versionOptions = ref([] as DropdownOption[]);
const versionFilter = ref([] as string[]);

watch(versionFilter, async (_, __) => {
  applyFilters();
});

// Filter: Disc name
const nameFilter = ref("");

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

function applySort(items: CustomDiscStats[]) {
  items.sort((a, b) => {
    let first = sortAscending.value ? a : b;
    let second = sortAscending.value ? b : a;

    let sortResult = 0;
    if (sortProperty.value == "numSales") sortResult = first.numSales - second.numSales;
    else if (sortProperty.value == "averagePrice") sortResult = first.averagePrice - second.averagePrice;

    return sortResult || first.discName.localeCompare(second.discName);
  });

  return items;
}


// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  await CustomDiscsAPI.retrieveCustomDiscStats();
  applyFilters();
});

function applyFilters() {
  console.log("Apply Filters");
  filteredDiscs.value = itemsStore.customDiscStats;
  // TODO: Filters
}
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="flex flex-row flex-wrap gap-1 items-end mb-2">
      <DropdownFilter :placeholder="'Source'" :icon="'fa-solid fa-user'" :options="sourceOptions"
        v-model="sourceFilter">
      </DropdownFilter>


      <DropdownFilter :placeholder="'Version'" :icon="'fa-solid fa-flask'" :options="versionOptions"
        v-model="versionFilter">
      </DropdownFilter>

      <SearchBox :placeholder="'Disc Name'" v-model="nameFilter"></SearchBox>
    </div>

    <div class="max-h-[400px] overflow-y-auto">
      <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
        <thead class="table-head">
          <tr>
            <th class="table-item">
              <span>Name</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('displayName', false)" />
            </th>
            <th class="table-item">
              <span>Sales</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('numSales', false)" />
            </th>
            <th class="table-item hidden md:table-cell">
              <span>Price</span>
              <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
                @click="sort('averagePrice', false)" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="disc in paginatedDiscs" class="stripped-row">
            <td class="table-item">{{ disc.discName }}</td> <!-- TODO: Fancy name-->
            <td class="table-item">{{ disc.numSales }}</td>
            <td class="table-item" v-if="disc.numSales == 1">{{ disc.maxPrice }} 💎</td>
            <td class="table-item" v-else>
              <div>{{ disc.minPrice }} - {{ disc.maxPrice }} 💎</div>
              <div>Average: {{ formatNumber(disc.averagePrice, 2) }} 💎</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
