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
  <div>
    <Loading v-if="loading" :fill-space="true"></Loading>

    <div class="flex h-[75vh]">
      <iframe id="mapFrame" title="World Map" class="grow" src="https://map.smponlinedashboard.com"> </iframe>
    </div>
  </div>
</template>
