<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";
import RecentSales from "./RecentSales.vue";
import Loading from "./Loading.vue";
import * as PaintingsAPI from "@/api/paintings/api";
import { formatDate } from "@/utilities/date-format";

interface Props {
  paintingId: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const paintingData = ref(null as Painting | null);
const paintingSales = ref([] as SaleSummary[]);

onMounted(async () => {
  // Load painting data
  paintingData.value = await PaintingsAPI.fetchPainting(props.paintingId);

  // Load other sales
  paintingSales.value = await PaintingsAPI.fetchPaintingSales(props.paintingId);

  loading.value = false;
});
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <Loading v-if="loading" :loader-type="'text'"></Loading>
    <div v-else-if="paintingData == null" class="text-center">
      <p>Painting not found.</p>
      <p>Maybe it hasn't been sold yet?</p>
    </div>
    <div v-else class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <!-- Title -->
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold">Painting - {{ paintingData.title }}</h2>
      </div>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <!-- Extra info -->
        <div>
          <!-- Artist -->
          <div>
            <span>By </span>
            <RouterLink :to="{ name: 'gallery', params: { authorName: paintingData.authorName } }" class="hyperlink">
              {{ paintingData.authorName }}
            </RouterLink>
          </div>

          <!-- Created date -->
          <div>Created {{ formatDate(paintingData.createdAt) }}</div>
        </div>

        <!-- The painting -->
        <div class="h-[256px] w-[256px]">
          <RenderPainting :painting-id="paintingData.id"></RenderPainting>
        </div>

        <div v-if="paintingData.isMultiCanvas">This painting is made from multiple canvases.</div>
        <div v-else-if="paintingData.collectionId">
          <div>This painting is is part of a multi-canvas image.</div>
          <div>
            <RouterLink :to="{ name: 'painting', params: { id: paintingData.collectionId } }" class="hyperlink">See here </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div v-if="paintingData != null">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">Sales of '{{ paintingData.title }}' painting</h4>

      <Loading v-if="loading" :loader-type="'text'"></Loading>
      <div v-else class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <RecentSales :recent-sales="paintingSales"></RecentSales>
      </div>
    </div>
  </div>
</template>
