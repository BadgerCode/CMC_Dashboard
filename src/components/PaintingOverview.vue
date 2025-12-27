<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import type { SaleSummary } from "@/api/sales/saleSummary";
import { onMounted, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";
import RecentSales from "./RecentSales.vue";
import Loading from "./Loading.vue";
import * as PaintingsAPI from "@/api/paintings/api";
import { formatDate } from "@/utilities/date-format";
import FavouritePainting from "./FavouritePainting.vue";
import { Config } from "@/config";

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

      <div class="w-[400px] my-3 font-normal text-gray-400 flex flex-col gap-1">
        <!-- The painting -->
        <div class="w-[400px] h-[400px]">
          <RenderPainting :painting-id="paintingData.id"></RenderPainting>
        </div>

        <!-- First row -->
        <div class="w-full flex flex-row justify-between items-center px-2 py-1">
          <!-- Artist -->
          <div>
            <span>By </span>
            <RouterLink :to="{ name: 'gallery', params: { authorName: paintingData.authorName } }" class="hyperlink">
              {{ paintingData.authorName }}
            </RouterLink>
          </div>

          <!-- Buttons- favouriting -->
          <div class="text-s">
            <FavouritePainting :painting-id="paintingData.id" :title="paintingData.title"
              :author="paintingData.authorName" v-if="Config.FEATURE_FAVOURITE_PAINTINGS">
            </FavouritePainting>
          </div>
        </div>

        <!-- Second row -->
        <div class="px-2 py-2 border-t border-gray-600 text-sm">
          <!-- Created date -->
          <div>Created {{ formatDate(paintingData.createdAt) }}</div>
        </div>

        <!-- Multi-canvas info -->
        <div v-if="paintingData.isMultiCanvas" class="px-2 py-2 border-t border-gray-600 text-sm">
          This painting is made from multiple canvases.
        </div>
        <div v-else-if="paintingData.collectionId" class="px-2 py-2 border-t border-gray-600 text-sm">
          <div>This painting is is part of a multi-canvas image.</div>
          <div>
            <RouterLink :to="{ name: 'painting', params: { id: paintingData.collectionId } }" class="hyperlink">See here
            </RouterLink>
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
