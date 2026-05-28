<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { initFlowbite } from "flowbite";
import { onMounted, onUpdated, ref, watch } from "vue";
import DropdownFilter, { type DropdownOption } from "@/components/DropdownFilter.vue";
import SearchWithResults from "@/components/SearchWithResults.vue";
import { formatDate } from "@/utilities/date-format";
import SearchBox from "@/components/SearchBox.vue";

interface PlayerRequest {
  id: number;
  playerName: string;
  type: "buyOrders" | "helpRequests";
  description: string;
  createdAt: string;
  buyOrder?: {
    item: string;
    quantity: number;
    price: number;
    // TODO: Attributes
  };
}

const playerRequests = ref([] as PlayerRequest[]);
const loading = ref(true);

// Description filter
const descriptionFilter = ref("");
watch(descriptionFilter, async (_, __) => {
  applyFilters();
});

// Request type filter
const requestTypeFilterOptions = ref([
  { text: "Buy orders", value: "buyOrders" },
  { text: "Help requests", value: "helpRequests" },
] as DropdownOption[]);
const requestTypeFilter = ref([] as string[]);

// Filtering: player
const players = ref([] as DropdownOption[]);
const playerFilter = ref("");
watch(playerFilter, async (_, __) => {
  applyFilters();
});

//
watch(requestTypeFilter, async (_, __) => {
  applyFilters();
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  loading.value = true;
  for (let i = 0; i < 25; i++) {
    playerRequests.value.push({
      id: i,
      playerName: `Player${i}`,
      type: i % 2 === 0 ? "buyOrders" : "helpRequests",
      description: `This is a description for request ${i}. It can be quite long and should wrap properly in the table cell.`,
      createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      buyOrder:
        i % 2 === 0
          ? {
              item: `Item${i}`,
              quantity: (i + 1) * 10,
              price: (i + 1) * 100,
            }
          : undefined,
    });
  }
  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

function applyFilters() {}

function formatRequestType(type: string) {
  if (type === "buyOrders") return "Buy Order";
  if (type === "helpRequests") return "Help Request";
  return type;
}
</script>

<template>
  <div class="flex flex-row flex-wrap justify-between items-end mb-8">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Player Requests</h1>
      <p class="text-gray-300">Buy orders and help requested by players with big projects.</p>
    </div>
  </div>

  <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-start justify-between pb-4">
    <div class="flex flex-row flex-wrap gap-2 items-center">
      <DropdownFilter
        :placeholder="'Request Type'"
        :icon="'fa-solid fa-handshake'"
        :options="requestTypeFilterOptions"
        v-model="requestTypeFilter">
      </DropdownFilter>

      <SearchWithResults
        :placeholder="'Player Name'"
        :icon="'fa-solid fa-user'"
        :items="players"
        @selection="(item) => (playerFilter = item?.value ?? '')"
        @clear="() => (playerFilter = '')">
      </SearchWithResults>

      <SearchBox :placeholder="'Description'" v-model="descriptionFilter"></SearchBox>
    </div>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>
  <div v-else class="relative overflow-x-auto">
    <div class="text-gray-400">
      <div>{{ playerRequests.length }} items</div>
    </div>

    <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
      <thead class="table-head">
        <tr>
          <th class="table-item">
            <span>Created</span>

            <!-- <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('rank', true)" /> -->
          </th>

          <th class="table-item">
            <span>Type</span>
            <!-- <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('name', true)" /> -->
          </th>

          <th class="table-item">
            <span>Player</span>
            <!-- <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsThisWeek', false)" /> -->
          </th>

          <th class="table-item">
            <span>Description</span>
            <!-- <font-awesome-icon icon="fa-solid fa-sort" class="text-xs ml-1 cursor-pointer" @click="sort('visitsTotal', false)" /> -->
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="playerRequest in playerRequests" class="stripped-row">
          <!-- Rank, changes, NEW! -->
          <td class="table-item">
            {{ formatDate(playerRequest.createdAt) }}
          </td>

          <td class="table-item wrap-anywhere">{{ formatRequestType(playerRequest.type) }}</td>
          <td class="table-item wrap-anywhere">{{ playerRequest.playerName }}</td>
          <td class="table-item wrap-anywhere">
            <div v-if="playerRequest.buyOrder">
              {{ playerRequest.buyOrder.quantity }}x {{ playerRequest.buyOrder.item }} for {{ playerRequest.buyOrder.price }}
            </div>
            <div>{{ playerRequest.description }}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
