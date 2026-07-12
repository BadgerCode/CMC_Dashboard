<script setup lang="ts">
import Chart from "@/components/Chart.vue";
import { serverStore } from "@/store/server-state";
import { computed } from "vue";

const players = computed(() => serverStore.players.sort((a, b) => a.name.localeCompare(b.name)));
</script>

<template>
  <div class="mb-8 flex flex-col">
    <h1 class="text-3xl font-bold">Online Players</h1>
  </div>

  <div class="flex flex-row gap-2 flex-wrap mb-8">
    <div v-for="player in players" class="flex flex-col items-center bg-gray-800 p-2">
      <img :src="`https://callmecarson.live/subserver/map/images/skins/3D/${player.uuid}.png`" class="h-[32px] w-[32px]">
      <div>{{ player.name }}</div>
    </div>
  </div>

  <div class="mb-8 flex flex-col">
    <h1 class="text-3xl font-bold">Player Count History</h1>
  </div>

  <div>
    <Chart></Chart>
  </div>
</template>
