<script setup lang="ts">
import { onMounted, onUpdated, ref, watch, withScopeId } from "vue";
import { initFlowbite } from "flowbite";
import Loading from "@/components/Loading.vue";
import { formatDate } from "@/utilities/date-format";
import * as WaystoneAPI from "@/api/waystones/api";
import type { Waystone } from "@/api/waystones/waystone";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import SearchBox from "@/components/SearchBox.vue";

const loading = ref(true);
const waystones = ref([] as Waystone[]);
const filteredWaystones = ref([] as Waystone[]);
const lastUpdated = ref("");

// Name filter
const nameFilter = ref("");

watch(nameFilter, async (_, __) => {
  applyFilters();
});


// World filter
const worldFilterOptions = ref([] as DropdownOption[]);
const worldFilter = ref([] as string[]);
const worldFilterDefaultSelection = ref([] as string[]);

watch(worldFilter, async (_, __) => {
  applyFilters();
});


// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  let response = await WaystoneAPI.loadWaystones();
  waystones.value = response.waystones;
  lastUpdated.value = response.lastUpdated;

  // Initialise filters
  worldFilterOptions.value = response.worlds.map(w => ({ text: w, value: w } as DropdownOption));
  worldFilter.value = response.worlds;
  worldFilterDefaultSelection.value = response.worlds;

  // Render
  applyFilters();
  sort("visitsThisWeek", false);

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});


// Filtering
function applyFilters() {
  filteredWaystones.value.splice(0);

  filteredWaystones.value.push(
    ...waystones.value.filter((w) => {
      // Apply world filter
      if (!worldFilter.value.includes(w.world)) return false;

      // Apply name filter
      let trimmedNameFilter = nameFilter.value.trim().toLocaleLowerCase();
      if (trimmedNameFilter.length > 0 && !w.name.toLocaleLowerCase().includes(trimmedNameFilter)) return false;

      return true;
    })
  );
}


// Sorting
let sortProperty = "";
let sortAscending = false;
function sort(property: string, ascendingByDefault: boolean) {
  if (sortProperty == property) sortAscending = !sortAscending;
  else {
    sortProperty = property;
    sortAscending = ascendingByDefault;
  }

  if (waystones.value == null) return;

  waystones.value.sort((a, b) => {
    let first = sortAscending ? a : b;
    let second = sortAscending ? b : a;

    let sortResult = 0;
    if (sortProperty == "visitsThisWeek")
      sortResult = first.visitsThisWeek - second.visitsThisWeek;
    else if (sortProperty == "visitsTotal")
      sortResult = first.visitsTotal - second.visitsTotal;

    return sortResult || first.name.localeCompare(second.name);
  });
}
</script>

<template>
  <div class="flex flex-row flex-wrap justify-between items-end mb-8">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Waystones</h1>
      <p class="text-gray-300">Public waystone information.</p>
    </div>

    <div class="pb-4">
      <a href="https://callmecarson.live/subserver/map/" target="_blank" class="hyperlink">
        World map
      </a>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
    <div class="flex flex-row flex-wrap gap-1">
      <DropdownFilter :placeholder="'World'" :icon="'fa-solid fa-globe'"
        :default-selection="worldFilterDefaultSelection" :options="worldFilterOptions" v-model="worldFilter">
      </DropdownFilter>
    </div>

    <div>
      <SearchBox :placeholder="'Waystone name'" v-model="nameFilter"></SearchBox>
    </div>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
  <div v-else class="relative overflow-x-auto">
    <div class="text-gray-400">
      <div class="text-gray-500 text-xs">
        Last updated {{ formatDate(lastUpdated, "") }}
      </div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="text-white">
        <tr>
          <th class="table-cell">World</th>
          <th class="table-cell">
            <span>Name</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
              @click="sort('name', true)" />
          </th>
          <th class="table-cell">Location</th>
          <th class="table-cell">
            <span>Visits This Week</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
              @click="sort('visitsThisWeek', false)" />
          </th>
          <th class="table-cell">
            <span>Visits</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer"
              @click="sort('visitsTotal', false)" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="waystone in filteredWaystones" class="border-t border-gray-700">
          <td class="table-cell">{{ waystone.world }}</td>
          <td class="table-cell">{{ waystone.name }}</td>
          <td class="table-cell">{{ waystone.x }}, {{ waystone.z }}</td>
          <td class="table-cell">{{ waystone.visitsThisWeek }}</td>
          <td class="table-cell">{{ waystone.visitsTotal }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
