<script setup lang="ts">
import { onMounted, onUpdated, ref, withScopeId } from "vue";
import { initFlowbite } from "flowbite";
import Loading from "@/components/Loading.vue";
import { formatDate } from "@/utilities/date-format";
import * as WaystoneAPI from "@/api/waystones/api";
import type { ServerWaystones } from "@/api/waystones/waystone";

const loading = ref(true);
const waystones = ref(null as ServerWaystones | null);

// Setup
onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  waystones.value = await WaystoneAPI.loadWaystones();
  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});
</script>

<template>
  <div class="text-gray-500">This page is a work in progress</div>

  <div class="flex flex-row justify-between items-end mb-8">
    <div>
      <h1 class="text-3xl font-bold">Waystones</h1>
      <p class="text-gray-300">Public waystone information.</p>
    </div>
  </div>

  <div class="text-gray-400">
    <div class="text-gray-500 text-xs" v-if="!loading">
      Last updated {{ formatDate(waystones?.lastUpdated, "") }}
    </div>
  </div>

  <div class="relative overflow-x-auto" v-if="!loading">
    <table
      class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base"
    >
      <thead class="text-white">
        <tr>
          <th class="table-cell">World</th>
          <th class="table-cell">Name</th>
          <th class="table-cell">Location</th>
          <th class="table-cell">Visits This Week</th>
          <th class="table-cell">Total Visits</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(worldWaystones, worldName) in waystones?.worlds">
          <tr
            v-for="waystone in worldWaystones.sort(
              (a, b) => b.visitsThisWeek - a.visitsThisWeek || a.name.localeCompare(b.name)
            )"
            class="border-t border-gray-700"
          >
            <td class="table-cell">{{ worldName }}</td>
            <td class="table-cell">{{ waystone.name }}</td>
            <td class="table-cell">{{ waystone.x }}, {{ waystone.z }}</td>
            <td class="table-cell">{{ waystone.visitsThisWeek }}</td>
            <td class="table-cell">{{ waystone.visitsTotal }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
</template>
