<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import Loading from "@/components/Loading.vue";
import PaintingList from "@/components/PaintingList.vue";
import { onMounted, ref } from "vue";
import * as PaintingsAPI from "@/api/paintings/api";

interface Props {
  authorName: string;
}
const props = defineProps<Props>();

const loading = ref(true);
const paintings = ref([] as Painting[]);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadNextPage();
});

async function loadNextPage() {
  if (noMoreResults.value) return;

  // Add last item for pagination
  let lastItem = paintings.value.slice(-1)[0];

  let responseItems = await PaintingsAPI.loadPaintings(props.authorName, lastItem);
  paintings.value.push(...responseItems);
  noMoreResults.value = responseItems.length === 0;
  loading.value = false;
}
</script>

<template>
  <div class="mb-8">
    <RouterLink :to="{ name: 'gallery' }" class="hyperlink"> Gallery </RouterLink>
    <h1 class="text-3xl font-bold">Recent {{ authorName }} paintings</h1>

    <p class="text-gray-300">Paintings created by {{ authorName }}</p>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>

  <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
    <PaintingList :paintings="paintings"></PaintingList>
  </div>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
    <div v-else>No more results</div>
  </div>
</template>
