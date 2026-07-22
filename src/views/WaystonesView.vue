<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import { initFlowbite } from "flowbite";
import Loading from "@/components/Loading.vue";
import { formatDate } from "@/utilities/date-format";
import * as WaystoneAPI from "@/api/waystones/api";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import SearchBox from "@/components/SearchBox.vue";
import Checkbox from "@/components/Checkbox.vue";

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

// New waystones filter
const newFilter = ref(false);
watch(newFilter, async (_, __) => {
  applyFilters();
});

// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load previous week's waystone ranks
  let previousRanks = await loadPreviousWeekStats();

  // Load waystones
  let serverWaystoneInfo = await WaystoneAPI.loadWaystones();
  // Order waystones to get their rank
  let waystones = serverWaystoneInfo.waystones.sort(
    (a, b) => b.visitsThisWeek - a.visitsThisWeek || b.visitsTotal - a.visitsTotal || a.name.localeCompare(b.name),
  );
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
      visitsThisWeek: Number(waystone.visitsThisWeek),
      visitsTotal: Number(waystone.visitsTotal),
      previousRankChange: previousRank == undefined ? null : previousRank - (i + 1),
    });
  }

  // Initialise filters
  worldFilterOptions.value = serverWaystoneInfo.worlds.map((w) => ({ text: formatWorldName(w), value: w }) as DropdownOption);
  worldFilter.value = serverWaystoneInfo.worlds;

  // Render
  applyFilters();
  applySort();

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

//
// Waystone stats
const minStartDate = Date.UTC(2025, 10, 13, 0, 0, 0); // No records before this date

async function loadPreviousWeekStats(): Promise<{ [id: string]: number }> {
  let date = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  if (date.getTime() < minStartDate) date = new Date(minStartDate);

  // List of stats
  let stats = (await WaystoneAPI.loadWaystoneStats(date)).stats.sort(
    (a, b) => b.visitsThisWeek - a.visitsThisWeek || b.visitsTotal - a.visitsTotal || a.name.localeCompare(b.name),
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

      // New waystones filter (no previous rank)
      if (newFilter.value && w.previousRankChange != null) return false;

      return true;
    }),
  );

  applySort();
}

// Sorting
let sortProperty = "rank";
let sortAscending = true;
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
    if (sortProperty == "rank") sortResult = first.rank - second.rank;
    else if (sortProperty == "visitsThisWeek") sortResult = first.visitsThisWeek - second.visitsThisWeek;
    else if (sortProperty == "visitsTotal") sortResult = first.visitsTotal - second.visitsTotal;

    return sortResult || first.name.localeCompare(second.name);
  });
}

const prettyWorldNames = {
  world: "Overworld",
  world_nether: "The Nether",
  world_the_end: "The End",
} as { [worldName: string]: string };
function formatWorldName(worldName: string) {
  return prettyWorldNames[worldName] || worldName.replace(/_/g, " ").toLocaleLowerCase();
}
</script>

<template>
  <div class="flex flex-row flex-wrap justify-between items-end mb-8">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Waystones</h1>
      <p class="text-gray-300">Information and rankings for publicly visible waystones.</p>
    </div>

    <div class="pb-4">
      <RouterLink :to="{ name: 'map' }" class="hyperlink">World map</RouterLink>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-start justify-between pb-4">
    <div class="flex flex-row flex-wrap gap-2 items-center">
      <DropdownFilter :placeholder="'World'" :icon="'fa-solid fa-globe'" :options="worldFilterOptions" v-model="worldFilter">
      </DropdownFilter>

      <Checkbox :label="'New Waystones'" v-model="newFilter"></Checkbox>
    </div>

    <div>
      <SearchBox :placeholder="'Waystone name'" v-model="nameFilter"></SearchBox>
    </div>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
  <div v-else class="relative overflow-x-auto">
    <div class="text-gray-400">
      <div>{{ filteredWaystones.length }} waystones</div>
      <div class="hint-text">Last updated {{ formatDate(lastUpdated, "") }}</div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <!-- Rank and tooltip -->
          <th class="table-item">
            <span>Rank</span>

            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('rank', true)" />

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

          <!-- Visit this week -->
          <th class="table-item">
            <span>Visits This Week</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsThisWeek', false)" />
          </th>

          <!-- Total visits -->
          <th class="table-item">
            <span>Visits</span>
            <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsTotal', false)" />
          </th>

          <!-- Location -->
          <!-- Mobile -->
          <th class="table-item table-cell md:hidden">Location</th>

          <!-- Desktop -->
          <th class="table-item hidden md:table-cell">Location</th>
          <th class="table-item hidden md:table-cell">World</th>
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

          <!-- Visits this week -->
          <td class="table-item">
            <span>{{ waystone.visitsThisWeek.toLocaleString() }}</span>
          </td>

          <!-- Total visits -->
          <td class="table-item">{{ waystone.visitsTotal.toLocaleString() }}</td>

          <!-- Location -->
          <!-- Mobile -->
          <td class="table-item table-cell md:hidden">
            <div>{{ waystone.x }}, {{ waystone.z }}</div>
            <div>{{ waystone.world }}</div>
          </td>

          <!-- Desktop -->
          <td class="table-item hidden md:table-cell">{{ waystone.x }}, {{ waystone.z }}</td>
          <td class="table-item hidden md:table-cell capitalize">{{ formatWorldName(waystone.world) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
