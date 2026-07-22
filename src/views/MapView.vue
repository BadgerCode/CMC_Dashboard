<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { initFlowbite } from "flowbite";
import { onMounted, onUpdated, ref } from "vue";

const loading = ref(true);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});
</script>

<template>
  <div class="flex flex-row flex-wrap justify-between items-end mb-8">
    <div class="pb-4">
      <h1 class="text-3xl font-bold">Enchanced Map</h1>
      <p class="text-gray-300">Use the toolbar on the right side of the map to access new features.</p>
    </div>
  </div>

  <div>
    <Loading v-if="loading" :fill-space="true"></Loading>

    <div class="flex h-[75vh]">
      <iframe id="mapFrame" title="World Map" class="grow" src="https://map.smponlinedashboard.com"> </iframe>
    </div>
  </div>

  <div class="mt-8">
    <div class="text-center hint-text">
      Not working? Try the <a href="https://callmecarson.live/subserver/map/" target="_blank" class="hyperlink">Official World Map </a>
    </div>
  </div>
</template>
