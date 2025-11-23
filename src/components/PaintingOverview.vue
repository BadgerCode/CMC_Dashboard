<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import type { PaintingSaleSummary } from "@/api/paintings/paintingSaleSummary";
import type { SaleSummary } from "@/api/sales/saleSummary";
import { Config } from "@/config";
import { onMounted, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";
import RecentSales from "./RecentSales.vue";
import Loading from "./Loading.vue";

interface Props {
  paintingId: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const paintingData = ref(null as Painting | null);
const paintingSales = ref([] as SaleSummary[]);

onMounted(async () => {
  // Load painting data
  paintingData.value = await fetchPainting(props.paintingId);

  // Load other sales
  paintingSales.value = (await fetchPaintingSales(props.paintingId)).map(
    (s) =>
      ({
        id: s.id,
        occurredAt: s.occurredAt,
        type: s.type,
        itemType: "PAINTING",
        quantity: s.quantity,
        totalPrice: s.totalPrice,
        isEnchanted: false,
        itemAttributes: s.additionalAttributes,
        customName: s.customName,
        insideContainer: s.insideContainer,
      } as SaleSummary)
  );

  loading.value = false;
});

async function fetchPainting(paintingID: string): Promise<Painting | null> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  return response.result;
}

async function fetchPaintingSales(paintingID: string): Promise<PaintingSaleSummary[]> {
  let url = `${Config.APIURL}/api/paintings/${paintingID}/sales`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}
</script>

<template>
  <div class="relative overflow-x-auto text-white flex flex-col gap-2">
    <Loading v-if="loading" :loader-type="'text'"></Loading>
    <div v-else-if="paintingData == null" class="text-center">
      <p>Painting not found.</p>
      <p>Maybe it hasn't been sold yet?</p>
    </div>
    <div v-else class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold">Painting - {{ paintingData.title }}</h2>
      </div>

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-4">
        <div>
          <span>By </span>
          <RouterLink :to="{ name: 'artist', params: { authorName: paintingData.authorName } }" class="hyperlink">
            {{ paintingData.authorName }}
          </RouterLink>
        </div>
        <div class="h-[256px] w-[256px]">
          <RenderPainting :painting-id="paintingData.id"></RenderPainting>
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
