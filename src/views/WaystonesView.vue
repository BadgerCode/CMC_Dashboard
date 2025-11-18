<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import { initFlowbite } from "flowbite";
import Loading from "@/components/Loading.vue";
import { formatDate, formatDateNoTime } from "@/utilities/date-format";
import * as WaystoneAPI from "@/api/waystones/api";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import SearchBox from "@/components/SearchBox.vue";

interface WaystoneRow {
  rank: number;
  id: string;
  world: string;
  name: string;
  x: number;
  z: number;
  visitsThisWeek: number;
  visitsTotal: number;
  previousRankChange: number | null;
}

const loading = ref(true);

const lastUpdated = ref(new Date());
const waystoneData = ref([] as WaystoneRow[]);
const filteredWaystones = ref([] as WaystoneRow[]);

const previousWaystoneRanksDate = ref(new Date());

// Name filter
const nameFilter = ref("");

watch(nameFilter, async (_, __) => {
  applyFilters();
});

// World filter
const worldFilterOptions = ref([] as DropdownOption[]);
const worldFilter = ref([] as string[]);

watch(worldFilter, async (_, __) => {
  applyFilters();
});

// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load previous week's waystone ranks
  let previousRanks = await loadWaystoneStats();

  // Load waystones
  let serverWaystoneInfo = await WaystoneAPI.loadWaystones();
  let waystones = serverWaystoneInfo.waystones.sort((a, b) => b.visitsThisWeek - a.visitsThisWeek || a.name.localeCompare(b.name));
  lastUpdated.value = serverWaystoneInfo.lastUpdated;

  // Generate waystone rows
  waystoneData.value.splice(0);
  for (let i = 0; i < waystones.length; i++) {
    const waystone = waystones[i]!;
    let previousRank = previousRanks[waystone.id];

    waystoneData.value.push({
      rank: i + 1,
      id: waystone.id,
      name: waystone.name,
      world: waystone.world,
      x: waystone.x,
      z: waystone.z,
      visitsThisWeek: waystone.visitsThisWeek,
      visitsTotal: waystone.visitsTotal,
      previousRankChange: previousRank == undefined ? null : previousRank - (i + 1),
    });
  }

  // Initialise filters
  worldFilterOptions.value = serverWaystoneInfo.worlds.map((w) => ({ text: w, value: w } as DropdownOption));
  worldFilter.value = serverWaystoneInfo.worlds;

  // Render
  applyFilters();

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

//
// Waystone stats
const minStartDate = Date.UTC(2025, 10, 13, 0, 0, 0); // No records before this date

async function loadWaystoneStats(): Promise<{ [id: string]: number }> {
  let date = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  if (date.getTime() < minStartDate) date = new Date(minStartDate);

  // Track date
  previousWaystoneRanksDate.value = date;

  // List of stats
  let stats = (await WaystoneAPI.loadWaystoneStats(date)).sort(
    (a, b) => b.visitsThisWeek - a.visitsThisWeek || a.name.localeCompare(b.name)
  );

  var previousRanks = {} as { [id: string]: number };
  for (let i = 0; i < stats.length; i++) {
    const waystone = stats[i];
    previousRanks[waystone!.id] = i + 1;
  }

  return previousRanks;
}

// Filtering
function applyFilters() {
  if (waystoneData.value == null) return;

  filteredWaystones.value.splice(0);
  filteredWaystones.value.push(
    ...waystoneData.value.filter((w) => {
      // Apply world filter
      if (!worldFilter.value.includes(w.world)) return false;

      // Apply name filter
      let trimmedNameFilter = nameFilter.value.trim().toLocaleLowerCase();
      if (trimmedNameFilter.length > 0 && !w.name.toLocaleLowerCase().includes(trimmedNameFilter)) return false;

      return true;
    })
  );

  applySort();
}

// Sorting
let sortProperty = "visitsThisWeek";
let sortAscending = false;
function sort(property: string, ascendingByDefault: boolean) {
  if (sortProperty == property) sortAscending = !sortAscending;
  else {
    sortProperty = property;
    sortAscending = ascendingByDefault;
  }

  applySort();
}

function applySort() {
  filteredWaystones.value.sort((a, b) => {
    let first = sortAscending ? a : b;
    let second = sortAscending ? b : a;

    let sortResult = 0;
    if (sortProperty == "visitsThisWeek") sortResult = first.visitsThisWeek - second.visitsThisWeek;
    else if (sortProperty == "visitsTotal") sortResult = first.visitsTotal - second.visitsTotal;

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
      <a href="https://callmecarson.live/subserver/map/" target="_blank" class="hyperlink"> World map </a>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
    <div class="flex flex-row flex-wrap gap-1">
      <DropdownFilter :placeholder="'World'" :icon="'fa-solid fa-globe'" :options="worldFilterOptions" v-model="worldFilter">
      </DropdownFilter>
    </div>

    <div>
      <SearchBox :placeholder="'Waystone name'" v-model="nameFilter"></SearchBox>
    </div>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
  <div v-else class="relative overflow-x-auto">
    <div class="text-gray-400">
      <div class="text-gray-500 text-xs">Last updated {{ formatDate(lastUpdated, "") }}</div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <!-- Rank and tooltip -->
          <th class="table-item">
            <span>Rank</span>

            <!-- Tooltip -->
            <span class="ml-2">
              <button data-popover-target="popover-description" data-popover-placement="bottom-end" type="button" class="text-gray-400">
                <font-awesome-icon icon="fa-solid fa-circle-question" />
                <span class="sr-only">Show information</span>
              </button>

              <div
                data-popover
                id="popover-description"
                role="tooltip"
                class="absolute z-10 p-3 invisible inline-block text-sm text-body transition-opacity duration-300 bg-neutral-primary-soft border border-default rounded-base shadow-xs opacity-0 w-72 bg-gray-900">
                <div class="normal-case font-normal">
                  <p>Rankings are determined by "Visits this week".</p>
                  <p>These are compared to last week's rankings to determine changes in position.</p>
                </div>
                <div data-popper-arrow></div>
              </div>
            </span>
          </th>

          <!-- Name -->
          <th class="table-item">
            <span>Name</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('name', true)" />
          </th>

          <!-- Location -->
          <th class="table-item">Location</th>
          <th class="table-item">World</th>

          <!-- Visit stats -->
          <th class="table-item">
            <span>Visits This Week</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsThisWeek', false)" />
          </th>
          <th class="table-item">
            <span>Visits</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsTotal', false)" />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="waystone in filteredWaystones" class="stripped-row">
          <!-- Rank, changes, NEW! -->
          <td class="table-item">
            <span>{{ waystone.rank }}</span>
            <span v-if="waystone.previousRankChange == null" class="text-fuchsia-500"> (NEW!)</span>
            <span v-else-if="waystone.previousRankChange > 0" class="ml-2 text-green-500">
              <font-awesome-icon icon="fa-solid fa-arrow-up" /> {{ waystone.previousRankChange }}
            </span>
          </td>

          <!-- Name -->
          <td class="table-item wrap-anywhere">{{ waystone.name }}</td>

          <!-- Location -->
          <td class="table-item">{{ waystone.x }}, {{ waystone.z }}</td>
          <td class="table-item">{{ waystone.world }}</td>

          <!-- Stats -->
          <td class="table-item">
            <span>{{ waystone.visitsThisWeek }}</span>
          </td>
          <td class="table-item">{{ waystone.visitsTotal }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
