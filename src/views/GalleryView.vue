<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import Loading from "@/components/Loading.vue";
import PaintingList from "@/components/PaintingList.vue";
import { onMounted, ref, watch } from "vue";
import * as PaintingsAPI from "@/api/paintings/api";
import SearchWithResults from "@/components/SearchWithResults.vue";
import { Config } from "@/config";
import type { DropdownOption } from "@/components/DropdownFilter.vue";
import { useRouter } from "vue-router";

interface ArtistSummary {
  id: string;
  name: string;
  numPaintings: number;
}

// Route stuff
interface Props {
  authorName?: string;
}
const props = defineProps<Props>();
const router = useRouter();

// page properties
const loading = ref(true);
const paintings = ref([] as Painting[]);
const noMoreResults = ref(false);

const artists = ref([] as DropdownOption[]);

// Filters
const artistName = ref(undefined as string | undefined);
watch(artistName, async (newArtistName, __) => {
  router.push({ name: "gallery", params: { authorName: newArtistName } });
});

onMounted(async () => {
  artistName.value = props.authorName;
  await loadArtists();
  await loadNextPage();
});

async function loadArtists() {
  let httpResponse = await fetch(`${Config.APIURL}/api/artists`);
  if (httpResponse.status !== 200) throw new Error("Failed to retrieve artists");

  let response = await httpResponse.json();
  artists.value = response.items.map((i: ArtistSummary) => ({ text: i.name, value: `${i.name}-${i.id}` } as DropdownOption));
}

async function loadNextPage() {
  if (noMoreResults.value) return;

  // Add last item for pagination
  let lastItem = paintings.value.slice(-1)[0];

  let responseItems = await PaintingsAPI.loadPaintings(artistName.value, lastItem);
  paintings.value.push(...responseItems);
  noMoreResults.value = responseItems.length === 0;
  loading.value = false;
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between mb-2 gap-2">
    <div>
      <RouterLink v-if="artistName" :to="{ name: 'gallery' }" class="hyperlink">Back to Gallery </RouterLink>
    </div>

    <div class="self-end">
      <SearchWithResults :items="artists" :placeholder="'Artist'" @selection="(a) => (artistName = a?.text)">
      </SearchWithResults>
    </div>
  </div>

  <div class="mb-8">
    <h1 class="text-3xl font-bold">Recent</h1>

    <p class="text-gray-300" v-if="!artistName">Paintings created by the players of the server</p>
    <p class="text-gray-300" v-else>Paintings created by {{ artistName }}</p>
  </div>

  <Loading v-if="loading" :fill-space="true"></Loading>

  <PaintingList :paintings="paintings"></PaintingList>

  <div class="mt-8 text-center" v-if="!loading">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
    <div v-else>No more results</div>
  </div>
</template>
