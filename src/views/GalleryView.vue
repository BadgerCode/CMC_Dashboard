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
import SearchBox from "@/components/SearchBox.vue";
import { debounce } from "lodash";
import DropdownFilter from "@/components/DropdownFilter.vue";

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
// Filter- Artist name
const artistName = ref(undefined as string | undefined);
watch(artistName, async (_, __) => {
  loadGallery();
});

// Name filter
const nameFilter = ref("");
watch(nameFilter, async (_, __) => {
  loadGallery();
});

// Size filter
const sizeFilter = ref("");
const sizeOptions = [
  { text: "Small", value: "Small" },
  { text: "Tall", value: "Tall" },
  { text: "Wide", value: "Wide" },
  { text: "Large", value: "Large" },
  { text: "Very Large", value: "MultiCanvas" },
] as DropdownOption[];
watch(sizeFilter, async (_, __) => {
  loadGallery();
});

// Startup
onMounted(async () => {
  artistName.value = props.authorName;
  await loadArtists();
  await loadGallery();
});

async function loadArtists() {
  let httpResponse = await fetch(`${Config.APIURL}/api/artists`);
  if (httpResponse.status !== 200) throw new Error("Failed to retrieve artists");

  let response = await httpResponse.json();
  artists.value = response.items.map((i: ArtistSummary) => ({ text: i.name, value: `${i.name}-${i.id}` } as DropdownOption));
}

const loadGallery = debounce(async () => {
  loading.value = true;
  paintings.value.splice(0);
  noMoreResults.value = false;
  await loadNextPage();
}, 350);

async function loadNextPage() {
  if (noMoreResults.value) return;

  // Add last item for pagination
  let lastItem = paintings.value.slice(-1)[0];

  let responseItems = await PaintingsAPI.loadPaintings(artistName.value, lastItem, nameFilter.value, sizeFilter.value);
  paintings.value.push(...responseItems);
  noMoreResults.value = responseItems.length === 0;
  loading.value = false;
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between mb-2 gap-2">
    <div>
      <RouterLink v-if="props.authorName" :to="{ name: 'gallery' }" class="hyperlink">Back to all paintings</RouterLink>
    </div>
  </div>

  <div class="mb-8">
    <h1 class="text-3xl font-bold" v-if="!props.authorName">Recently Created</h1>
    <h1 class="text-3xl font-bold" v-else>{{ props.authorName }}'s Artwork</h1>

    <p class="text-gray-300" v-if="!props.authorName">Paintings created by the players of the server</p>
    <p class="text-gray-500 text-sm mt-2">Note: Only paintings sold through shops or auctions since Oct 25th will be shown.</p>
  </div>

  <div class="flex flex-col md:flex-row flex-wrap space-y-2 items-start justify-between">
    <div class="flex flex-row flex-wrap flex-1 gap-2">
      <SearchWithResults
        v-if="!props.authorName"
        :items="artists"
        :placeholder="'Artist'"
        :icon="'fa-solid fa-user'"
        @selection="(item) => (artistName = item?.text ?? '')"
        @clear="() => (artistName = '')"></SearchWithResults>

      <DropdownFilter :placeholder="'Size'" :options="sizeOptions" :single-selection="true" v-model="sizeFilter"> </DropdownFilter>
    </div>

    <SearchBox :placeholder="'Painting Name'" v-model="nameFilter"></SearchBox>
  </div>

  <div class="mt-6">
    <Loading v-if="loading" :fill-space="true"></Loading>

    <PaintingList :paintings="paintings"></PaintingList>

    <div class="mt-8 text-center" v-if="!loading">
      <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
      <div v-else>No more results</div>
    </div>
  </div>
</template>
