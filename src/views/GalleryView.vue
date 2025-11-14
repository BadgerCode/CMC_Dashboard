<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import Loading from "@/components/Loading.vue";
import RenderPainting from "@/components/RenderPainting.vue";
import { Config } from "@/config";
import { computed, onMounted, ref } from "vue";

interface Props {
  authorName?: string
}
const props = defineProps<Props>()

const loading = ref(true);
const paintings = ref([] as Painting[]);
const noMoreResults = ref(false);

let showingArtistProfile = computed(() => {
  return props.authorName && props.authorName.length > 0;
});

onMounted(async () => {
  await loadPaintings();
});

async function loadPaintings() {
  if (noMoreResults.value) return;

  const params = new URLSearchParams();

  // Add last item for pagination
  let lastItem = paintings.value.slice(-1)[0];

  if (lastItem != null) {
    params.append("before", lastItem.firstSeenAt);
    params.append("lastID", lastItem.id);
  }

  // Add author name for artist pages
  if (props.authorName != null) {
    params.append("authorName", props.authorName);
  }

  // Send request
  let url = `${Config.APIURL}/api/paintings?${params.toString()}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve paintings");

  let response = await httpResponse.json();

  paintings.value.push(...response.items);
  noMoreResults.value = response.items.length === 0;
  loading.value = false;
}

async function loadNextPage() {
  await loadPaintings();
}
</script>

<template>
  <div class="mb-8">
    <RouterLink :to="{ name: 'gallery' }" class="hyperlink" v-if="showingArtistProfile">
      Gallery
    </RouterLink>
    <h1 class="text-3xl font-bold" v-if="!showingArtistProfile">Recent</h1>
    <h1 class="text-3xl font-bold" v-else>Recent {{ authorName }} paintings</h1>

    <p class="text-gray-300" v-if="!showingArtistProfile">Paintings created by the players of the server</p>
    <p class="text-gray-300" v-else>Paintings created by {{ authorName }}</p>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>

  <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
    <div v-for="painting in paintings" class="painting flex justify-center items-center flex-col gap-2 mb-4">
      <div class="w-full text-center pl-1">
        <div>
          <RouterLink :to="{ name: 'painting', params: { id: painting.id }, }" class="hyperlink">
            {{ painting.title }}
          </RouterLink>
        </div>
      </div>

      <RenderPainting :painting-id="painting.id" :size="painting.size"></RenderPainting>

      <div class="w-full text-center pl-1">
        <div class="text-sm text-gray-300">
          <span>By </span>
          <RouterLink :to="{ name: 'gallery', params: { authorName: painting.authorName } }" class="hyperlink">
            {{ painting.authorName }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>

<style lang="css" scoped>
.painting-wrapper {
  width: 256px;
  height: 256px;
}

.painting-wrapper canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
}

.painting-wrapper canvas.tall {
  width: 50%;
}

.painting-wrapper canvas.wide {
  height: 50%;
}
</style>
