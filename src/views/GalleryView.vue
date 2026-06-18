<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import Loading from "@/components/Loading.vue";
import PaintingList from "@/components/PaintingList.vue";
import { computed, onMounted, ref, watch } from "vue";
import * as PaintingsAPI from "@/api/paintings/api";
import SearchWithResults from "@/components/SearchWithResults.vue";
import { Config } from "@/config";
import type { DropdownOption } from "@/components/DropdownFilter.vue";
import { useRoute, useRouter } from "vue-router";
import SearchBox from "@/components/SearchBox.vue";
import { debounce } from "lodash";
import DropdownFilter from "@/components/DropdownFilter.vue";
import Checkbox from "@/components/Checkbox.vue";
import { serverStore } from "@/store/server-state";
import { formatNumber } from "@/utilities/number-format";
import { setPageTitle } from "@/router/pageTitle";
import { favouritesStore } from "@/store/favourites-state";
import { userStore } from "@/store/user-state";

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
const route = useRoute();

// page properties
const pageSize = 20;
const loading = ref(false);
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

// Possible multi-canvas filter
const multiCanvasCheckFilter = ref(false);
watch(multiCanvasCheckFilter, async (_, __) => {
  loadGallery();
});

const enableMultiCanvasEditor = computed(() => {
  // Not logged in
  if (userStore.fullUserInfo == null) return false;

  // User has claim to manage any painting
  if (userStore.fullUserInfo.claims.includes("MergeAnyPainting")) return true;

  // Users can merge their own paintings
  return userStore.fullUserInfo.minecraftUsernameVerified && userStore.fullUserInfo.minecraftUsername == artistName.value;
});

// Favourites
const favouritesLoaded = ref(0);
const showFavourites = ref((route.query["favourites"]?.toString()?.toLocaleLowerCase() ?? "") == "true");

// Startup
onMounted(async () => {
  artistName.value = props.authorName;

  if (artistName.value) {
    setPageTitle(`${artistName.value} Art`);
  }

  await loadArtists();
  await loadGallery();
});

async function loadArtists() {
  let httpResponse = await fetch(`${Config.APIURL}/api/artists`);
  if (httpResponse.status !== 200) throw new Error("Failed to retrieve artists");

  let response = await httpResponse.json();
  artists.value = response.items.map((i: ArtistSummary) => ({ text: i.name, value: `${i.name}-${i.id}` }) as DropdownOption);
}

let cancellationSource = new AbortController();
const loadGallery = debounce(async () => {
  // Cancel any in flight requests
  cancellationSource.abort();
  cancellationSource = new AbortController();

  paintings.value.splice(0);
  noMoreResults.value = false;
  favouritesLoaded.value = 0;
  await loadNextPage();
}, 350);

async function loadNextPage() {
  if (noMoreResults.value) return;
  if (loading.value) return;

  loading.value = true;

  // Apply filters
  let filters = {
    lastItem: paintings.value.slice(-1)[0], // Used for pagination
    authorName: artistName.value,
    title: nameFilter.value,
    size: sizeFilter.value,
    onlyPossibleMultiCanvas: multiCanvasCheckFilter.value,
  } as PaintingsAPI.PaintingsFilter;

  // Filter to favourites
  let paintingIdFilter: string[] = [];
  if (showFavourites.value) {
    // Work out the next page of IDs
    let startIndex = favouritesStore.paintings.length - favouritesLoaded.value - 1;
    let endIndex = Math.max(0, startIndex - pageSize + 1);

    for (let i = startIndex; i >= endIndex; i--) {
      const painting = favouritesStore.paintings[i]!;
      paintingIdFilter.push(painting.id);

      // Track our position in favourites
      favouritesLoaded.value++;
    }

    filters = {
      ids: paintingIdFilter,
      // Other filters not currently supported
    };

    // No more favourites to load
    if (paintingIdFilter.length === 0) {
      noMoreResults.value = true;
      loading.value = false;
      return;
    }
  }

  try {
    let responseItems = await PaintingsAPI.loadPaintings(filters, cancellationSource.signal);

    // Order favourite paintings by favourite date
    if (showFavourites.value) {
      responseItems.sort((a, b) => paintingIdFilter.indexOf(a.id) - paintingIdFilter.indexOf(b.id));
    }

    paintings.value.push(...responseItems);
    noMoreResults.value = responseItems.length === 0;
  } catch (error: any) {
    if (error.name != "AbortError") throw error;
  }

  loading.value = false;
}
</script>

<template>
  <div class="flex flex-col mb-2 gap-2">
    <div v-if="props.authorName || showFavourites">
      <RouterLink :to="{ name: 'gallery' }" class="hyperlink">Back to all paintings</RouterLink>
    </div>
  </div>

  <!-- Heading -->
  <div class="flex flex-col md:flex-row flex-wrap space-y-2 items-start justify-between mb-4">
    <div>
      <h1 class="text-3xl font-bold" v-if="props.authorName">{{ props.authorName }}'s Artwork</h1>
      <h1 class="text-3xl font-bold" v-if="showFavourites">My Favourites</h1>
      <h1 class="text-3xl font-bold" v-else>Recently Created</h1>

      <p class="text-gray-300" v-if="!props.authorName && !showFavourites">Paintings created by the players of the server</p>
      <p class="hint-text mt-2" v-if="!showFavourites">Note: Only paintings sold through shops or auctions since Oct 25th 2025 will be shown.</p>
    </div>
    <div>
      <RouterLink v-if="!showFavourites" :to="{ name: 'gallery', query: { favourites: 'true' } }" class="hyperlink"
        >My Favourites</RouterLink
      >
    </div>
  </div>

  <!-- Filter controls -->
  <div class="flex flex-col md:flex-row flex-wrap space-y-2 items-start justify-between" v-if="!showFavourites">
    <div class="flex flex-row flex-wrap flex-1 gap-2">
      <SearchWithResults
        v-if="!props.authorName"
        :items="artists"
        :placeholder="'Artist'"
        :icon="'fa-solid fa-user'"
        @selection="(item) => (artistName = item?.text ?? '')"
        @clear="() => (artistName = '')"></SearchWithResults>

      <DropdownFilter :placeholder="'Size'" :options="sizeOptions" :single-selection="true" v-model="sizeFilter"> </DropdownFilter>

      <Checkbox v-if="enableMultiCanvasEditor" :label="'Possible Multi-Canvas'" v-model="multiCanvasCheckFilter"></Checkbox>
    </div>

    <SearchBox :placeholder="'Painting Name'" v-model="nameFilter"></SearchBox>
  </div>

  <!-- Stats -->
  <div class="hint-text">
    <p v-if="showFavourites">{{ favouritesStore.paintings.length }} paintings</p>
    <p v-else-if="serverStore.loaded && !props.authorName">{{ formatNumber(serverStore.numPaintings, 0) }} total paintings</p>
  </div>

  <!-- Paintings list -->
  <div class="mt-6">
    <PaintingList :paintings="paintings" @reload="loadGallery()" :enable-multi-canvas-editor="enableMultiCanvasEditor"></PaintingList>

    <Loading v-if="loading" :fill-space="true"></Loading>

    <div class="mt-8 text-center" v-if="!loading">
      <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">More</button>
      <div v-else>
        <p v-if="showFavourites && paintings.length == 0">You have no favourites! Go ❤ some paintings first</p>
        <p v-else>No more results</p>
      </div>
    </div>
  </div>
</template>
